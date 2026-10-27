// 왜 바쁜지 설명 (10/27) — "이대로는 소화하기 어려워요"와 가장 바쁜 주에 시간이 왜 그만큼 드는지 계획마다 한 줄로 알려 줘요.
// calc.ts 결과만 읽어서 문장을 만들어요. DB·AI 호출 없음. (해결 제안은 최종 발표 때 더 다듬어서 다시 넣을 예정)
import { calculateForecast, type ForecastInput, type ForecastPlan, type WeekForecast, type WeekItem } from "./calc";
import { formatDuration } from "./weather";

export type BusyKind = "class" | "activity" | "project" | "custom" | "certificate";

export interface BusyReason {
  title: string;
  kind: BusyKind;
  /** 그 주에 드는 시간 */
  hours: number;
  /** 보통 이 정도는 해야 한다는 기준 한 문장 */
  text: string;
  /** 지금 내 계획은 어떻게 잡혀 있는지 (평소 한 주 시간, 기준과 비교, 이번 주에 늘어난 까닭, 지금까지 기록) */
  now: string;
}

export interface BusyExplanation {
  /** 폭풍 주차 (fromWeek 부터) */
  stormWeeks: number[];
  /** 가장 바쁜 주 */
  peak: WeekForecast;
  available: number;
  /** 그 주가 특히 바쁜 까닭 (시험 주간, 벼락치기, 자격증 겹침 등) */
  why: string[];
  /** 시간이 많이 드는 순서로 최대 limit 개 */
  reasons: BusyReason[];
}

/** 몰아서 늘어났다고 볼 만큼 평소보다 많은지 */
const grew = (now: number, usual: number) => now > usual + 0.05;

/** 기준과 비교한 말 (30분 넘게 차이 날 때만) */
function compare(usual: number, standard: number): string {
  const diff = Math.round((usual - standard) * 2) / 2;
  if (Math.abs(diff) < 0.5) return "기준과 비슷해요";
  return diff > 0 ? `기준보다 ${formatDuration(diff)} 많아요` : `기준보다 ${formatDuration(-diff)} 적어요`;
}

/** 지금까지 기록한 시간 문장 (기록이 없으면 빈 문자열) */
function doneText(input: ForecastInput, match: (log: NonNullable<ForecastInput["logs"]>[number]) => boolean): string {
  const done = (input.logs ?? []).filter(match).reduce((sum, l) => sum + l.hours, 0);
  return done > 0 ? ` 지금까지 ${formatDuration(done)} 기록했어요.` : "";
}

