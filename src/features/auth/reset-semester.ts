import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { clearOnboardingDraft } from "./onboarding-draft";

/** 초기화 오류를 화면 안내 문구로 변환 */
export function toResetSemesterMessage(error: unknown): string {
  if (error instanceof TypeError) return "서버에 연결하지 못했어요. 인터넷 연결을 확인하세요.";
  const msg = (error as { message?: string } | null)?.message;
  if (msg?.includes("reset_current_semester")) {
    return "DB에 초기화 함수가 아직 등록되지 않았습니다. 잠시 후 폴백으로 처리됩니다.";
  }
  return "이번 학기를 초기화하지 못했어요. 잠시 뒤 다시 시도하세요.";
}

/**
 * 이번 학기 초기화 (11/01) — 현재 학기의 계획·자격증·공부 기록을 지우고 온보딩 화면으로 이동.
 * 1) DB RPC 함수(reset_current_semester)를 먼저 호출합니다.
 * 2) RPC가 아직 원격 DB에 배포되지 않은 경우, 클라이언트 RLS 기반 쿼리로 직접 안전하게 초기화합니다.
 */
export function useResetCurrentSemester(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("로그인이 필요해요.");

      // 1) RPC 함수 실행 시도
      const { error: rpcError } = await supabase.rpc("reset_current_semester");

      // RPC가 정상 실행되었으면 성공
      if (!rpcError) return;

      console.warn("RPC reset_current_semester 미등록 또는 실패, 클라이언트 폴백 실행:", rpcError);

      // 2) RPC 미등록 시 클라이언트 RLS 기반 직접 초기화 폴백
      // 계획, 공부 기록, 선택한 자격증 삭제
      const [logsRes, plansRes, certsRes] = await Promise.all([
        supabase.from("study_logs").delete().eq("user_id", userId),
        supabase.from("plans").delete().eq("user_id", userId),
        supabase.from("user_certificates").delete().eq("user_id", userId),
      ]);

      if (logsRes.error) console.error("study_logs 삭제 오류:", logsRes.error);
      if (plansRes.error) console.error("plans 삭제 오류:", plansRes.error);
      if (certsRes.error) console.error("user_certificates 삭제 오류:", certsRes.error);

      // 프로필의 학기 설정 초기화 -> 온보딩 가드(isOnboardingDone)가 false가 되어 /onboarding 으로 보냄
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          semester_start: null,
          available_hours: null,
          daily_hours: null,
          midterm_week: 8,
          final_week: 15,
          study_style: "steady",
        })
        .eq("user_id", userId);

      if (profileError) {
        console.error("profiles 업데이트 오류:", profileError);
        throw profileError;
      }
    },
    onSuccess: async () => {
      clearOnboardingDraft(userId);
      await queryClient.invalidateQueries();
      window.location.assign("/onboarding");
    },
  });
}
