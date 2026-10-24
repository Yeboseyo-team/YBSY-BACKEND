// 사용자 지정 계획 유형 훅 (10/24 QA) — 예: "결혼식", "알바". 이름만 두고 시간은 계획마다 직접 넣어요.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/auth-context";
import type { PlanCategory } from "@/types/database";
import { planKeys } from "./api";
import { MAX_CATEGORIES } from "./defaults";

export const categoryKeys = {
  all: (userId: string) => ["plan-categories", userId] as const,
};

/** 유형 저장 오류를 화면 문구로 */
export function toCategoryMessage(error: unknown): string {
  if (error instanceof TypeError) return "서버에 연결하지 못했어요. 인터넷 연결을 확인하세요.";
  const code = (error as { code?: string } | null)?.code;
  if (code === "P0032") return `내 유형은 ${MAX_CATEGORIES}개까지 만들 수 있어요.`;
  if (code === "23505") return "같은 이름의 유형이 이미 있어요.";
  if (code === "23514") return "유형 이름은 1~10자로 써 주세요.";
  return "유형을 저장하지 못했어요. 잠시 뒤 다시 시도하세요.";
}

/** 내가 만든 유형 (만든 순서) */
export function usePlanCategories() {
  const { user } = useAuth();
  return useQuery({
    queryKey: categoryKeys.all(user?.id ?? "anonymous"),
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<PlanCategory[]> => {
      const { data, error } = await supabase.from("plan_categories").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCategory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string): Promise<PlanCategory> => {
      const { data, error } = await supabase.from("plan_categories").insert({ name: name.trim() }).select().single();
      if (error) throw error;
      return data;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all(user?.id ?? "anonymous") }),
  });
}

/** 유형 삭제. 그 유형의 계획은 지워지지 않고 "기타"로 남아요. */
export function useDeleteCategory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("plan_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSettled: () => {
      const userId = user?.id ?? "anonymous";
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all(userId) });
      void queryClient.invalidateQueries({ queryKey: planKeys.all(userId) });
    },
  });
}
