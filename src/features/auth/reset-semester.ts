import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { clearOnboardingDraft } from "./onboarding-draft";

/**
 * 이번 학기 초기화 (11/01) — 현재 학기의 계획·자격증·공부 기록을 지우고 온보딩 화면으로 이동.
 * DB 함수(reset_current_semester) 하나로 한꺼번에 처리해서, 실패하면 아무것도 지워지지 않아요.
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
