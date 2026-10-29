import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { clearOnboardingDraft } from "./onboarding-draft";

/**
 * 다음 학기 시작 (10/28, 10/29 학기별 저장) — 지금 학기는 그대로 보관하고 새 학기를 만들어 온보딩으로 (DB 함수 start_next_semester).
 * 쓸 수 있는 시간·공부 스타일·시험 주차는 이어서 써서 온보딩에 미리 채워져요. 위쪽 학기 메뉴(SemesterSwitcher)로 오가요.
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
