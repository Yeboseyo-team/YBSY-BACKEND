// 실제로 한 시간 기록 훅 (10/26 피드백) — 하루 할 일 화면에서 "실제로 한 시간"을 넣으면
// 같은 계획의 남은 일정이 다시 계산돼요 (calc.ts 의 applyLogs). 화면은 이 훅만 쓰고 supabase 를 직접 부르지 않습니다.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/auth-context";
import type { StudyLogRow } from "@/types/database";

export const logKeys = {
  all: (userId: string) => ["study_logs", userId] as const,
};

export interface LogInput {
  plan_id?: string | null;
  certificate_id?: string | null;
  /** "YYYY-MM-DD" */
  date: string;
  /** 실제로 한 시간 (0~24) */
  hours: number;
}

export function toLogMessage(error: unknown): string {
  if (error instanceof TypeError) return "서버에 연결하지 못했어요. 인터넷 연결을 확인하세요.";
  const code = (error as { code?: string } | null)?.code;
  if (code === "23514") return "시간은 0~24시간 사이로 넣어 주세요.";
  if (code === "42P01" || code === "PGRST205") return "아직 기록 기능이 준비되지 않았어요. 잠시 뒤 다시 시도하세요.";
  return "기록을 저장하지 못했어요. 잠시 뒤 다시 시도하세요.";
}

/** 내 기록 전부 (학기 하나라 많지 않아요). 표가 아직 없으면 빈 목록처럼 동작하도록 화면에서 오류를 무시해도 돼요 */
export function useStudyLogs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: logKeys.all(user?.id ?? "anonymous"),
    enabled: Boolean(user),
    retry: false,
    queryFn: async (): Promise<StudyLogRow[]> => {
      const { data, error } = await supabase.from("study_logs").select("*").order("date");
      if (error) throw error;
      return data;
    },
  });
}

/** 하루치 기록 저장 (같은 날 같은 일은 덮어쓰기) */
export function useSaveLog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const key = logKeys.all(user?.id ?? "anonymous");
  return useMutation({
    mutationFn: async ({ plan_id = null, certificate_id = null, date, hours }: LogInput) => {
      // unique (user_id, plan_id, certificate_id, date) — 있으면 고치고 없으면 넣기
      let query = supabase.from("study_logs").select("id").eq("date", date);
      query = plan_id ? query.eq("plan_id", plan_id) : query.is("plan_id", null);
      query = certificate_id ? query.eq("certificate_id", certificate_id) : query.is("certificate_id", null);
      const { data: existing, error: findError } = await query.maybeSingle();
      if (findError) throw findError;
      const { error } = existing
        ? await supabase.from("study_logs").update({ hours }).eq("id", existing.id)
        : await supabase.from("study_logs").insert({ plan_id, certificate_id, date, hours });
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

/** 기록 지우기 (계획대로로 되돌리기) */
export function useDeleteLog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const key = logKeys.all(user?.id ?? "anonymous");
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("study_logs").delete().eq("id", id);
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
