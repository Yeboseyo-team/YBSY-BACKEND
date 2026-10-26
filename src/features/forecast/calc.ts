// 학기 부담 산출 — 기준: 요구사항 명세서(2026-10-13) 4장
// 부담 계산은 이 파일 한 곳에서만 합니다. DB 호출 없이 순수 계산만 합니다.
// 참조 구현: scripts/generate-dummy.mjs 의 forecast() — 결과가 같아야 합니다.
import type { Certificate, Plan, PlanPriority, PlanType, Profile, UserCertificate } from "@/types/database";

// ── 산출 상수 (명세서 2.3, 4장) ─────────────────────────
export const TOTAL_WEEKS = 16;
export const EXAM_WEIGHT = 1.5;
/** 0.8 미만 맑음, 0.8 이상 1.0 이하 흐림, 1.0 초과 폭풍 */
export const LEVEL_THRESHOLD = { CLOUDY_FROM: 0.8, STORM_ABOVE: 1.0 } as const;

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;

// ── 타입 ─────────────────────────────────────────────
/** 4.4 단계: clear 맑음 / cloudy 흐림 / storm 폭풍 */
export type Weather = "clear" | "cloudy" | "storm";

/** 예보에 필요한 학기 설정. 온보딩 전(null)이면 예보를 낼 수 없습니다. */
export type ForecastProfile = Pick<Profile, "available_hours" | "semester_start" | "midterm_week" | "final_week"> & {
  /** 요일별 가용 시간 [월~일] (10/24 QA). 없으면 요일별 예보를 낼 수 없어요. */
  daily_hours?: number[] | null;
  /** 공부 스타일 (10/26). 없으면 꾸준형 */
  study_style?: string | null;
};
/** 저장된 계획과 저장 전 계획(사전 검토) 모두 받을 수 있도록 필요한 필드만 씁니다. */
export type ForecastPlan = Pick<Plan, "title" | "type" | "start_week" | "end_week" | "hours_per_week"> & {
  /** 사용자 지정 유형 id (10/24 QA, 예보 목록 색 구분용) */
  category_id?: string | null;
  /** 저장된 계획이면 id (사전 검토에서 "이 계획을 바꾸면"을 계산할 때 씀) */
  id?: string;
  /** 날짜로 정한 기간 (10/24 QA). 있으면 요일별 예보에서 그 날짜에만 나눠 넣어요. */
  start_date?: string | null;
  end_date?: string | null;
  /** 우선순위 (10/24 QA). 없으면 normal */
  priority?: PlanPriority | string;
  /** 시험 없는 수업 (10/26). 시험 주간 가중치 없음, 벼락치기는 프로젝트처럼 끝나는 날 전으로 */
  no_exam?: boolean | null;
};
export type ForecastUserCertificate = Pick<UserCertificate, "certificate_id" | "study_hours" | "prep_weeks">;
export type ForecastCertificate = Pick<Certificate, "id" | "name" | "exam_date">;

export interface ForecastInput {
  profile: ForecastProfile;
  plans: ForecastPlan[];
  userCertificates: ForecastUserCertificate[];
  /** userCertificates 가 가리키는 회차 정보 */
  certificates: ForecastCertificate[];
  /** 실제로 한 시간 기록 (10/26). 없으면 계획대로 */
  logs?: StudyLog[];
}

/** FR-05-4 주차별 상세 내역 한 줄 */
export interface WeekItem {
  source: "plan" | "certificate";
  title: string;
  /** 가중치 적용 전 주당 시간 */
  base_hours: number;
  /** 시험 주 가중치(×1.5) 적용 여부 */
  weighted: boolean;
  /** 가중치 적용 후 시간 (소수점 첫째 자리) */
  hours: number;
  /** 계획의 우선순위 (계획일 때만) */
  priority?: PlanPriority;
  /** 계획의 유형·내 유형 id (계획일 때만, 예보 목록 색 구분용) */
  plan_type?: PlanType;
  category_id?: string | null;
}

export interface WeekForecast {
  week: number;
  is_exam_week: boolean;
  /** 주차 부담 (소수점 첫째 자리) */
  total_hours: number;
  /** 부담률 (소수점 셋째 자리). 단계 판정은 반올림 전 값으로 합니다. */
  ratio: number;
  level: Weather;
  items: WeekItem[];
}

export interface Forecast {
  weeks: WeekForecast[];
  summary: Record<Weather, number>;
}

export interface PreviewDiff {
  storm_before: number;
  storm_after: number;
  /** 사전 검토로 새로 폭풍이 되는 주차 */
  new_storm_weeks: number[];
  /** 예: "폭풍 1주 → 3주 (9, 10주차 추가)" */
  message: string;
}

