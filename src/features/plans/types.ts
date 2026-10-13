import type { Plan, PlanLoadLevel, PlanType } from "@/types/database";

/**
 * 화면과 예보 계산(calc.ts의 ForecastPlan)이 같이 쓰는 계획 값.
 * DB 행에서 user_id·시각을 뺀 것이고, type·load_level을 좁힌 타입으로 바꿨습니다.
 */
export type PlanInput = Pick<Plan, "title" | "credits" | "start_week" | "end_week" | "hours_per_week"> & {
  type: PlanType;
  load_level: PlanLoadLevel;
};

/** 저장된 계획 */
export type PlanRecord = PlanInput & { id: string };

export const PLAN_TYPE_LABEL: Record<PlanType, string> = {
  class: "수업",
  activity: "활동",
  project: "프로젝트",
};

export const LOAD_LEVEL_LABEL: Record<Exclude<PlanLoadLevel, "custom">, string> = {
  low: "적음",
  normal: "보통",
  high: "많음",
};
