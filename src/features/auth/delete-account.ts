import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { clearOnboardingDraft } from "./onboarding-draft";

/** 데모 계정(@hakgi.test)은 탈퇴를 막아요 (DB 함수도 같은 기준) */
export const isDemoEmail = (email: string | undefined) => Boolean(email?.endsWith("@hakgi.test"));

/** 탈퇴 오류를 화면 문장으로 */
export function toDeleteAccountMessage(error: unknown): string {
  if (error instanceof TypeError) return "서버에 연결하지 못했어요. 인터넷 연결을 확인하세요.";
  const code = (error as { code?: string } | null)?.code;
  if (code === "P0040") return "데모 계정은 탈퇴할 수 없어요. 데이터 초기화를 써 주세요.";
  return "탈퇴하지 못했어요. 잠시 뒤 다시 시도하세요.";
}

/**
 * 회원 탈퇴 (10/28) — 로그인 계정을 지우면 계획·자격증·기록·학기 설정 등 모든 정보가 함께 지워져요 (DB 함수 delete_my_account).
 * 지운 뒤 이 브라우저에 남은 로그인 정보·온보딩 초안도 지우고 로그인 화면으로.
 */
export function useDeleteMyAccount(userId: string | undefined) {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("delete_my_account");
      if (error) throw error;
    },
    onSuccess: async () => {
      clearOnboardingDraft(userId);
      // 계정이 이미 없어서 서버 로그아웃은 실패할 수 있어요. 이 브라우저의 로그인 정보만 지우면 돼요
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      window.location.assign("/login");
    },
  });
}