// ── 주차 (4.1) ───────────────────────────────────────
/** week(d) = floor((d - 학기시작일) / 7) + 1. 1~16 밖의 값도 그대로 돌려줍니다. */
export function weekOf(date: string, semesterStart: string): number {
  return Math.floor((Date.parse(date) - Date.parse(semesterStart)) / WEEK_MS) + 1;
}

export function isInSemester(week: number): boolean {
  return week >= 1 && week <= TOTAL_WEEKS;
}

/** "YYYY-MM-DD" 에 days 일을 더한 날짜 */
export function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/** 그 주차의 7일 (1주차 첫날 = 개강일, 10/24 QA) */
export function weekDates(week: number, semesterStart: string): string[] {
  const first = addDays(semesterStart, (week - 1) * 7);
  return Array.from({ length: 7 }, (_, i) => addDays(first, i));
}

/** 요일 번호 0 = 월요일 … 6 = 일요일 (daily_hours 순서) */
export function weekdayIndex(date: string): number {
  return (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
}

export const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"] as const;

/** 날짜로 정한 기간을 1~16주차로 (학기 밖은 잘라냄). 기간 전체가 학기 밖이면 null */
export function weeksFromDates(startDate: string, endDate: string, semesterStart: string): { start_week: number; end_week: number } | null {
  const start = weekOf(startDate, semesterStart);
  const end = weekOf(endDate, semesterStart);
  if (end < 1 || start > TOTAL_WEEKS) return null;
  return { start_week: Math.max(1, start), end_week: Math.min(TOTAL_WEEKS, end) };
}

/** 학기 주차. 1~16 밖이면 null(학기 범위 밖)입니다. */
export function semesterWeekOf(date: string, semesterStart: string): number | null {
  const week = weekOf(date, semesterStart);
  return isInSemester(week) ? week : null;
}

// ── 자격증 준비 주차 (4.2) ────────────────────────────
export interface CertificatePrepRange {
  /** 시험일의 주차 E (학기 밖일 수 있음) */
  exam_week: number;
  /** 준비 시작 주차 E - N + 1 */
  from_week: number;
  /** 준비 끝 주차 E (시험 주 포함) */
  to_week: number;
  /** 이 중 예보에 반영되는 1~16주차 */
  weeks: number[];
  /** full 전부 반영 / partial 일부만 반영 / out 학기 범위 밖 */
  coverage: "full" | "partial" | "out";
}

export function certificatePrepRange(examDate: string, prepWeeks: number, semesterStart: string): CertificatePrepRange {
  const exam_week = weekOf(examDate, semesterStart);
  const from_week = exam_week - prepWeeks + 1;
  const weeks: number[] = [];
  for (let w = Math.max(from_week, 1); w <= Math.min(exam_week, TOTAL_WEEKS); w++) weeks.push(w);
  const coverage = weeks.length === 0 ? "out" : weeks.length === prepWeeks ? "full" : "partial";
  return { exam_week, from_week, to_week: exam_week, weeks, coverage };
}

// ── 단계 (4.4) ───────────────────────────────────────
/** 반올림 전 부담률로 판정합니다. */
export function levelOf(ratio: number): Weather {
  if (ratio > LEVEL_THRESHOLD.STORM_ABOVE) return "storm";
  if (ratio >= LEVEL_THRESHOLD.CLOUDY_FROM) return "cloudy";
  return "clear";
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const toPriority = (p: string | undefined): PlanPriority => (p === "high" || p === "low" ? p : "normal");
const round3 = (n: number) => Math.round(n * 1000) / 1000;
/** 하루 단위는 분까지 맞게 보이도록 1분(1/60시간) 단위로 */
const roundMinute = (n: number) => Math.round(n * 60) / 60;

/** 학기 설정(가용 시간·학기 시작일)을 마쳤는지. 마치지 않았으면 예보를 낼 수 없습니다 (FR-01-11). */
export function isSemesterReady(
  profile: ForecastProfile,
): profile is ForecastProfile & { available_hours: number; semester_start: string } {
  return profile.available_hours !== null && profile.available_hours > 0 && profile.semester_start !== null;
}

// ── 공부 스타일·실제 기록 (10/26 피드백) ─────────────────
/**
 * 공부 스타일. 주당 시간 "합계"는 같고 주별로 나누는 모양만 달라져요.
 * steady 꾸준형: 매주 고르게 (지금까지와 같음)
 * normal 보통: 평소 주에서 25%를 덜어 시험·마감 직전 2주에
 * cram 벼락치기형: 평소 주에서 50%를 덜어 시험·마감 직전 2주에
 */
export type StudyStyle = "steady" | "normal" | "cram";
export const STUDY_STYLES: StudyStyle[] = ["steady", "normal", "cram"];
export const STUDY_STYLE_SHIFT: Record<StudyStyle, number> = { steady: 0, normal: 0.25, cram: 0.5 };
/** 몰아서 하는 주 수 (시험 주·마감 주 포함) */
export const CRUNCH_WEEKS = 2;

/** 실제로 한 시간 기록 — 계획이나 자격증 준비 하나의 하루치 */
export interface StudyLog {
  plan_id?: string | null;
  certificate_id?: string | null;
  /** "YYYY-MM-DD" */
  date: string;
  /** 실제로 한 시간 */
  hours: number;
}

const toStyle = (s: string | null | undefined): StudyStyle => (s === "normal" || s === "cram" ? s : "steady");

/**
 * 구간마다 마지막 2주에 몰아 넣기. base 는 주차별 시간(1~16, 0 이면 그 주 없음).
 * 평소 주에서 shift 만큼 덜어 그 구간의 마지막 2주에 똑같이 나눠 더해요. 구간 합계는 그대로.
 */
function shapeSegments(base: number[], segments: number[][], shift: number): number[] {
  if (shift === 0) return base;
  const out = [...base];
  for (const segment of segments) {
    const weeks = segment.filter((w) => base[w] > 0);
    if (weeks.length <= CRUNCH_WEEKS) continue;
    const crunch = weeks.slice(-CRUNCH_WEEKS);
    const normal = weeks.slice(0, -CRUNCH_WEEKS);
    const moved = normal.reduce((sum, w) => sum + base[w] * shift, 0);
    for (const w of normal) out[w] = base[w] * (1 - shift);
    for (const w of crunch) out[w] = base[w] + moved / crunch.length;
  }
  return out;
}

const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);

/** 예보 한 항목(계획 또는 자격증 준비)의 학기 일정 */
interface ScheduleItem {
  item: Omit<WeekItem, "base_hours" | "weighted" | "hours">;
  plan_id?: string;
  certificate_id?: string;
  /** 주차별 시간 (가중치 전, 공부 스타일 반영) — 인덱스 = 주차 */
  base: number[];
  /** 주차별 시간 (가중치·실제 기록 반영) */
  hours: number[];
  weighted: boolean[];
  /** 그 날짜에 할 수 있는 일인지 (날짜로 정한 일정은 그 날짜만) */
  activeOn: (date: string) => boolean;
  /** 실제로 기록한 날 → 시간 */
  logged: Map<string, number>;
}

/** 요일별 가용 시간 비율 (없으면 똑같이) */
function dayShares(dates: string[], active: boolean[], daily: number[] | null | undefined): number[] {
  const weights = dates.map((d, i) => (active[i] ? (daily && daily.length === 7 ? daily[weekdayIndex(d)] : 1) : 0));
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum > 0) return weights.map((w) => w / sum);
  const count = active.filter(Boolean).length;
  return active.map((on) => (on && count > 0 ? 1 / count : 0));
}

