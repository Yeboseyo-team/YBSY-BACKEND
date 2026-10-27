import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { clearOnboardingDraft } from "./onboarding-draft";

/**
 * 데이터 초기화 (10/27) — 계획·자격증·기록·학기 설정을 지우고 초기 설정(온보딩)으로.
 * 개인정보 동의와 AI 하루 횟수는 그대로예요 (체험 계정 정새내만 시연용으로 그것까지 지워요, DB 함수 reset_my_data).
 * 캐시가 남지 않게 페이지를 새로 열어요.
 */
export function useResetMyData(userId: string | undefined) {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("reset_my_data");
      if (error) throw error;
    },
    onSuccess: () => {
      clearOnboardingDraft(userId);
      window.location.assign("/onboarding");
    },
  });
}
