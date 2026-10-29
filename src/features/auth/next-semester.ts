import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { clearOnboardingDraft } from "./onboarding-draft";

/**
 * 다음 학기 시작 (10/28, "데이터 초기화" 대신) — 계획·공부 기록·시험이 지난 자격증·개강일을 정리하고 온보딩으로.
 * 쓸 수 있는 시간·공부 스타일·시험 주차·내 유형·앞으로 볼 자격증은 그대로 둬서 온보딩에 미리 채워져요 (DB 함수 start_next_semester).
 * 체험 계정 정새내는 시연용으로 전부 지워요. 캐시가 남지 않게 페이지를 새로 열어요.
 */
export function useStartNextSemester(userId: string | undefined) {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("start_next_semester");
      if (error) throw error;
    },
    onSuccess: () => {
      clearOnboardingDraft(userId);
      window.location.assign("/onboarding");
    },
  });
}