/**
 * 계획·자격증을 학기 일정으로 펼칩니다. 꾸준형이고 기록이 없으면 지금까지와 똑같은 값이에요.
 * strict 면 회차 정보가 없을 때 에러 (주차 예보), 아니면 그 자격증은 빼요 (요일별 예보).
 */
function buildSchedule(
  { profile, plans, userCertificates, certificates, logs = [] }: ForecastInput,
  strict: boolean,
): ScheduleItem[] {
  const semester_start = profile.semester_start!;
  const { midterm_week, final_week } = profile;
  const shift = STUDY_STYLE_SHIFT[toStyle(profile.study_style)];
  const isExam = (w: number) => w === midterm_week || w === final_week;
  const empty = () => new Array<number>(TOTAL_WEEKS + 1).fill(0);
  const items: ScheduleItem[] = [];

  for (const plan of plans) {
    const base = empty();
    for (let w = Math.max(1, plan.start_week); w <= Math.min(TOTAL_WEEKS, plan.end_week); w++) base[w] = plan.hours_per_week;
    let segments: number[][] = [];
    const examClass = plan.type === "class" && !plan.no_exam;
    if (examClass) {
      // 시험마다 그 시험까지를 한 구간으로 (중간고사 전, 중간~기말)
      const exams = [...new Set([midterm_week, final_week])].filter((w) => w >= plan.start_week && w <= plan.end_week).sort((a, b) => a - b);
      let from = plan.start_week;
      for (const exam of exams) {
        segments.push(range(from, exam));
        from = exam + 1;
      }
    } else if (plan.type === "project" || plan.type === "class") {
      segments = [range(plan.start_week, plan.end_week)]; // 마감(시험 없는 수업은 끝나는 날) 직전 2주에
    } // 활동(정기 모임)·사용자 지정 일정(날짜가 정해짐)은 몰아 하지 않음
    const shaped = shapeSegments(base, segments, shift);
    const weighted = shaped.map((_, w) => examClass && isExam(w));
    items.push({
      item: {
        source: "plan",
        title: plan.title,
        priority: toPriority(plan.priority),
        plan_type: plan.type as PlanType,
        category_id: plan.category_id ?? null,
      },
      plan_id: plan.id,
      base: shaped,
      hours: shaped.map((h, w) => h * (weighted[w] ? EXAM_WEIGHT : 1)),
      weighted,
      activeOn: (d) => (!plan.start_date || d >= plan.start_date) && (!plan.end_date || d <= plan.end_date),
      logged: new Map(),
    });
  }

  const certById = new Map(certificates.map((c) => [c.id, c]));
  for (const uc of userCertificates) {
    const cert = certById.get(uc.certificate_id);
    if (!cert) {
      if (strict) throw new Error(`자격증 회차 정보를 찾을 수 없습니다: ${uc.certificate_id}`);
      continue;
    }
    const prep = certificatePrepRange(cert.exam_date, uc.prep_weeks, semester_start);
    const base = empty();
    for (const w of prep.weeks) base[w] = uc.study_hours;
    // 시험 주가 학기 안에 있을 때만 시험 직전 2주에 몰아 넣기
    const shaped = prep.exam_week <= TOTAL_WEEKS ? shapeSegments(base, [prep.weeks], shift) : base;
    items.push({
      item: { source: "certificate", title: `${cert.name} 준비` },
      certificate_id: cert.id,
      base: shaped,
      hours: [...shaped],
      weighted: shaped.map(() => false),
      activeOn: () => true,
      logged: new Map(),
    });
  }

  applyLogs(items, logs, profile);
  return items;
}

