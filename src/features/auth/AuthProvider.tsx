import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AuthContext, type AuthStatus } from "./auth-context";

/**
 * 세션의 단일 출처(single source of truth).
 *
 * supabase-js는 구독 직후 INITIAL_SESSION 이벤트를 한 번 보내고,
 * 이후 로그인·로그아웃·토큰 갱신마다 이벤트를 보냅니다.
 * URL에 ?code= 가 있으면 교환이 끝난 뒤에 INITIAL_SESSION이 오므로
 * 이메일 인증·구글 로그인 콜백도 여기서 한 번에 처리됩니다.
 *
 * 주의: 콜백 안에서 다른 supabase 호출을 await 하면 교착이 생길 수 있어
 * 상태만 바꾸고, 데이터 조회는 TanStack Query에 맡깁니다.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      setStatus(next ? "authenticated" : "unauthenticated");

      if (event === "PASSWORD_RECOVERY") setIsRecovery(true);
      if (event === "USER_UPDATED" || event === "SIGNED_OUT") setIsRecovery(false);

      if (event === "SIGNED_OUT") {
        // 다른 사용자의 캐시가 남지 않도록 서버 상태를 전부 비움
        queryClient.clear();
      }
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  const value = useMemo(
    () => ({ status, session, user: session?.user ?? null, isRecovery }),
    [status, session, isRecovery],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
