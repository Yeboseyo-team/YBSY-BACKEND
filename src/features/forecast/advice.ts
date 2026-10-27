// 학기 진단·해결 제안 (10/27) — "이대로는 소화하기 어려워요"를 알려 주고, 실제로 계산해 본 해결책만 제안해요.
// 제안마다 calc.ts 로 예보를 다시 계산해 폭풍 주가 얼마나 줄어드는지 비교합니다. DB·AI 호출 없음.
import { calculateForecast, type Forecast, type ForecastInput, type ForecastPlan, type WeekForecast } from "./calc";

export type AdviceAction =
  | { type: "style"; style: "steady" | "normal" }
  | { type: "plan_hours"; planKey: string; hours: number }
  | { type: "remove_plan"; planKey: string }
  | { type: "available"; daily_hours: number[] };

export interface Advice {
  id: string;
  /** 한 줄 제안 (예: "공부 스타일을 꾸준히로 바꾸기") */
  title: string;
  stormBefore: number;
  stormAfter: number;
  /** 넘치는 시간 합계 (쓸 수 있는 시간을 넘은 만큼, 학기 전체) */
  overBefore: number;
  overAfter: number;
  action: AdviceAction;
}

export interface Diagnosis {
  /** 폭풍 주차 목록 */
  stormWeeks: number[];
  /** 가장 바쁜 주 */
  peak: WeekForecast | null;
  available: number;
}

/** 계획을 가리키는 열쇠 (저장된 계획은 id, 저장 전 초안은 화면이 넣어 준 id) */
export const planKeyOf = (plan: ForecastPlan) => plan.id ?? plan.title;

/** 앞으로 남은 주(fromWeek 부터)만 봐요 — 지난 주의 폭풍은 이제 바꿀 수 없으니까 */
const ahead = (f: Forecast, fromWeek: number) => f.weeks.filter((w) => w.week >= fromWeek);
const storms = (f: Forecast, fromWeek: number) => ahead(f, fromWeek).filter((w) => w.level === "storm").length;
const overHours = (f: Forecast, available: number, fromWeek: number) =>
  ahead(f, fromWeek).reduce((s, w) => s + Math.max(0, w.total_hours - available), 0);
const halfStep = (h: number) => Math.max(0.5, Math.round(h) / 2);

export function diagnose(input: ForecastInput, fromWeek = 1): Diagnosis {
  const forecast = calculateForecast(input);
  const available = input.profile.available_hours ?? 0;
  const stormWeeks = ahead(forecast, fromWeek).filter((w) => w.level === "storm").map((w) => w.week);
  const peak = ahead(forecast, fromWeek).reduce<WeekForecast | null>((best, w) => (!best || w.total_hours > best.total_hours ? w : best), null);
  return { stormWeeks, peak, available };
}

/**
 * 폭풍 주를 줄이는 제안을 최대 limit 개 (효과 큰 순). 효과가 없는 제안은 빼요.
 * fromWeek: 이 주차부터만 셈 (홈은 이번 주부터)
 * canChangePlan: 어떤 계획을 줄이거나 빼자고 제안해도 되는지 (예: 온보딩 2단계는 저장 전 초안만)
 */
export function suggest(input: ForecastInput, options: { limit?: number; fromWeek?: number; canChangePlan?: (plan: ForecastPlan) => boolean } = {}): Advice[] {
  const { limit = 3, fromWeek = 1, canChangePlan = () => true } = options;
  const base = calculateForecast(input);
  const available = input.profile.available_hours ?? 0;
  const stormBefore = storms(base, fromWeek);
  const overBefore = overHours(base, available, fromWeek);
  if (stormBefore === 0) return [];

  const candidates: Advice[] = [];
  const tryIt = (id: string, title: string, next: ForecastInput, action: AdviceAction) => {
    const f = calculateForecast(next);
    const nextAvailable = next.profile.available_hours ?? available;
    const advice: Advice = {
      id,
      title,
      stormBefore,
      stormAfter: storms(f, fromWeek),
      overBefore: Math.round(overBefore),
      overAfter: Math.round(overHours(f, nextAvailable, fromWeek)),
      action,
    };
    // 폭풍이 줄거나, 넘치는 시간이 3시간 넘게 줄 때만
    if (advice.stormAfter < stormBefore || advice.overBefore - advice.overAfter >= 3) candidates.push(advice);
  };

  // 1) 공부 스타일: 벼락치기 → 꾸준히(또는 조금 몰아서)
  const style = input.profile.study_style;
  if (style === "cram" || style === "normal") {
    tryIt("style-steady", "공부 스타일을 '꾸준히'로 바꾸기", { ...input, profile: { ...input.profile, study_style: "steady" } }, { type: "style", style: "steady" });
    if (style === "cram") {
      tryIt("style-normal", "공부 스타일을 '조금 몰아서'로 바꾸기", { ...input, profile: { ...input.profile, study_style: "normal" } }, { type: "style", style: "normal" });
    }
  }

  // 2) 계획 줄이기·빼기: 우선순위 낮은 것 먼저, 그다음 시간이 큰 것
  const rank = (p: ForecastPlan) => (p.priority === "low" ? 0 : p.priority === "high" ? 2 : 1);
  const plans = input.plans
    .filter(canChangePlan)
    .filter((p) => p.hours_per_week >= 1)
    .sort((a, b) => rank(a) - rank(b) || b.hours_per_week - a.hours_per_week)
    .slice(0, 6);
  for (const p of plans) {
    const key = planKeyOf(p);
    const half = halfStep(p.hours_per_week);
    tryIt(
      `half-${key}`,
      `'${p.title}' 한 주 시간을 절반으로 (${fmt(p.hours_per_week)} → ${fmt(half)})`,
      { ...input, plans: input.plans.map((x) => (x === p ? { ...x, hours_per_week: half } : x)) },
      { type: "plan_hours", planKey: key, hours: half },
    );
    if (p.priority === "low") {
      tryIt(`remove-${key}`, `우선순위가 낮은 '${p.title}' 빼기`, { ...input, plans: input.plans.filter((x) => x !== p) }, { type: "remove_plan", planKey: key });
    }
  }

  // 3) 쓸 수 있는 시간: 주말에 하루 2시간씩 더
  const daily = input.profile.daily_hours;
  if (daily && daily.length === 7) {
    const more = daily.map((h, i) => (i >= 5 ? Math.min(24, h + 2) : h));
    const total = more.reduce((a, b) => a + b, 0);
    tryIt("weekend-more", "주말에 하루 2시간씩 더 쓰기", { ...input, profile: { ...input.profile, daily_hours: more, available_hours: total } }, { type: "available", daily_hours: more });
  }

  // 효과 큰 순, 같은 계획에 대한 제안은 하나만, 공부 스타일 제안도 하나만
  candidates.sort((a, b) => a.stormAfter - b.stormAfter || a.overAfter - b.overAfter);
  const picked: Advice[] = [];
  const used = new Set<string>();
  for (const c of candidates) {
    const group = c.action.type === "style" ? "style" : c.action.type === "available" ? "available" : `plan-${(c.action as { planKey: string }).planKey}`;
    if (used.has(group)) continue;
    used.add(group);
    picked.push(c);
    if (picked.length >= limit) break;
  }
  return picked;
}

function fmt(h: number): string {
  const total = Math.round(h * 60);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return mm === 0 ? `${hh}시간` : hh === 0 ? `${mm}분` : `${hh}시간 ${mm}분`;
}