/**
 * 실제 기록 반영 (10/26 피드백): 그날 계획보다 더 했으면 같은 계획의 남은 날(이번 주 먼저, 모자라면 다음 주들)에서 빼고,
 * 덜 했으면 이번 주 남은 날에 더해요(이번 주에 남은 날이 없으면 다음 주로). 학기 전체 합계는 그대로예요.
 */
function applyLogs(items: ScheduleItem[], logs: StudyLog[], profile: ForecastProfile) {
  if (logs.length === 0) return;
  const semester_start = profile.semester_start!;
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  for (const log of sorted) {
    const target = items.find(
      (it) => (log.plan_id && it.plan_id === log.plan_id) || (log.certificate_id && it.certificate_id === log.certificate_id),
    );
    if (!target) continue;
    const w = weekOf(log.date, semester_start);
    if (!isInSemester(w) || target.base[w] <= 0) continue;

    const dates = weekDates(w, semester_start);
    const active = dates.map((d) => target.activeOn(d) && !target.logged.has(d));
    if (!active[dates.indexOf(log.date)]) continue;
    const shares = dayShares(dates, active, profile.daily_hours);
    const remainingInWeek = target.hours[w] - [...target.logged].filter(([d]) => weekOf(d, semester_start) === w).reduce((s, [, h]) => s + h, 0);
    const index = dates.indexOf(log.date);
    const planned = remainingInWeek * shares[index];
    const afterShare = shares.slice(index + 1).reduce((a, b) => a + b, 0);
    const afterHours = remainingInWeek * afterShare;
    const delta = log.hours - planned;
    target.logged.set(log.date, log.hours);

    if (delta > 0) {
      // 더 했으면: 이번 주 남은 날에서 먼저 빼고, 모자라면 다음 주들에서
      const inWeek = Math.min(delta, afterHours);
      let leftover = delta - inWeek;
      target.hours[w] += leftover;
      for (let next = w + 1; next <= TOTAL_WEEKS && leftover > 1e-9; next++) {
        const take = Math.min(leftover, target.hours[next]);
        target.hours[next] -= take;
        leftover -= take;
      }
    } else if (delta < 0 && afterHours <= 1e-9) {
      // 덜 했는데 이번 주에 남은 날이 없으면: 다음에 하는 주로 넘기기
      const deficit = -delta;
      const next = range(w + 1, TOTAL_WEEKS).find((x) => target.base[x] > 0);
      target.hours[w] -= deficit;
      if (next) target.hours[next] += deficit;
    }
  }
}

