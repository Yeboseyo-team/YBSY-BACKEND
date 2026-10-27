// 계획 데이터 훅 (F-02) — 목록·추가·수정·삭제. 화면은 이 훅만 쓰고 supabase 를 직접 부르지 않습니다.
// 저장·수정·삭제하면 목록 캐시가 바뀌어 useForecastData 의 예보 그래프도 바로 다시 계산됩니다 (FR-02-3, FR-02-4).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/auth-context";
import type { Plan, PlanLoadLevel, PlanPriority, PlanType } from "@/types/database";
import { MAX_PLANS } from "./defaults";

/**
 * 화면 폼에서 넘기는 값. user_id·id·시각은 DB가 채웁니다. 수업이 아니면 credits 는 null.
 * 10/24 QA: 기간은 날짜(start_date~end_date)로 고르고 주차는 날짜에서 계산해 함께 저장해요.
 * 사용자 지정 유형이면 type "custom" + category_id.
 */
export interface PlanInput {
  title: string;
  type: PlanType;
  credits: number | null;
  load_level: PlanLoadLevel;
  start_week: number;
  end_week: number;
  hours_per_week: number;
  start_date: string | null;
  end_date: string | null;
  priority: PlanPriority;
  category_id: string | null;
  /** 시험 없는 수업 (발표·과제로 평가, 10/26). 시험 주간 1.5배를 빼고 벼락치기는 끝나는 날 전으로. 수업만 */
  no_exam?: boolean;
  /** 주로 공부·과제를 하는 요일 (0=월 … 6=일, 10/27). 비우면 아무 요일 */
  study_days?: number[] | null;
}

export const planKeys = {
  all: (userId: string) => ["plans", userId] as const,
};

export class PlanLimitError extends Error {
  constructor() {
    super(`계획은 ${MAX_PLANS}개까지 넣을 수 있어요. 끝난 계획을 지운 뒤 다시 추가하세요.`);
  }
}

/** 계획 저장·삭제 오류를 화면에 보여 줄 한국어 문장으로 (NFR-USE-2) */
export function toPlanMessage(error: unknown): string {
  if (error instanceof PlanLimitError) return error.message;
  if (error instanceof TypeError) return "서버에 연결하지 못했어요. 인터넷 연결을 확인하세요.";
  const code = (error as { code?: string } | null)?.code;
  if (code === "P0030") return new PlanLimitError().message; // DB 의 30개 상한 트리거 (plans_limit)
  if (code === "23514") return "입력값을 확인하세요. 계획명 1~30자, 기간(시작 ≤ 끝), 쓰는 시간 0.5~60(0.5 단위), 학점은 수업만 1~12예요.";
  if (code === "23503") return "고른 유형을 찾을 수 없어요. 유형을 다시 골라 주세요.";
  return "계획을 저장하지 못했어요. 잠시 뒤 다시 시도하세요.";
}

/** 수업이 아니면 학점을, 사용자 지정 유형이 아니면 유형 id 를 비워 DB 제약에 걸리지 않게 */
function clean(input: PlanInput): PlanInput {
  return {
    ...input,
    title: input.title.trim(),
    credits: input.type === "class" ? input.credits : null,
    no_exam: input.type === "class" ? Boolean(input.no_exam) : false,
    study_days: input.study_days?.length ? [...new Set(input.study_days)].sort((a, b) => a - b) : null,
    category_id: input.type === "custom" ? input.category_id : null,
    load_level: input.type === "custom" ? "custom" : input.load_level,
  };
}

function useUserKey() {
  const { user } = useAuth();
  return { userId: user?.id, key: planKeys.all(user?.id ?? "anonymous") };
}

/** 내 계획 목록 (시작 주차 → 추가한 순서). 유형별 묶기는 groupPlansByType 사용 */
export function usePlans() {
  const { userId, key } = useUserKey();
  return useQuery({
    queryKey: key,
    enabled: Boolean(userId),
    queryFn: async (): Promise<Plan[]> => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("start_week")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

/** 계획 하나 (수정 화면). 목록을 이미 불러왔으면 그 값을 바로 씁니다. 없는 id 면 data 가 null */
export function usePlan(id: string | undefined) {
  const { userId, key } = useUserKey();
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: [...key, "detail", id ?? ""],
    enabled: Boolean(userId && id),
    initialData: () => queryClient.getQueryData<Plan[]>(key)?.find((p) => p.id === id),
    queryFn: async (): Promise<Plan | null> => {
      const { data, error } = await supabase.from("plans").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/** 계획 추가. 30개가 차 있으면 PlanLimitError (화면에서도 미리 막으세요) */
export function useCreatePlan() {
  const { key } = useUserKey();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PlanInput): Promise<Plan> => {
      const { count, error: countError } = await supabase.from("plans").select("id", { count: "exact", head: true });
      if (countError) throw countError;
      if ((count ?? 0) >= MAX_PLANS) throw new PlanLimitError();

      const { data, error } = await supabase.from("plans").insert(clean(input)).select().single();
      if (error) throw error;
      return data;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

/** 계획 여러 개 한 번에 추가 (10/26: 시간표에서 읽은 수업, 말로 설정한 계획). 30개를 넘으면 PlanLimitError */
export function useCreatePlans() {
  const { key } = useUserKey();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inputs: PlanInput[]): Promise<number> => {
      if (inputs.length === 0) return 0;
      const { count, error: countError } = await supabase.from("plans").select("id", { count: "exact", head: true });
      if (countError) throw countError;
      if ((count ?? 0) + inputs.length > MAX_PLANS) throw new PlanLimitError();
      const { error } = await supabase.from("plans").insert(inputs.map(clean));
      if (error) throw error;
      return inputs.length;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

/** 계획 수정. 목록을 먼저 바꿔 보여 주고(낙관적 업데이트) 실패하면 되돌립니다. */
export function useUpdatePlan() {
  const { key } = useUserKey();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: PlanInput }): Promise<Plan> => {
      const { data, error } = await supabase.from("plans").update(clean(input)).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Plan[]>(key);
      queryClient.setQueryData<Plan[]>(key, (old) => old?.map((p) => (p.id === id ? { ...p, ...clean(input) } : p)));
      return { previous };
    },
    onError: (_error, _vars, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

/** 계획 삭제. 확인 창은 화면에서 띄운 뒤 부르세요 (FR-02-4). 목록에서 먼저 빼고 실패하면 되돌립니다. */
export function useDeletePlan() {
  const { key } = useUserKey();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("plans").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Plan[]>(key);
      queryClient.setQueryData<Plan[]>(key, (old) => old?.filter((p) => p.id !== id));
      return { previous };
    },
    onError: (_error, _id, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
