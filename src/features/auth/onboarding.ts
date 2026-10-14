// 온보딩 완료 판정 — FR-01-11, NFR-LEGAL-1 (DB 호출 없음)
import type { Profile } from "@/types/database";
import { isSemesterReady } from "@/features/forecast/calc";

export type OnboardingProfile = Pick<
  Profile,
  "available_hours" | "semester_start" | "midterm_week" | "final_week" | "privacy_agreed_at"
>;

/**
 * 가용 시간·학기 시작일·개인정보 동의가 모두 있어야 예보 화면에 들어갈 수 있습니다.
 * 하나라도 비면 /onboarding 으로 보냅니다 (온보딩 가드에서 사용).
 */
export function isOnboardingDone(profile: OnboardingProfile | null | undefined): boolean {
  return Boolean(profile && isSemesterReady(profile) && profile.privacy_agreed_at);
}

/** 학기 시작일은 1주차 월요일이어야 합니다 (DB 제약). 아무 날짜나 그 주의 월요일로 바꿔 줍니다. "YYYY-MM-DD" */
export function toMonday(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  const day = d.getUTCDay(); // 0 = 일요일
  d.setUTCDate(d.getUTCDate() - ((day + 6) % 7));
  return d.toISOString().slice(0, 10);
}
