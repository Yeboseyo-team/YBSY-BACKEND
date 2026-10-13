import type { PlanLoadLevel, PlanType } from "@/types/database";

/** F-03 한 주 시간 기본값 (명세서 3장 표). 수업은 학점당 시간입니다. */
export const PLAN_DEFAULTS: Record<PlanType, Record<Exclude<PlanLoadLevel, "custom">, number>> = {
  class: { low: 1.5, normal: 2, high: 3 },
  activity: { low: 2, normal: 4, high: 8 },
  project: { low: 3, normal: 6, high: 10 },
};

export const DEFAULT_CREDITS = 3;

/** 유형·단계·학점으로 한 주 시간을 계산합니다. 직접 입력(custom)이면 null */
export function defaultHours(type: PlanType, level: PlanLoadLevel, credits: number | null): number | null {
  if (level === "custom") return null;
  const base = PLAN_DEFAULTS[type][level];
  return type === "class" ? base * (credits ?? DEFAULT_CREDITS) : base;
}
