// 계획 기본값·목록 정리 — 기준: 요구사항 명세서 F-02, F-03 (DB 호출 없음)
import type { Plan, PlanCategory, PlanLoadLevel, PlanPriority, PlanType } from "@/types/database";

/** 사용자당 계획 상한 (FR-02-5). 화면에서 먼저 막고 DB 트리거도 막습니다. */
export const MAX_PLANS = 30;
/** 사용자 지정 유형 상한 (10/24 QA, DB 트리거와 같은 값) */
export const MAX_CATEGORIES = 10;
/** 학점 범위 (10/24 QA: 1~6 정수 직접 입력) */
export const CREDITS_RANGE = { min: 1, max: 6 } as const;

/** 기본 시간이 있는 유형 (사용자 지정 유형은 시간을 직접 넣어요) */
export type BuiltinPlanType = Exclude<PlanType, "custom">;

/**
 * F-03 유형별 기본 주당 시간. 수업은 "학점당" 시간입니다.
 * 10/24 QA: 가용 시간에서 수업 시간을 빼기로 해서, 수업은 과제·복습처럼 수업 밖에서 쓰는 시간만 셉니다.
 */
export const PLAN_DEFAULTS: Record<BuiltinPlanType, Record<Exclude<PlanLoadLevel, "custom">, number>> = {
  class: { low: 1, normal: 1.5, high: 2 },
  activity: { low: 2, normal: 4, high: 8 },
  project: { low: 3, normal: 6, high: 10 },
};

export const PLAN_TYPE_LABEL: Record<PlanType, string> = { class: "수업", activity: "활동", project: "프로젝트", custom: "기타" };
export const BUILTIN_TYPES: BuiltinPlanType[] = ["class", "activity", "project"];
export const LOAD_LEVEL_LABEL: Record<PlanLoadLevel, string> = { low: "적음", normal: "보통", high: "많음", custom: "직접 입력" };
export const PRIORITY_LABEL: Record<PlanPriority, string> = { high: "중요", normal: "보통", low: "낮음" };

/**
 * 적음·보통·많음을 고르면 자동으로 채울 주당 시간 (FR-03-1, FR-03-2).
 * 수업은 학점에 비례합니다 (3학점 보통 = 4.5시간). 직접 입력(custom)·사용자 지정 유형이거나 수업인데 학점이 없으면 null.
 */
export function defaultHoursPerWeek(type: PlanType, level: PlanLoadLevel, credits?: number | null): number | null {
  if (level === "custom" || type === "custom") return null;
  const rate = PLAN_DEFAULTS[type][level];
  if (type !== "class") return rate;
  if (!credits) return null;
  return rate * credits;
}

type GroupablePlan = Pick<Plan, "type" | "start_week" | "end_week" | "created_at"> & { category_id?: string | null };

/**
 * 계획을 유형별로 묶고 각 묶음 안은 시작 주차 순으로 (FR-02-2). 빈 유형은 빠집니다.
 * 순서: 수업 → 활동 → 프로젝트 → 내 유형(만든 순서) → 기타(유형을 지운 계획)
 */
export function groupPlansByType<T extends GroupablePlan>(
  plans: T[],
  categories: Pick<PlanCategory, "id" | "name">[] = [],
): { key: string; label: string; plans: T[] }[] {
  const sort = (list: T[]) =>
    list.sort((a, b) => a.start_week - b.start_week || a.end_week - b.end_week || a.created_at.localeCompare(b.created_at));
  const known = new Set(categories.map((c) => c.id));
  return [
    ...BUILTIN_TYPES.map((type) => ({ key: type, label: PLAN_TYPE_LABEL[type], plans: sort(plans.filter((p) => p.type === type)) })),
    ...categories.map((c) => ({ key: c.id, label: c.name, plans: sort(plans.filter((p) => p.type === "custom" && p.category_id === c.id)) })),
    {
      key: "custom-none",
      label: PLAN_TYPE_LABEL.custom,
      plans: sort(plans.filter((p) => p.type === "custom" && !(p.category_id && known.has(p.category_id)))),
    },
  ].filter((g) => g.plans.length > 0);
}

/** 계획을 더 넣을 수 있는지 (FR-02-5) */
export function canAddPlan(planCount: number): boolean {
  return planCount < MAX_PLANS;
}