// ── 주차별 예보 (4.3) ─────────────────────────────────
/**
 * 주차 부담 = Σ(계획 주당 시간 × 가중치) + Σ(준비 중인 자격증 주당 학습 시간)
 * 가중치: 수업(class)이고 그 주가 중간·기말 주차면 1.5, 아니면 1
 * 부담률 = 부담 ÷ 가용 시간
 * 10/26: 공부 스타일(꾸준·보통·벼락치기)로 주별 모양이 바뀌고, 실제 기록이 있으면 남은 주가 다시 계산돼요.
 */
export function calculateForecast(input: ForecastInput): Forecast {
  const { profile } = input;
  if (!isSemesterReady(profile)) {
    throw new Error("학기 설정(가용 시간, 학기 시작일)을 마친 뒤에 예보를 계산할 수 있습니다.");
  }
  const { available_hours, midterm_week, final_week } = profile;
  const schedule = buildSchedule(input, true);

  const weeks: WeekForecast[] = [];
  for (let week = 1; week <= TOTAL_WEEKS; week++) {
    const is_exam_week = week === midterm_week || week === final_week;
    // 실제 기록으로 다 끝낸 계획(남은 시간 0)은 그 주 목록에서 빠져요 (10/27)
    const items: WeekItem[] = schedule
      .filter((s) => s.base[week] > 0 && s.hours[week] > 1e-6)
      .map((s) => ({
        source: s.item.source,
        title: s.item.title,
        base_hours: round1(s.base[week]),
        weighted: s.weighted[week],
        hours: Math.max(0, s.hours[week]),
        ...(s.item.source === "plan"
          ? { priority: s.item.priority, plan_type: s.item.plan_type, category_id: s.item.category_id }
          : {}),
      }));

    const total = items.reduce((sum, item) => sum + item.hours, 0);
    const ratio = total / available_hours;
    weeks.push({
      week,
      is_exam_week,
      total_hours: round1(total),
      ratio: round3(ratio),
      level: levelOf(ratio),
      items: items.map((item) => ({ ...item, hours: round1(item.hours) })),
    });
  }

  const count = (level: Weather) => weeks.filter((w) => w.level === level).length;
  return { weeks, summary: { storm: count("storm"), cloudy: count("cloudy"), clear: count("clear") } };
}

// ── 요일별 예보 (10/24 QA) ────────────────────────────
export interface DayForecast {
  date: string;
  /** 0 = 월요일 … 6 = 일요일 */
  weekday: number;
  /** 그 요일의 가용 시간 */
  available: number;
  /** 그날 예상 시간 (1분 단위로 맞춤) */
  hours: number;
  /** 부담률. 가용 시간이 0 인데 할 일이 있으면 null (폭풍으로 표시) */
  ratio: number | null;
  level: Weather;
  /** 그날 할 일별 시간 (많은 순, 1분 단위). 요일별 상세 화면에서 써요 */
  items: DayItem[];
}

/** 하루 할 일 한 줄 — 실제 기록용 id 와 기록 여부가 붙어요 */
export interface DayItem extends WeekItem {
  plan_id?: string;
  certificate_id?: string;
  /** 이날 실제로 기록한 시간이면 true (hours = 기록한 시간) */
  logged?: boolean;
}

/**
 * 한 주의 부담을 요일별로 나눠 봅니다. 계획은 정해진 요일이 없으므로
 * 그 계획이 걸친 날들(날짜로 정했으면 그 날짜만)에 요일별 가용 시간 비율대로 나눠 넣습니다.
 * 실제로 기록한 날은 기록한 시간, 나머지 날은 그 주에 남은 시간을 나눠요. 요일별 가용 시간이 없으면 null.
 * 주 합계는 calculateForecast 의 그 주 total_hours 와 같습니다.
 */
