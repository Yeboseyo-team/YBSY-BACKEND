// 자격증 화면(S-10) 표시 문구 — 계산은 calc.ts 의 결과만 씁니다.
import { daysUntil, formatDday, type ApplyStatus, type CertificatePrepRange } from "@/features/forecast/calc";
import type { Certificate } from "@/types/database";

export const PREP_WEEKS_RANGE = { min: 1, max: 16 } as const;
export const STUDY_HOURS_RANGE = { min: 1, max: 40 } as const;

type ApplyTone = "urgent" | "open" | "upcoming" | "closed";

/** 접수 상태 배지: "접수 마감 D-3" / "접수 시작 D-5" / "접수 마감됨" (FR-04-2, FR-04-4) */
export function applyBadge(
  certificate: Pick<Certificate, "apply_start" | "apply_end">,
  status: ApplyStatus,
  today: string,
): { label: string; tone: ApplyTone } {
  if (status === "closed") return { label: "접수 마감됨", tone: "closed" };
  if (status === "upcoming") {
    return { label: `접수 시작 ${formatDday(daysUntil(certificate.apply_start, today))}`, tone: "upcoming" };
  }
  const days = daysUntil(certificate.apply_end, today);
  return { label: `접수 마감 ${formatDday(days)}`, tone: days <= 7 ? "urgent" : "open" };
}

/** "시험 8주차, D-40" / 학기 밖이면 "시험 3월 7일, D-143" / 지났으면 "시험 끝남" */
export function examLabel(examDate: string, range: CertificatePrepRange | null, today: string): string {
  const days = daysUntil(examDate, today);
  if (days < 0) return "시험 끝남";
  const dday = formatDday(days);
  if (range && range.exam_week >= 1 && range.exam_week <= 16) return `시험 ${range.exam_week}주차, ${dday}`;
  const [, m, d] = examDate.split("-").map(Number);
  return `시험 ${m}월 ${d}일, ${dday}`;
}

/** 준비 기간이 예보에 어떻게 들어가는지 한 문장 (FR-04-3, FR-04-6) */
export function prepSentence(range: CertificatePrepRange, studyHours: number, currentWeek: number | null): string {
  if (range.coverage === "out") {
    return "이번 학기 범위 밖이에요. 시험과 준비 기간이 모두 1~16주차 밖이라 이번 학기 예보에는 들어가지 않아요.";
  }
  const first = range.weeks[0];
  const last = range.weeks[range.weeks.length - 1];
  const fromLabel = first === currentWeek ? `${first}주차(이번 주)` : `${first}주차`;
  if (range.coverage === "full") {
    return `${fromLabel}부터 ${last}주차 시험까지 ${range.weeks.length}주 동안 한 주 ${studyHours}시간씩 예보에 더해져요.`;
  }
  return `준비 기간 중 이번 학기에 걸친 ${prepWeeksLabel(range)}(${range.weeks.length}주)만 한 주 ${studyHours}시간씩 예보에 더해져요.`;
}

/** "3~8주차" / 학기 밖이면 "이번 학기 범위 밖" */
export function prepWeeksLabel(range: CertificatePrepRange): string {
  if (range.coverage === "out") return "이번 학기 범위 밖";
  const first = range.weeks[0];
  const last = range.weeks[range.weeks.length - 1];
  return first === last ? `${first}주차` : `${first}~${last}주차`;
}

/** 준비 기간·학습 시간 입력 확인. 문제가 없으면 null */
export function validatePrep(prepWeeks: number, studyHours: number): { prep?: string; study?: string } | null {
  const errors: { prep?: string; study?: string } = {};
  if (!Number.isInteger(prepWeeks) || prepWeeks < PREP_WEEKS_RANGE.min || prepWeeks > PREP_WEEKS_RANGE.max) {
    errors.prep = "준비 기간은 1~16주 사이로 입력하세요.";
  }
  if (!Number.isInteger(studyHours) || studyHours < STUDY_HOURS_RANGE.min || studyHours > STUDY_HOURS_RANGE.max) {
    errors.study = "한 주 공부 시간은 1~40시간 사이로 입력하세요.";
  }
  return errors.prep || errors.study ? errors : null;
}

/** 받침에 따라 조사 고르기: withJosa("SQLD 제63회", "을", "를") → "SQLD 제63회를". 한글로 안 끝나면 "을(를)" */
export function withJosa(word: string, withBatchim: string, withoutBatchim: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return `${word}${withBatchim}(${withoutBatchim})`;
  return `${word}${code % 28 ? withBatchim : withoutBatchim}`;
}
