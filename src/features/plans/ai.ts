// F-08 AI 소요 시간 추정 훅 (FR-08-1) — 서버 함수 estimate-hours 를 부릅니다. 결과는 폼에 채우기만 하고 저장하지 않아요.
//   kind "plan"      : 계획 하나의 주당 시간 (계획 등록·수정 폼)
//   kind "available" : 한 주에 쓸 수 있는 시간 (온보딩·설정)
import { useMutation } from "@tanstack/react-query";
import { FunctionsFetchError, FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { PlanType } from "@/types/database";

/** 설명 글자 수 (서버도 같은 값으로 막음) */
export const AI_DESCRIPTION_MAX = 300;

export type EstimateInput =
  | { kind: "plan"; title: string; type: PlanType; credits: number | null; description: string }
  | { kind: "available"; description: string };

export interface Estimate {
  /** 계획: 0.5 단위 0.5~60 / 가용 시간: 정수 10~80 */
  hours_per_week: number;
  /** 근거 한 줄 */
  reason: string;
  /** 오늘 남은 횟수 */
  remaining: number;
}

class EstimateError extends Error {}

export function useEstimateHours() {
  return useMutation({
    mutationFn: async (input: EstimateInput): Promise<Estimate> => {
      const { data, error } = await supabase.functions.invoke<Estimate>("estimate-hours", { body: input });
      if (error) {
        // 서버가 보낸 한국어 문구가 있으면 그대로 보여 줌
        if (error instanceof FunctionsHttpError) {
          const body = (await (error.context as Response).json().catch(() => null)) as { error?: string } | null;
          if (body?.error) throw new EstimateError(body.error);
        }
        throw error;
      }
      if (!data) throw new Error("empty response");
      return data;
    },
  });
}

/** AI 추천 오류를 화면 문구로 (NFR-USE-2) */
export function toEstimateMessage(error: unknown): string {
  if (error instanceof EstimateError) return error.message;
  if (error instanceof FunctionsFetchError || error instanceof TypeError) return "서버에 연결하지 못했어요. 인터넷 연결을 확인하세요.";
  return "AI 추천을 받지 못했어요. 직접 고르거나 잠시 뒤 다시 시도하세요.";
}
