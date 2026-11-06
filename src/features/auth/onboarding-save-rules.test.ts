import { describe, expect, it } from "vitest";
import { toOnboardingSaveMessage } from "./onboarding-save-rules";

describe("온보딩 2단계 저장 오류 문구", () => {
  it("어떤 오류든 아무것도 저장되지 않았다고 알려 줘요", () => {
    for (const error of [new TypeError("x"), { code: "P0030" }, { code: "P0033" }, { code: "P0043" }, { code: "23514", message: "plans" }, new Error("x")]) {
      expect(toOnboardingSaveMessage(error)).toContain("아무것도 저장되지 않았");
    }
  });

  it("자격증 값 오류와 계획 값 오류를 구분해요", () => {
    expect(toOnboardingSaveMessage({ code: "23514", message: 'violates check constraint "user_certificates_prep_weeks_check"' })).toContain("준비 기간");
    expect(toOnboardingSaveMessage({ code: "23514", message: 'violates check constraint "plans_title_check"' })).toContain("계획 내용");
  });
});