function reasonOf(item: WeekItem, input: ForecastInput, week: number, isExamWeek: boolean): BusyReason {
  const hours = item.hours;
  if (item.source === "certificate") {
    const name = item.title.replace(/ 준비$/, "");
    // 같은 이름의 회차가 여럿일 수 있어서, 내가 고른 회차 중에서 찾아요
    const uc = input.userCertificates.find((u) => input.certificates.some((c) => c.id === u.certificate_id && c.name === name));
    const usual = uc?.study_hours ?? item.base_hours;
    const text = uc
      ? `${name} 시험은 시험 전 ${uc.prep_weeks}주 동안 매주 ${formatDuration(usual)}씩 꾸준히 해야 붙을 수 있어요.`
      : `${name} 시험 준비에 매주 꾸준히 시간이 들어요.`;
    let now = `지금은 매주 ${formatDuration(usual)}으로 잡혀 있어요.`;
    if (grew(item.base_hours, usual)) now += ` 시험이 다가와서 ${week}주차는 ${formatDuration(hours)}으로 늘었어요.`;
    now += doneText(input, (l) => l.certificate_id === uc?.certificate_id && !!uc);
    return { title: item.title, kind: "certificate", hours, text, now };
  }

  const plan: ForecastPlan | undefined = input.plans.find((p) => p.title === item.title);
  const kind = (item.plan_type ?? plan?.type ?? "custom") as BusyKind;
  const usual = plan?.hours_per_week ?? item.base_hours;
  const crunch = grew(item.base_hours, usual);
  const weighted = item.weighted && isExamWeek;
  const credits = (plan as { credits?: number | null } | undefined)?.credits;
  // 기준: 서비스 기본값과 같아요 (수업 학점×1.5, 프로젝트 6시간, 활동 4시간)
  const standard = kind === "class" && credits ? credits * 1.5 : kind === "project" ? 6 : kind === "activity" ? 4 : null;

  let text: string;
  if (kind === "class") {
    text = credits
      ? `${credits}학점 수업은 과제·복습까지 수업 밖에서 매주 ${formatDuration(standard!)} 정도 해야 A+를 노릴 수 있어요.`
      : "수업은 과제·복습까지 수업 밖에서 매주 꾸준히 해야 A+를 노릴 수 있어요.";
  } else if (kind === "project") {
    text = "팀플·공모전 같은 프로젝트는 보통 매주 6시간은 해야 마감 직전에 덜 쫓기고 수월해요.";
  } else if (kind === "activity") {
    text = "동아리·학회 같은 활동은 모임과 준비로 보통 매주 4시간 정도 들어요.";
  } else {
    text = "날짜가 정해진 일정이라 그 주에 시간이 들어요.";
  }

  let now = kind === "custom" ? `${week}주차에 ${formatDuration(hours)}으로 잡혀 있어요.` : `지금은 매주 ${formatDuration(usual)}으로 잡혀 있어요${standard ? ` (${compare(usual, standard)})` : ""}.`;
  if (kind !== "custom" && (crunch || weighted)) {
    const piled = kind === "class" ? "벼락치기라 시험 전에 몰리" : "마감이 가까워 몰리";
    const why = crunch && weighted ? `${piled}고 시험 주간 1.5배까지 붙어서` : crunch ? `${piled}어서` : "시험 주간이라 1.5배가 돼서";
    now += ` ${week}주차는 ${why} ${formatDuration(hours)}이에요.`;
  }
  if (plan?.id) now += doneText(input, (l) => l.plan_id === plan.id);
  return { title: item.title, kind, hours, text, now };
}

/** 폭풍 주가 없으면 null. fromWeek: 이 주차부터만 봐요 (홈은 이번 주부터 — 지난 주는 이제 못 바꾸니까) */
export function explainBusy(input: ForecastInput, fromWeek = 1, limit = 5): BusyExplanation | null {
  const forecast = calculateForecast(input);
  const available = input.profile.available_hours ?? 0;
  const ahead = forecast.weeks.filter((w) => w.week >= fromWeek);
  const stormWeeks = ahead.filter((w) => w.level === "storm").map((w) => w.week);
  if (stormWeeks.length === 0) return null;
  const peak = ahead.reduce((best, w) => (w.total_hours > best.total_hours ? w : best));

  const reasons = [...peak.items]
    .filter((i) => i.hours > 0)
    .sort((a, b) => b.hours - a.hours)
    .map((i) => reasonOf(i, input, peak.week, peak.is_exam_week));

  const why: string[] = [];
  if (peak.is_exam_week) why.push(`${peak.week}주차는 시험 주간이라 수업 공부가 평소의 1.5배로 늘어요.`);
  const crunched = peak.items.filter((i) => {
    if (i.source !== "plan") return false;
    const plan = input.plans.find((p) => p.title === i.title);
    return plan ? grew(i.base_hours, plan.hours_per_week) : false;
  });
  if (input.profile.study_style === "cram" && crunched.length > 0) why.push(`벼락치기 스타일이라 시험·마감 직전 주에 ${crunched.length}개 계획의 공부가 몰려요.`);
  const certCount = peak.items.filter((i) => i.source === "certificate" && i.hours > 0).length;
  if (certCount >= 2) why.push(`자격증 준비 ${certCount}개가 이 주에 겹쳐요.`);
  why.push(`이 주에 할 일이 ${reasons.length}개예요.`);

  return { stormWeeks, peak, available, why, reasons: reasons.slice(0, limit) };
}