export function dailyForecast(input: ForecastInput, week: number): DayForecast[] | null {
  const { profile } = input;
  if (!isSemesterReady(profile)) return null;
  const daily = profile.daily_hours;
  if (!daily || daily.length !== 7) return null;
  const { semester_start } = profile;

  const dates = weekDates(week, semester_start);
  const available = dates.map((d) => daily[weekdayIndex(d)]);
  const hours = new Array<number>(7).fill(0);
  const items: DayItem[][] = dates.map(() => []);

  for (const s of buildSchedule(input, false)) {
    if (s.base[week] <= 0) continue;
    const base: DayItem = {
      ...s.item,
      base_hours: 0,
      weighted: s.weighted[week],
      hours: 0,
      ...(s.plan_id ? { plan_id: s.plan_id } : {}),
      ...(s.certificate_id ? { certificate_id: s.certificate_id } : {}),
    };
    const fixed = dates.map((d) => s.logged.get(d));
    const fixedSum = fixed.reduce<number>((sum, h) => sum + (h ?? 0), 0);
    const active = dates.map((d, i) => s.activeOn(d) && fixed[i] === undefined);
    // 날짜로 정한 일정이 이 주 안에 걸친 날이 없으면 그 주 모든 날에
    const shares = dayShares(dates, active.some(Boolean) ? active : dates.map((_, i) => fixed[i] === undefined), daily);
    const remaining = Math.max(0, s.hours[week] - fixedSum);
    dates.forEach((_, i) => {
      const value = fixed[i] ?? remaining * shares[i];
      hours[i] += value;
      if (value > 0 || fixed[i] !== undefined) items[i].push({ ...base, base_hours: value, hours: value, ...(fixed[i] !== undefined ? { logged: true } : {}) });
    });
  }

  return dates.map((date, i) => {
    const ratio = available[i] > 0 ? hours[i] / available[i] : null;
    const level: Weather = ratio === null ? (hours[i] > 0.05 ? "storm" : "clear") : levelOf(ratio);
    return {
      date,
      weekday: weekdayIndex(date),
      available: available[i],
      hours: roundMinute(hours[i]),
      ratio: ratio === null ? null : round3(ratio),
      level,
      items: items[i]
        .map((item) => ({ ...item, base_hours: roundMinute(item.base_hours), hours: roundMinute(item.hours) }))
        .sort((a, b) => b.hours - a.hours),
    };
  });
}

/** 한 주 가용 시간을 요일별로 나눈 기본값 [월~일]. 주말은 조금 적게 (온보딩 처음 값) */
export function splitWeeklyHours(weekly: number): number[] {
  const weekend = Math.min(Math.round(weekly * 0.1), 24);
  const rest = Math.max(weekly - weekend * 2, 0);
  const base = Math.floor(rest / 5);
  const extra = rest - base * 5;
  const weekdays = Array.from({ length: 5 }, (_, i) => Math.min(base + (i < extra ? 1 : 0), 24));
  return [...weekdays, weekend, weekend];
}

/** 폭풍 주에 줄여 볼 계획 — 우선순위 낮은 것부터 (10/24 QA). 수업·자격증보다 계획 항목만 */
export function trimSuggestions(week: WeekForecast): WeekItem[] {
  const order: Record<PlanPriority, number> = { low: 0, normal: 1, high: 2 };
  return week.items
    .filter((item) => item.source === "plan" && item.priority !== "high")
    .sort((a, b) => order[a.priority ?? "normal"] - order[b.priority ?? "normal"] || b.hours - a.hours);
}

// ── 학기 회고 요약 (10/24 QA) ─────────────────────────
export interface SemesterSummary {
  /** 16주 예상 시간 합계 */
  total_hours: number;
  /** 한 주 평균 */
  average_hours: number;
  /** 가장 바쁜 주 (같으면 앞 주) */
  busiest: WeekForecast;
  summary: Record<Weather, number>;
  /** 계획·자격증별 학기 전체 시간 (많은 순) */
  by_item: { source: WeekItem["source"]; title: string; hours: number }[];
}

/** 학기 전체를 한눈에: 합계·평균·가장 바쁜 주·항목별 시간. 회고 화면과 내보내기 파일에 씁니다. */
export function summarizeSemester(forecast: Forecast): SemesterSummary {
  const total = forecast.weeks.reduce((sum, w) => sum + w.total_hours, 0);
  const busiest = forecast.weeks.reduce((top, w) => (w.total_hours > top.total_hours ? w : top), forecast.weeks[0]);
  const byItem = new Map<string, { source: WeekItem["source"]; title: string; hours: number }>();
  for (const week of forecast.weeks) {
    for (const item of week.items) {
      const key = `${item.source}:${item.title}`;
      const prev = byItem.get(key) ?? { source: item.source, title: item.title, hours: 0 };
      prev.hours += item.hours;
      byItem.set(key, prev);
    }
  }
  return {
    total_hours: round1(total),
    average_hours: round1(total / TOTAL_WEEKS),
    busiest,
    summary: forecast.summary,
    by_item: [...byItem.values()].map((x) => ({ ...x, hours: round1(x.hours) })).sort((a, b) => b.hours - a.hours),
  };
}

// ── 사전 검토 (F-06) ─────────────────────────────────
/** 기존 예보와 계획을 더한 예보를 비교해 폭풍 주차 변화를 요약합니다 (FR-06-3). */
export function comparePreview(before: Forecast, after: Forecast): PreviewDiff {
  const new_storm_weeks = after.weeks
    .filter((w, i) => w.level === "storm" && before.weeks[i]?.level !== "storm")
    .map((w) => w.week);
  const storm_before = before.summary.storm;
  const storm_after = after.summary.storm;
  const added = new_storm_weeks.length > 0 ? ` (${new_storm_weeks.join(", ")}주차 추가)` : "";
  return { storm_before, storm_after, new_storm_weeks, message: `폭풍 ${storm_before}주 → ${storm_after}주${added}` };
}

