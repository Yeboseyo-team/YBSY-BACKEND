import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { DEMO_PASSWORD, demoUsers } from "@/mocks/dummy-data";

/**
 * 데모 계정 로그인 — 개발 환경(로컬·Vercel 프리뷰) 전용.
 * 팀 결정(2026-10-13): 실제 로그인은 Google만 씁니다. 데모 계정(*@hakgi.test)은 팀원 테스트와 시연용으로
 * VITE_DEMO_LOGIN=true 인 환경에서만 로그인 화면에 버튼을 보여 줍니다. 운영 환경에는 이 값을 넣지 마세요.
 */
export const DEMO_LOGIN_ENABLED = import.meta.env.VITE_DEMO_LOGIN === "true";

/** 로그인 화면에 보여 줄 데모 계정 목록 (이름, 이메일, 어떤 상황을 시험하는 계정인지) */
export const demoAccounts = demoUsers.map(({ email, display_name, persona }) => ({ email, display_name, persona }));

export function useDemoSignIn() {
  return useMutation({
    mutationFn: async (email: string) => {
      if (!DEMO_LOGIN_ENABLED) throw new Error("데모 로그인은 개발 환경에서만 쓸 수 있습니다.");
      if (!demoUsers.some((u) => u.email === email)) throw new Error(`데모 계정이 아닙니다: ${email}`);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: DEMO_PASSWORD });
      if (error) throw error;
      return data;
    },
  });
}
