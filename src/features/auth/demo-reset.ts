import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { clearOnboardingDraft } from "./onboarding-draft";

/** 체험 계정 정새내 (newbie@hakgi.test). 이 계정에서만 [데이터 초기화]가 보이고, DB 함수도 이 계정만 받아 줘요 (10/27) */
export const DEMO_RESET_USER_ID = "a0000000-0000-4000-8000-000000000005";

/** 계획·자격증·기록·학기 설정을 모두 지우고 온보딩 첫 화면으로. 캐시가 남지 않게 페이지를 새로 열어요 */
export function useResetDemoAccount(userId: string | undefined) {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("reset_demo_account");
      if (error) throw error;
    },
    onSuccess: () => {
      clearOnboardingDraft(userId);
      window.location.assign("/onboarding");
    },
  });
}
