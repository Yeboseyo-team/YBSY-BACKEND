// 프로필(학기 설정) 저장 훅 — 온보딩(S-07, FR-01-11)과 설정(S-12, FR-01-12)에서 사용.
// 불러오기는 ./api.ts 의 useProfile(userId) 를 그대로 씁니다.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";
import { useAuth } from "./auth-context";
import { profileKeys } from "./api";
import { toMonday } from "./onboarding";

export interface ProfileInput {
  display_name?: string;
  /** 주당 가용 시간 1~168 */
  available_hours?: number;
  /** 학기 시작일 "YYYY-MM-DD". 월요일이 아니면 그 주 월요일로 바꿔 저장합니다 */
  semester_start?: string;
  /** 1~20, 기본 8 */
  midterm_week?: number;
  /** 1~20, 기본 15 */
  final_week?: number;
  /**
   * true 면 개인정보 수집·이용 동의를 기록합니다 (NFR-LEGAL-1).
   * 동의 시각은 DB 트리거가 서버 시각으로 한 번만 기록하고, 이후에는 바뀌지 않아요.
   */
  agree_privacy?: boolean;
}

/** 프로필 저장 오류를 화면에 보여 줄 한국어 문장으로 (NFR-USE-2) */
export function toProfileMessage(error: unknown): string {
  if (error instanceof TypeError) return "서버에 연결하지 못했어요. 인터넷 연결을 확인하세요.";
  const code = (error as { code?: string } | null)?.code;
  if (code === "23514") return "입력값을 확인하세요. 가용 시간은 1~168시간, 시험 주차는 1~20주차, 이름은 40자까지예요.";
  return "설정을 저장하지 못했어요. 잠시 뒤 다시 시도하세요.";
}

/**
 * 학기 설정·이름·동의 저장. 넘긴 값만 바뀝니다.
 * 온보딩 예: mutate({ available_hours: 50, semester_start: "2026-08-31", midterm_week: 8, final_week: 15, agree_privacy: true })
 * 저장되면 프로필 캐시가 바뀌어 온보딩 가드와 예보가 새 값으로 다시 판단합니다.
 */
export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const key = profileKeys.detail(user?.id ?? "anonymous");
  return useMutation({
    mutationFn: async ({ agree_privacy, semester_start, display_name, ...rest }: ProfileInput): Promise<Profile> => {
      if (!user) throw new Error("로그인이 필요해요.");
      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...rest,
          ...(display_name !== undefined ? { display_name: display_name.trim() } : {}),
          ...(semester_start !== undefined ? { semester_start: toMonday(semester_start) } : {}),
          ...(agree_privacy ? { privacy_agreed_at: new Date().toISOString() } : {}),
        })
        .eq("user_id", user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (profile) => queryClient.setQueryData(key, profile),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
