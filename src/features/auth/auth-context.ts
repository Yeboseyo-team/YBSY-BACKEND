import { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  /** 비밀번호 재설정 링크로 들어와 임시 세션이 생긴 상태 */
  isRecovery: boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 <AuthProvider> 안에서만 쓸 수 있습니다.");
  return ctx;
}
