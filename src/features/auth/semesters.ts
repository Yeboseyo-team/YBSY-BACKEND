// 학기 목록·바꾸기 (10/29) — 이번 학기 ↔ 다음 학기를 오가요.
// 계획·자격증·기록은 DB(RLS)가 "지금 학기" 것만 보여 줘서, 학기를 바꾸면 페이지를 새로 열기만 하면 돼요.
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Semester } from "@/types/database";
import { useAuth } from "./auth-context";
import { clearOnboardingDraft } from "./onboarding-draft";

export const semesterKeys = {
  all: (userId: string) => ["semesters", userId] as const,
};

/** "2026년 2학기" — 개강 달이 7월 이후면 2학기, 그 전이면 1학기. 개강일이 없으면 설정 중 */
export function semesterLabel(semester: Pick<Semester, "semester_start">): string {
  if (!semester.semester_start) return "새 학기 (설정 중)";
  const [y, m] = semester.semester_start.split("-").map(Number);
  return `${y}년 ${m >= 7 ? 2 : 1}학기`;
}

/** 내 학기 목록 (개강일 순, 설정 중인 학기는 맨 뒤) */
export function useSemesters() {
  const { user } = useAuth();
  return useQuery({
    queryKey: semesterKeys.all(user?.id ?? "anonymous"),
    enabled: !!user,
    queryFn: async (): Promise<Semester[]> => {
      const { data, error } = await supabase.from("semesters").select("*").order("semester_start", { ascending: true, nullsFirst: false }).order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

/** 학기 바꾸기 — 그 학기 설정을 불러오고 페이지를 새로 열어요 (캐시가 남지 않게) */
export function useSwitchSemester() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (target: string) => {
      const { error } = await supabase.rpc("switch_semester", { target });
      if (error) throw error;
    },
    onSuccess: () => {
      clearOnboardingDraft(user?.id);
      window.location.assign("/");
    },
  });
}
