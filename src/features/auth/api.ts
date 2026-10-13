import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";
import type { ForgotPasswordValues, ResetPasswordValues, SemesterValues, SignInValues, SignUpValues } from "./schemas";
import { mondayOf } from "./semester";

const RETURN_TO_KEY = "hakgi:returnTo";
const origin = () => window.location.origin;

/** 소셜 로그인처럼 페이지를 떠났다 돌아오는 흐름에서 원래 가려던 경로를 보관 */
export const returnTo = {
  save(path: string | undefined) {
    if (path && path.startsWith("/")) sessionStorage.setItem(RETURN_TO_KEY, path);
  },
  take(): string {
    const path = sessionStorage.getItem(RETURN_TO_KEY);
    sessionStorage.removeItem(RETURN_TO_KEY);
    return path && path.startsWith("/") && !path.startsWith("//") ? path : "/";
  },
};

export function useSignIn() {
  return useMutation({
    mutationFn: async ({ email, password }: SignInValues) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: async ({ email, password, displayName }: SignUpValues) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin()}/auth/callback`,
          data: { display_name: displayName },
        },
      });
      if (error) throw error;
      // 이메일 인증을 켜 두면 session이 null로 옵니다.
      return { needsEmailConfirm: !data.session, email };
    },
  });
}

export function useResendSignUpEmail() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${origin()}/auth/callback` },
      });
      if (error) throw error;
    },
  });
}

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

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async ({ email }: ForgotPasswordValues) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin()}/auth/reset-password`,
      });
      if (error) throw error;
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async ({ password }: ResetPasswordValues) => {
      const { error } = await supabase.auth.updateUser({ password });
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

/** 학기 설정 저장 (온보딩 FR-01-11, 설정 FR-01-12). 개강일은 그 주의 월요일로 맞춰 저장합니다. */
export function useUpdateProfile(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: SemesterValues) => {
      if (!userId) throw new Error("로그인이 필요합니다.");
      const { data, error } = await supabase
        .from("profiles")
        .update({
          semester_start: mondayOf(values.semesterStart),
          available_hours: values.availableHours,
          midterm_week: values.midtermWeek,
          final_week: values.finalWeek,
        })
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId ?? "anonymous") }),
  });
}
