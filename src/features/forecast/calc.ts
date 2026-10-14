// 학기 부담 산출 — 기준: 요구사항 명세서(2026-10-13) 4장
// 부담 계산은 이 파일 한 곳에서만 합니다. DB 호출 없이 순수 계산만 합니다.
// 참조 구현: scripts/generate-dummy.mjs 의 forecast() — 결과가 같아야 합니다.
import type { Certificate, Plan, Profile, UserCertificate } from "@/types/database";

// ── 산출 상수 (명세서 2.3, 4장) ─────────────────────────
export const TOTAL_WEEKS = 16;
export const EXAM_WEIGHT = 1.5;
/** 0.8 미만 맑음, 0.8 이상 1.0 이하 흐림, 1.0 초과 폭풍 */
export const LEVEL_THRESHOLD = { CLOUDY_FROM: 0.8, STORM_ABOVE: 1.0 } as const;

const WEEK_MS = 7 * 86_400_000;

// ── 타입 ─────────────────────────────────────────────
/** 4.4 단계: clear 맑음 / cloudy 흐림 / storm 폭풍 */
export type Weather = "clear" | "cloudy" | "storm";

/** 예보에 필요한 학기 설정. 온보딩 전(null)이면 예보를 낼 수 없습니다. */
export type ForecastProfile = Pick<Profile, "available_hours" | "semester_start" | "midterm_week" | "final_week">;
/** 저장된 계획과 저장 전 계획(사전 검토) 모두 받을 수 있도록 필요한 필드만 씁니다. */
export type ForecastPlan = Pick<Plan, "title" | "type" | "start_week" | "end_week" | "hours_per_week">;
export type ForecastUserCertificate = Pick<UserCertificate, "certificate_id" | "study_hours" | "prep_weeks">;
export type ForecastCertificate = Pick<Certificate, "id" | "name" | "exam_date">;

export interface ForecastInput {
  profile: ForecastProfile;
  plans: ForecastPlan[];
  userCertificates: ForecastUserCertificate[];
  /** userCertificates 가 가리키는 회차 정보 */
  certificates: ForecastCertificate[];
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
const round3 = (n: number) => Math.round(n * 1000) / 1000;

/** 학기 설정(가용 시간·학기 시작일)을 마쳤는지. 마치지 않았으면 예보를 낼 수 없습니다 (FR-01-11). */
export function isSemesterReady(
  profile: ForecastProfile,
): profile is ForecastProfile & { available_hours: number; semester_start: string } {
  return profile.available_hours !== null && profile.available_hours > 0 && profile.semester_start !== null;
}

// ── 주차별 예보 (4.3) ─────────────────────────────────
/**
 * 주차 부담 = Σ(계획 주당 시간 × 가중치) + Σ(준비 중인 자격증 주당 학습 시간)
 * 가중치: 수업(class)이고 그 주가 중간·기말 주차면 1.5, 아니면 1
 * 부담률 = 부담 ÷ 가용 시간
 */
export function calculateForecast({ profile, plans, userCertificates, certificates }: ForecastInput): Forecast {
  if (!isSemesterReady(profile)) {
    throw new Error("학기 설정(가용 시간, 학기 시작일)을 마친 뒤에 예보를 계산할 수 있습니다.");
  }
  const { available_hours, semester_start, midterm_week, final_week } = profile;

  const certById = new Map(certificates.map((c) => [c.id, c]));
  const certRanges = userCertificates.map((uc) => {
    const cert = certById.get(uc.certificate_id);
    if (!cert) throw new Error(`자격증 회차 정보를 찾을 수 없습니다: ${uc.certificate_id}`);
    const range = certificatePrepRange(cert.exam_date, uc.prep_weeks, semester_start);
    return { title: `${cert.name} 준비`, hours: uc.study_hours, weeks: new Set(range.weeks) };
  });

  const weeks: WeekForecast[] = [];
  for (let week = 1; week <= TOTAL_WEEKS; week++) {
    const is_exam_week = week === midterm_week || week === final_week;
    const items: WeekItem[] = [];

    for (const plan of plans) {
      if (week < plan.start_week || week > plan.end_week) continue;
      const weighted = plan.type === "class" && is_exam_week;
      items.push({
        source: "plan",
        title: plan.title,
        base_hours: plan.hours_per_week,
        weighted,
        hours: plan.hours_per_week * (weighted ? EXAM_WEIGHT : 1),
      });
    }
    for (const cert of certRanges) {
      if (!cert.weeks.has(week)) continue;
      items.push({ source: "certificate", title: cert.title, base_hours: cert.hours, weighted: false, hours: cert.hours });
    }

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