/** 저장하지 않은 계획을 더했을 때의 예보와 변화 요약을 함께 계산합니다. */
export function previewForecast(input: ForecastInput, draftPlans: ForecastPlan[]) {
  const before = calculateForecast(input);
  const after = calculateForecast({ ...input, plans: [...input.plans, ...draftPlans] });
  return { before, after, diff: comparePreview(before, after) };
}

/** 저장하기 전에 바꿔 볼 내용 (사전 검토, F-06). 필요한 것만 넣으면 됩니다. */
export interface ForecastDraft {
  /** 새로 넣을 계획 (계획 등록) */
  addPlans?: ForecastPlan[];
  /** 빼고 계산할 저장된 계획 id. 계획 수정이면 [원래 계획 id] + addPlans 에 고친 값 */
  removePlanIds?: string[];
  /** 새로 고를 자격증 회차 (input.certificates 에 그 회차가 있어야 해요). 이미 고른 회차면 이 값으로 바꿔 계산 */
  addCertificates?: ForecastUserCertificate[];
  /** 빼고 계산할 자격증 회차 id. 회차 바꾸기면 [예전 회차 id] + addCertificates 에 새 회차 */
  removeCertificateIds?: string[];
}

/**
 * 계획·자격증을 저장하기 전에 "바꾸면 예보가 어떻게 되는지" 계산합니다 (F-06, FR-06-1).
 * 계획 등록·수정, 자격증 고르기·회차 바꾸기를 모두 이 함수 하나로 계산하고, DB 에는 아무것도 저장하지 않아요.
 * 예) 자격증 고르기:   previewDraft(input, { addCertificates: [{ certificate_id, prep_weeks, study_hours }] })
 *     회차 바꾸기:     previewDraft(input, { removeCertificateIds: [예전 id], addCertificates: [새 회차] })
 *     계획 수정:       previewDraft(input, { removePlanIds: [plan.id], addPlans: [고친 값] })
 * 돌려주는 값은 previewForecast 와 같아요: { before, after, diff }
 */
export function previewDraft(input: ForecastInput, draft: ForecastDraft) {
  const removePlans = new Set(draft.removePlanIds ?? []);
  const addCerts = draft.addCertificates ?? [];
  const replacedCerts = new Set([...(draft.removeCertificateIds ?? []), ...addCerts.map((uc) => uc.certificate_id)]);
  const before = calculateForecast(input);
  const after = calculateForecast({
    ...input,
    plans: [...input.plans.filter((p) => !(p.id && removePlans.has(p.id))), ...(draft.addPlans ?? [])],
    userCertificates: [...input.userCertificates.filter((uc) => !replacedCerts.has(uc.certificate_id)), ...addCerts],
  });
  return { before, after, diff: comparePreview(before, after) };
}

// ── 자격증 접수 일정·마감 알림 (FR-04-2, FR-04-4, F-07) ──────
// 팀 결정(10/14): F-07 마감 알림은 이메일 대신 화면 안 알림(홈 배너 + D-day)으로 합니다.
// 날짜는 모두 한국 시간 기준 "YYYY-MM-DD" 문자열로 다룹니다.

/** 홈 배너에 띄울 "접수 마감 임박" 기준 (오늘 포함 며칠 안) */
export const DEADLINE_ALERT_DAYS = 7;

export type DeadlineCertificate = Pick<
  Certificate,
  "id" | "name" | "round" | "apply_start" | "apply_end" | "exam_date" | "source_url"
>;

/** upcoming 접수 전 / open 접수 중 / closed 접수 마감(선택 불가, FR-04-2) */
export type ApplyStatus = "upcoming" | "open" | "closed";

export interface DeadlineAlert {
  certificate: DeadlineCertificate;
  status: ApplyStatus;
  /** 접수 마감까지 남은 날 (0 = 오늘 마감) */
  apply_dday: number;
  /** 시험까지 남은 날 */
  exam_dday: number;
}

/** 지금 한국 날짜 "YYYY-MM-DD". 화면에서는 인자 없이 부르면 됩니다. */
export function todayInKorea(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(now);
}

/** today 에서 date 까지 남은 날. 지난 날짜면 음수 (D-day 표시용, FR-04-4) */
export function daysUntil(date: string, today: string): number {
  return Math.round((Date.parse(date) - Date.parse(today)) / 86_400_000);
}

