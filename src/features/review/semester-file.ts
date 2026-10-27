// 학기 회고 파일 (10/24 QA) — 이번 학기 계획·설정을 파일로 내려받고, 다음 학기에 다시 불러옵니다.
// 파일 형식은 JSON 하나. 날짜는 학기마다 다르니 주차(1~16)로 저장하고, 불러올 때 새 학기 주차에 그대로 넣어요.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/auth-context";
import { profileKeys } from "@/features/auth/api";
import { summarizeSemester, TOTAL_WEEKS, type Forecast } from "@/features/forecast/calc";
import { planKeys } from "@/features/plans/api";
import { categoryKeys } from "@/features/plans/categories";
import { MAX_PLANS } from "@/features/plans/defaults";
import type { Plan, PlanCategory, Profile } from "@/types/database";

const FILE_KIND = "hakgi-yebo-semester";

const week = z.number().int().min(1).max(TOTAL_WEEKS);
const fileSchema = z.object({
  kind: z.literal(FILE_KIND),
  version: z.literal(1),
  exported_at: z.string(),
  semester: z.object({
    semester_start: z.string().nullable(),
    midterm_week: week,
    final_week: week,
    daily_hours: z.array(z.number().int().min(0).max(24)).length(7).nullable(),
  }),
  categories: z.array(z.object({ name: z.string().min(1).max(10) })).max(10),
  plans: z
    .array(
      z.object({
        title: z.string().min(1).max(30),
        type: z.enum(["class", "activity", "project", "custom"]),
        category: z.string().nullable(),
        credits: z.number().int().min(1).max(12).nullable(),
        no_exam: z.boolean().optional(),
        study_days: z.array(z.number().int().min(0).max(6)).max(7).nullable().optional(),
        load_level: z.enum(["low", "normal", "high", "custom"]),
        start_week: week,
        end_week: week,
        hours_per_week: z.number().min(0.5).max(60),
        priority: z.enum(["high", "normal", "low"]),
      }),
    )
    .max(MAX_PLANS),
  summary: z.unknown().optional(),
});

export type SemesterFile = z.infer<typeof fileSchema>;

/** 지금 학기를 파일 내용으로 */
export function buildSemesterFile(
  profile: Pick<Profile, "semester_start" | "midterm_week" | "final_week" | "daily_hours">,
  plans: Plan[],
  categories: PlanCategory[],
  forecast: Forecast | null,
): SemesterFile {
  const nameOf = new Map(categories.map((c) => [c.id, c.name]));
  const summary = forecast ? summarizeSemester(forecast) : null;
  return {
    kind: FILE_KIND,
    version: 1,
    exported_at: new Date().toISOString(),
    semester: {
      semester_start: profile.semester_start,
      midterm_week: profile.midterm_week,
      final_week: profile.final_week,
      daily_hours: profile.daily_hours,
    },
    categories: categories.map((c) => ({ name: c.name })),
    plans: plans.map((p) => ({
      title: p.title,
      type: p.type as SemesterFile["plans"][number]["type"],
      category: p.category_id ? (nameOf.get(p.category_id) ?? null) : null,
      credits: p.credits,
      no_exam: p.no_exam,
      study_days: p.study_days,
      load_level: p.load_level as SemesterFile["plans"][number]["load_level"],
      start_week: p.start_week,
      end_week: p.end_week,
      hours_per_week: Number(p.hours_per_week),
      priority: p.priority as SemesterFile["plans"][number]["priority"],
    })),
    summary: summary
      ? {
          total_hours: summary.total_hours,
          average_hours: summary.average_hours,
          busiest_week: summary.busiest.week,
          busiest_hours: summary.busiest.total_hours,
          weeks: forecast!.weeks.map((w) => ({ week: w.week, hours: w.total_hours, level: w.level })),
        }
      : undefined,
  };
}

