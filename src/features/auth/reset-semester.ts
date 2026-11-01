import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { clearOnboardingDraft } from "./onboarding-draft";

/** 초기화 오류를 화면 안내 문구로 변환 */
export function toResetSemesterMessage(error: unknown): string {
  if (error instanceof TypeError) return "서버에 연결하지 못했어요. 인터넷 연결을 확인하세요.";
  return "이번 학기를 초기화하지 못했어요. 잠시 뒤 다시 시도하세요.";
}

/**
 * 이번 학기 초기화 (11/01) — 현재 학기의 계획·자격증·공부 기록을 지우고 온보딩 화면으로 이동 (DB 함수 reset_current_semester).
 * 캐시가 남지 않게 페이지를 새로 열어요.
 */
export function useResetCurrentSemester(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("reset_current_semester");
      if (error) throw error;
    },
    onSuccess: async () => {
      clearOnboardingDraft(userId);
      await queryClient.invalidateQueries();
      window.location.assign("/onboarding");
    },
  });
}
