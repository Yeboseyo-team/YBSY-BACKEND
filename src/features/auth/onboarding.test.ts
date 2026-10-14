import { describe, expect, it } from "vitest";
import { demoUsers, profiles } from "@/mocks/dummy-data";
import { isOnboardingDone, toMonday } from "./onboarding";

const profileOf = (email: string) => profiles.find((p) => p.user_id === demoUsers.find((u) => u.email === email)!.id)!;

describe("온보딩 완료 판정 (FR-01-11, NFR-LEGAL-1)", () => {
  it("학기 설정·동의를 마친 김예보는 통과, 정새내는 온보딩으로", () => {
    expect(isOnboardingDone(profileOf("yebo@hakgi.test"))).toBe(true);
    expect(isOnboardingDone(profileOf("newbie@hakgi.test"))).toBe(false);
  });

  it("학기 설정을 했어도 개인정보 동의가 없으면 온보딩으로", () => {
    expect(isOnboardingDone({ ...profileOf("yebo@hakgi.test"), privacy_agreed_at: null })).toBe(false);
  });

  it("프로필을 아직 못 불러왔으면 false", () => {
    expect(isOnboardingDone(null)).toBe(false);
    expect(isOnboardingDone(undefined)).toBe(false);
  });
});

describe("학기 시작일 → 그 주 월요일 (DB 제약: 1주차 월요일)", () => {
  it("월요일은 그대로, 다른 요일은 그 주 월요일로", () => {
    expect(toMonday("2026-08-31")).toBe("2026-08-31"); // 월
    expect(toMonday("2026-09-02")).toBe("2026-08-31"); // 수
    expect(toMonday("2026-09-06")).toBe("2026-08-31"); // 일
    expect(toMonday("2026-09-01")).toBe("2026-08-31"); // 화 (디자인 예시 "9/1 개강")
  });
});
