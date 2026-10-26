// 계획 입력 검사 (F-02) — DB 제약(5.2)과 같은 규칙을 화면에서 먼저 확인합니다.
// 10/24 QA: 기간은 날짜로 고르고(주차는 자동 계산), 학점 1~12 직접 입력(10/26 상한 6 → 12), 시험 없는 수업, 우선순위, 사용자 지정 유형
import { z } from "zod";
import { weeksFromDates } from "@/features/forecast/calc";
import type { PlanInput } from "./api";
import { CREDITS_RANGE } from "./defaults";

const isoDate = z
  .string({ invalid_type_error: "날짜를 고르세요." })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜를 달력에서 고르세요.");

/** 학기 시작일을 알아야 "학기 안의 날짜인지" 확인할 수 있어서 함수로 만듭니다. */
export function makePlanSchema(semesterStart: string | null) {
  return z
    .object({
      title: z.string().trim().min(1, "이름을 입력하세요.").max(30, "이름은 30자까지 쓸 수 있어요."),
      type: z.enum(["class", "activity", "project", "custom"]),
      category_id: z.string().nullable(),
      credits: z
        .number({ invalid_type_error: "학점을 숫자로 입력하세요." })
        .int("학점은 정수로 입력하세요.")
        .min(CREDITS_RANGE.min, `학점은 ${CREDITS_RANGE.min}~${CREDITS_RANGE.max}로 입력하세요.`)
        .max(CREDITS_RANGE.max, `학점은 ${CREDITS_RANGE.min}~${CREDITS_RANGE.max}로 입력하세요.`)
        .nullable(),
      load_level: z.enum(["low", "normal", "high", "custom"]),
      start_date: isoDate,
      end_date: isoDate,
      hours_per_week: z
        .number({ invalid_type_error: "한 주에 쓰는 시간을 숫자로 입력하세요." })
        .min(0.5, "0.5시간 이상 입력하세요.")
        .max(60, "한 주에 60시간까지 넣을 수 있어요.")
        .refine((h) => Number.isInteger(h * 2), "0.5시간 단위로 입력하세요."),
      priority: z.enum(["high", "normal", "low"]),
      no_exam: z.boolean(),
    })
    .refine((d) => d.start_date <= d.end_date, { path: ["end_date"], message: "끝나는 날은 시작하는 날과 같거나 뒤로 고르세요." })
    .refine((d) => !semesterStart || weeksFromDates(d.start_date, d.end_date, semesterStart) !== null, {
      path: ["end_date"],
      message: "학기(1~16주차) 안에 걸치는 날짜를 고르세요.",
    })
    .refine((d) => d.type !== "class" || d.credits !== null, { path: ["credits"], message: "학점을 입력하세요." })
    .refine((d) => d.type !== "custom" || d.category_id !== null, { path: ["category_id"], message: "내 유형을 고르세요." });
}

export type PlanFormValues = z.infer<ReturnType<typeof makePlanSchema>>;

/** 폼 값 → 저장할 값. 날짜에서 주차를 계산해 함께 넣어요 (학기 밖 날짜는 1·16주차로 잘림). */
export function toPlanInput(values: PlanFormValues, semesterStart: string): PlanInput {
  const weeks = weeksFromDates(values.start_date, values.end_date, semesterStart) ?? { start_week: 1, end_week: 1 };
  return {
    title: values.title.trim(),
    type: values.type,
    credits: values.type === "class" ? values.credits : null,
    load_level: values.type === "custom" ? "custom" : values.load_level,
    start_week: weeks.start_week,
    end_week: weeks.end_week,
    hours_per_week: values.hours_per_week,
    start_date: values.start_date,
    end_date: values.end_date,
    priority: values.priority,
    category_id: values.type === "custom" ? values.category_id : null,
    no_exam: values.type === "class" ? values.no_exam : false,
  };
}
