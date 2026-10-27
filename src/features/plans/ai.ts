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
  /** 가용 시간 추천일 때 요일별 시간 [월~일] (10/24 QA) */
  daily_hours?: number[];
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

// ── 10/26 피드백: 시간표 읽기 ─────────

/** 시간표 붙여넣기 글자 수 */
export const AI_TIMETABLE_MAX = 4000;

/** 시간표에서 읽은 수업 */
export interface TimetableClass {
  title: string;
  credits: number | null;
  /** 수업 요일·시간 (예: "월3 수3") — 보여 주기만 해요 */
  schedule: string | null;
}
export interface TimetableResult {
  classes: TimetableClass[];
  remaining: number;
}

async function invokeAi<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>("estimate-hours", { body });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const res = (await (error.context as Response).json().catch(() => null)) as { error?: string } | null;
      if (res?.error) throw new EstimateError(res.error);
    }
    throw error;
  }
  if (!data) throw new Error("empty response");
  return data;
}

/** 시간표 글(에브리타임·포털에서 복사) 또는 캡처 이미지 → 수업 목록 */
export function useParseTimetable() {
  return useMutation({
    mutationFn: (input: { text?: string; image?: { media_type: string; data: string } }) =>
      invokeAi<TimetableResult>({ kind: "timetable", ...input }),
  });
}

// ── 10/27 온보딩 개편: 글 3칸(수업·프로젝트·자격증) → 계획·자격증 초안 ─────────

/** 온보딩 칸마다 글자 수 (서버도 같은 값으로 막음) */
export const AI_ONBOARDING_MAX = 800;

export interface OnboardingInput {
  classes: string;
  activities: string;
  certificates: string;
  image?: { media_type: string; data: string };
  semester_start: string;
  midterm_week: number;
  final_week: number;
}

export interface DraftPlan {
  title: string;
  type: "class" | "activity" | "project";
  credits: number | null;
  hours_per_week: number;
  start_week: number;
  end_week: number;
  no_exam: boolean;
  /** 주로 하는 요일 (0=월 … 6=일). 빈 배열이면 아무 요일 */
  study_days: number[];
}

/** certificate_id 가 있으면 공용 회차, 없으면 직접 추가할 자격증 (exam_date 는 모르면 null) */
export interface DraftCertificate {
  name: string;
  certificate_id: string | null;
  exam_date: string | null;
  prep_weeks: number;
  study_hours: number;
}

export interface OnboardingDraft {
  plans: DraftPlan[];
  certificates: DraftCertificate[];
  reason: string;
  remaining: number;
}

/** 온보딩 1단계 글 → 2단계에서 확인·수정할 초안 */
export function useParseOnboarding() {
  return useMutation({
    mutationFn: (input: OnboardingInput) => invokeAi<OnboardingDraft>({ kind: "onboarding", ...input }),
  });
}
