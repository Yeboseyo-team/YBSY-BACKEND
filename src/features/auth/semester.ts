// 학기 설정 화면(온보딩 S-07, 설정 S-12)에서 쓰는 표시용 값.
// 날짜는 시간대 영향을 받지 않도록 "YYYY-MM-DD" 문자열로만 다룹니다. 월요일 맞추기는 ./onboarding.ts 의 toMonday.

export const HOURS_PRESETS = [
  { hours: 40, label: "여유롭게" },
  { hours: 50, label: "보통" },
  { hours: 60, label: "빡빡하게" },
] as const;

export const DEFAULT_SEMESTER = { availableHours: 50, midtermWeek: 8, finalWeek: 15 } as const;

/** "9/1" 같은 짧은 표기 */
export function shortDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${m}/${d}`;
}

/** "2026년 9월 1일" */
export function longDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

/** 처음 온보딩할 때 개강일 기본값: 1~7월이면 3월 1일, 8~12월이면 9월 1일 (today = "YYYY-MM-DD") */
export function defaultSemesterStart(today: string): string {
  const [y, m] = today.split("-").map(Number);
  return m <= 7 ? `${y}-03-01` : `${y}-09-01`;
}
