// 계획 기본값·목록 정리 — 기준: 요구사항 명세서 F-02, F-03 (DB 호출 없음)
import type { Plan, PlanLoadLevel, PlanType } from "@/types/database";

/** 사용자당 계획 상한 (FR-02-5). DB가 아니라 화면에서 막습니다. */
export const MAX_PLANS = 30;

/** F-03 유형별 기본 주당 시간 (명세서 3장 표, 팀 확정 필요). 수업은 "학점당" 시간입니다. */
export const PLAN_DEFAULTS: Record<PlanType, Record<Exclude<PlanLoadLevel, "custom">, number>> = {
  class: { low: 1.5, normal: 2, high: 3 },
  activity: { low: 2, normal: 4, high: 8 },
  project: { low: 3, normal: 6, high: 10 },
};

export const PLAN_TYPE_LABEL: Record<PlanType, string> = { class: "수업", activity: "활동", project: "프로젝트" };
export const LOAD_LEVEL_LABEL: Record<PlanLoadLevel, string> = { low: "적음", normal: "보통", high: "많음", custom: "직접 입력" };

/**
 * 적음·보통·많음을 고르면 자동으로 채울 주당 시간 (FR-03-1, FR-03-2).
 * 수업은 학점에 비례합니다 (3학점 보통 = 6시간). 직접 입력(custom)이거나 수업인데 학점이 없으면 null.
 */
export function defaultHoursPerWeek(type: PlanType, level: PlanLoadLevel, credits?: number | null): number | null {
  if (level === "custom") return null;
  const rate = PLAN_DEFAULTS[type][level];
  if (type !== "class") return rate;
  if (!credits) return null;
  return rate * credits;
}

/** 계획을 유형별로 묶고 각 묶음 안은 시작 주차 순으로 (FR-02-2). 빈 유형은 빠집니다. */
export function groupPlansByType<T extends Pick<Plan, "type" | "start_week" | "end_week" | "created_at">>(
  plans: T[],
): { type: PlanType; label: string; plans: T[] }[] {
  return (Object.keys(PLAN_TYPE_LABEL) as PlanType[])
    .map((type) => ({
      type,
      label: PLAN_TYPE_LABEL[type],
      plans: plans
        .filter((p) => p.type === type)
        .sort((a, b) => a.start_week - b.start_week || a.end_week - b.end_week || a.created_at.localeCompare(b.created_at)),
    }))
    .filter((g) => g.plans.length > 0);
}

/** 계획을 더 넣을 수 있는지 (FR-02-5) */
export function canAddPlan(planCount: number): boolean {
  return planCount < MAX_PLANS;
}