/** 브라우저에서 파일로 저장 */
export function downloadSemesterFile(file: SemesterFile) {
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `학기예보_${(file.semester.semester_start ?? "학기").slice(0, 7)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export class SemesterFileError extends Error {}

/** 파일 내용 검사. 학기예보에서 내려받은 파일이 아니면 SemesterFileError */
export function parseSemesterFile(text: string): SemesterFile {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new SemesterFileError("파일을 읽지 못했어요. 학기예보에서 내려받은 .json 파일인지 확인하세요.");
  }
  const parsed = fileSchema.safeParse(json);
  if (!parsed.success) throw new SemesterFileError("학기예보 회고 파일이 아니거나 내용이 손상됐어요.");
  return parsed.data;
}

export function toImportMessage(error: unknown): string {
  if (error instanceof SemesterFileError) return error.message;
  if (error instanceof TypeError) return "서버에 연결하지 못했어요. 인터넷 연결을 확인하세요.";
  const code = (error as { code?: string } | null)?.code;
  if (code === "P0030") return `계획은 ${MAX_PLANS}개까지예요. 지금 계획을 줄이거나 일부만 넣어 주세요.`;
  if (code === "P0032") return "내 유형은 10개까지예요. 쓰지 않는 유형을 지운 뒤 다시 불러오세요.";
  return "불러오지 못했어요. 잠시 뒤 다시 시도하세요.";
}

/**
 * 파일의 계획을 지금 학기에 더합니다 (지우지 않고 추가). 같은 주차 그대로 들어가고 날짜는 비워 둬요.
 * withDailyHours 면 요일별 가용 시간·시험 주차도 파일 값으로 바꿔요.
 */
export function useImportSemesterFile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? "anonymous";
  return useMutation({
    mutationFn: async ({ file, existingPlans, withSettings }: { file: SemesterFile; existingPlans: number; withSettings: boolean }) => {
      if (existingPlans + file.plans.length > MAX_PLANS) {
        throw new SemesterFileError(
          `계획이 ${existingPlans}개 있어 파일의 ${file.plans.length}개를 다 넣으면 ${MAX_PLANS}개를 넘어요. 끝난 계획을 지운 뒤 불러오세요.`,
        );
      }
      // 1) 내 유형: 이름이 같은 게 없으면 만들기
      const { data: current, error: listError } = await supabase.from("plan_categories").select("*");
      if (listError) throw listError;
      const idByName = new Map((current ?? []).map((c) => [c.name, c.id]));
      const missing = [...new Set(file.plans.filter((p) => p.type === "custom" && p.category).map((p) => p.category!))].filter(
        (name) => !idByName.has(name),
      );
      if (missing.length > 0) {
        const { data: created, error } = await supabase.from("plan_categories").insert(missing.map((name) => ({ name }))).select();
        if (error) throw error;
        for (const c of created ?? []) idByName.set(c.name, c.id);
      }
      // 2) 계획
      if (file.plans.length > 0) {
        const rows = file.plans.map((p) => {
          const category_id = p.type === "custom" && p.category ? (idByName.get(p.category) ?? null) : null;
          return {
            title: p.title,
            type: p.type === "custom" && !category_id ? "activity" : p.type,
            category_id,
            credits: p.type === "class" ? p.credits : null,
            no_exam: p.type === "class" ? (p.no_exam ?? false) : false,
            study_days: p.study_days?.length ? p.study_days : null,
            load_level: p.load_level,
            start_week: Math.min(p.start_week, p.end_week),
            end_week: p.end_week,
            hours_per_week: p.hours_per_week,
            priority: p.priority,
          };
        });
        const { error } = await supabase.from("plans").insert(rows);
        if (error) throw error;
      }
      // 3) 설정 (선택)
      if (withSettings && user) {
        const { daily_hours, midterm_week, final_week } = file.semester;
        const { error } = await supabase
          .from("profiles")
          .update({
            midterm_week,
            final_week,
            ...(daily_hours ? { daily_hours, available_hours: daily_hours.reduce((a, b) => a + b, 0) } : {}),
          })
          .eq("user_id", user.id);
        if (error) throw error;
      }
      return file.plans.length;
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: planKeys.all(userId) });
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all(userId) });
      void queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
    },
  });
}