/** 회차의 접수 상태. 마감일 당일까지는 접수 중입니다. */
export function applyStatus(certificate: Pick<Certificate, "apply_start" | "apply_end">, today: string): ApplyStatus {
  if (today < certificate.apply_start) return "upcoming";
  if (today > certificate.apply_end) return "closed";
  return "open";
}

/** "D-3", 당일은 "D-day", 지났으면 null */
export function formatDday(days: number): string | null {
  if (days < 0) return null;
  return days === 0 ? "D-day" : `D-${days}`;
}

/**
 * 내가 고른 회차 중 접수 마감이 withinDays 일 안에 남은 것 (홈 배너, F-07 화면 알림).
 * 이미 마감된 회차는 빼고, 마감이 가까운 순서로 돌려줍니다.
 */
export function upcomingDeadlines(
  userCertificates: Pick<UserCertificate, "certificate_id">[],
  certificates: DeadlineCertificate[],
  today: string,
  withinDays: number = DEADLINE_ALERT_DAYS,
): DeadlineAlert[] {
  const certById = new Map(certificates.map((c) => [c.id, c]));
  return userCertificates
    .map((uc) => certById.get(uc.certificate_id))
    .filter((c): c is DeadlineCertificate => c !== undefined)
    .map((certificate) => ({
      certificate,
      status: applyStatus(certificate, today),
      apply_dday: daysUntil(certificate.apply_end, today),
      exam_dday: daysUntil(certificate.exam_date, today),
    }))
    .filter((a) => a.apply_dday >= 0 && a.apply_dday <= withinDays)
    .sort((a, b) => a.apply_dday - b.apply_dday);
}

// ── 시험 회차 추천 (F-09, FR-09-1) ────────────────────
// 같은 자격증의 다른 회차로 바꿨을 때의 예보를 계산해 폭풍 주차가 적은 순서로 돌려줍니다.
// 접수가 끝난 회차는 고를 수 없어 빼고, 이미 고른 회차는 비교용으로 남깁니다.

export type RoundCertificate = DeadlineCertificate & Pick<Certificate, "prep_weeks" | "default_study_hours">;

export interface RoundRecommendation {
  certificate: RoundCertificate;
  status: ApplyStatus;
  /** 이 회차로 준비하면 학기 전체 폭풍 주차 수 */
  storm_weeks: number;
  /** 지금 고른 회차인지 */
  is_current: boolean;
  /** 이 회차의 준비 주차 (학기 범위 밖 여부 포함) */
  prep_range: CertificatePrepRange;
}

export interface RecommendRoundsInput extends Omit<ForecastInput, "certificates"> {
  certificates: RoundCertificate[];
  /** 추천할 자격증 이름 (예: "정보처리기사") */
  name: string;
  /** 오늘 날짜 "YYYY-MM-DD" (todayInKorea()) */
  today: string;
}

/**
 * 폭풍 주차가 적은 회차부터 정렬해 돌려줍니다. 같으면 시험일이 빠른 회차가 먼저입니다.
 * 이미 고른 회차가 있으면 그 준비 기간·주당 학습 시간을 다른 회차에도 똑같이 적용해 공정하게 비교하고,
 * 없으면 회차별 기본값을 씁니다. 학기 설정 전이면 calculateForecast 와 같이 에러를 냅니다.
 */
export function recommendRounds({ name, today, ...input }: RecommendRoundsInput): RoundRecommendation[] {
  const certById = new Map(input.certificates.map((c) => [c.id, c]));
  const current = input.userCertificates.find((uc) => certById.get(uc.certificate_id)?.name === name);
  const others = input.userCertificates.filter((uc) => uc !== current);
  const semesterStart = input.profile.semester_start ?? today;

  return input.certificates
    .filter((c) => c.name === name)
    .map((certificate) => ({ certificate, status: applyStatus(certificate, today), is_current: certificate.id === current?.certificate_id }))
    .filter((c) => c.is_current || c.status !== "closed")
    .map(({ certificate, status, is_current }) => {
      const prep_weeks = current?.prep_weeks ?? certificate.prep_weeks;
      const study_hours = current?.study_hours ?? certificate.default_study_hours;
      const forecast = calculateForecast({
        ...input,
        userCertificates: [...others, { certificate_id: certificate.id, prep_weeks, study_hours }],
      });
      return {
        certificate,
        status,
        is_current,
        storm_weeks: forecast.summary.storm,
        prep_range: certificatePrepRange(certificate.exam_date, prep_weeks, semesterStart),
      };
    })
    .sort((a, b) => a.storm_weeks - b.storm_weeks || a.certificate.exam_date.localeCompare(b.certificate.exam_date));
}
