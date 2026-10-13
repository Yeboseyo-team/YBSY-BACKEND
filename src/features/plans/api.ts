import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/auth-context";
import { MAX_PLANS } from "./schemas";
import { toPlanRecord } from "./mappers";
import type { PlanInput, PlanRecord } from "./types";

export const planKeys = {
  all: (userId: string) => ["plans", userId] as const,
};

export class PlanLimitError extends Error {
  constructor() {
    super(`계획은 ${MAX_PLANS}개까지 넣을 수 있어요. 끝난 계획을 지운 뒤 다시 추가하세요.`);
  }
}

/** 계획 저장·삭제 오류를 사용자 문장으로 */
export function toPlanMessage(error: unknown): string {
  if (error instanceof PlanLimitError) return error.message;
  if (error instanceof TypeError) return "서버에 연결하지 못했어요. 인터넷 연결을 확인하세요.";
  return "계획을 저장하지 못했어요. 잠시 뒤 다시 시도하세요.";
}

function useUserId() {
  const { user } = useAuth();
  return user?.id;
}

/** 내 계획 목록 (추가한 순서) */
export function usePlans() {
  const userId = useUserId();
  return useQuery({
    queryKey: planKeys.all(userId ?? "anonymous"),
    enabled: Boolean(userId),
    queryFn: async (): Promise<PlanRecord[]> => {
      const { data, error } = await supabase.from("plans").select("*").order("created_at");
      if (error) throw error;
      return data.map(toPlanRecord);
    },
  });
}

export function useCreatePlan() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PlanInput): Promise<PlanRecord> => {
      const { count, error: countError } = await supabase.from("plans").select("id", { count: "exact", head: true });
      if (countError) throw countError;
      if ((count ?? 0) >= MAX_PLANS) throw new PlanLimitError();

      const { data, error } = await supabase.from("plans").insert(input).select().single();
      if (error) throw error;
      return toPlanRecord(data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: planKeys.all(userId ?? "anonymous") }),
  });
}

/** 수정: 목록을 먼저 바꿔 보여 주고(낙관적 업데이트), 실패하면 되돌립니다. */
export function useUpdatePlan() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const key = planKeys.all(userId ?? "anonymous");
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: PlanInput }): Promise<PlanRecord> => {
      const { data, error } = await supabase.from("plans").update(input).eq("id", id).select().single();
      if (error) throw error;
      return toPlanRecord(data);
    },
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<PlanRecord[]>(key);
      queryClient.setQueryData<PlanRecord[]>(key, (old) => old?.map((p) => (p.id === id ? { id, ...input } : p)));
      return { previous };
    },
    onError: (_error, _vars, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

/** 삭제: 목록에서 먼저 빼고(낙관적 업데이트), 실패하면 되돌립니다. */
export function useDeletePlan() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const key = planKeys.all(userId ?? "anonymous");
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("plans").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<PlanRecord[]>(key);
      queryClient.setQueryData<PlanRecord[]>(key, (old) => old?.filter((p) => p.id !== id));
      return { previous };
    },
    onError: (_error, _id, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
