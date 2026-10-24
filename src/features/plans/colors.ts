// 계획 유형별 색 (10/24 QA) — 예보 화면 목록에서 어떤 계획이 어떤 유형인지 알아보게.
// 날씨 색(맑음 초록·흐림 주황·폭풍 빨강)과 헷갈리지 않게 고르고, 수업·활동은 서로 확실히 다른 색으로 (10/24 QA).
import type { PlanCategory, PlanType } from "@/types/database";
import { PLAN_TYPE_LABEL } from "./defaults";

export const TYPE_COLOR: Record<Exclude<PlanType, "custom"> | "certificate", string> = {
  class: "#2563eb",
  activity: "#db2777",
  project: "#0d9488",
  certificate: "#7c3aed",
};

/** 내 유형은 만든 순서대로 이 색을 돌려 써요 */
const CATEGORY_PALETTE = ["#0891b2", "#a16207", "#4f46e5", "#78716c", "#c026d3"];
const OTHER_COLOR = "#6b7280";

export interface TypeTag {
  label: string;
  color: string;
}

/** 계획(또는 자격증)의 유형 이름과 색 */
export function typeTagOf(
  item: { source?: "plan" | "certificate"; plan_type?: PlanType | string; category_id?: string | null },
  categories: Pick<PlanCategory, "id" | "name">[] = [],
): TypeTag {
  if (item.source === "certificate") return { label: "자격증", color: TYPE_COLOR.certificate };
  const type = item.plan_type as PlanType | undefined;
  if (type === "class" || type === "activity" || type === "project") return { label: PLAN_TYPE_LABEL[type], color: TYPE_COLOR[type] };
  const index = categories.findIndex((c) => c.id === item.category_id);
  if (index >= 0) return { label: categories[index].name, color: CATEGORY_PALETTE[index % CATEGORY_PALETTE.length] };
  return { label: PLAN_TYPE_LABEL.custom, color: OTHER_COLOR };
}
