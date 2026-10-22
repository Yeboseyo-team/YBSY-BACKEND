import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";

// 팀 결정(2026-10-13): 로그인은 Google만 (docs/AUTH.md). 데모 계정 로그인은 ./demo.ts

const RETURN_TO_KEY = "hakgi:returnTo";
const origin = () => window.location.origin;

/** 소셜 로그인처럼 페이지를 떠났다 돌아오는 흐름에서 원래 가려던 경로를 보관 */
export const returnTo = {
  save(path: string | undefined) {
    if (path && path.startsWith("/") && !path.startsWith("//")) sessionStorage.setItem(RETURN_TO_KEY, path);
  },
  take(): string {
    const path = sessionStorage.getItem(RETURN_TO_KEY);
    sessionStorage.removeItem(RETURN_TO_KEY);
    return path && path.startsWith("/") && !path.startsWith("//") ? path : "/";
  },
};

export function useGoogleSignIn() {
  return useMutation({
    mutationFn: async (from?: string) => {
      returnTo.save(from);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${origin()}/auth/callback` },
      });
      if (error) throw error;
      // 성공하면 브라우저가 구글로 이동하므로 이후 코드는 실행되지 않습니다.
    },
  });
}

export function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  });
}

export const profileKeys = {
  detail: (userId: string) => ["profile", userId] as const,
};

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.detail(userId ?? "anonymous"),
    enabled: Boolean(userId),
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
