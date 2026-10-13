/**
 * 학기 설정(FR-01-11)에 쓰는 날짜 계산.
 * profiles.semester_start 는 DB 제약상 월요일이어야 하므로, 사용자가 고른 날이 들어 있는 주의 월요일로 맞춰 저장합니다.
 * 날짜는 시간대 영향을 받지 않도록 "YYYY-MM-DD" 문자열과 UTC 자정 Date로만 다룹니다.
 */

export const SEMESTER_WEEKS = 16;
export const HOURS_PRESETS = [
  { hours: 40, label: "여유롭게" },
  { hours: 50, label: "보통" },
  { hours: 60, label: "빡빡하게" },
] as const;

function parse(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function format(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** 그 날이 들어 있는 주의 월요일 */
export function mondayOf(iso: string): string {
  const date = parse(iso);
  const sinceMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - sinceMonday);
  return format(date);
}

/** "9/1" 같은 짧은 표기 */
export function shortDate(iso: string): string {
  const date = parse(iso);
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
}

/** 처음 온보딩할 때 개강일 기본값: 1~7월이면 3월 1일, 8~12월이면 9월 1일 */
export function defaultSemesterStart(today = new Date()): string {
  const year = today.getFullYear();
  return today.getMonth() < 7 ? `${year}-03-01` : `${year}-09-01`;
}
