import { describe, expect, it } from "vitest";
import { displayNameSchema, onboardingSchema, semesterSchema } from "./schemas";

const valid = { semesterStart: "2026-09-01", dailyHours: [8, 8, 8, 8, 8, 5, 5], midtermWeek: 8, finalWeek: 15 };

describe("학기 설정 검증", () => {
  it("올바른 값은 통과", () => {
    expect(semesterSchema.safeParse(valid).success).toBe(true);
  });

  it("기말이 중간보다 앞이면 기말 칸에 오류", () => {
    const r = semesterSchema.safeParse({ ...valid, midtermWeek: 10, finalWeek: 9 });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(["finalWeek"]);
  });

  it("요일별 시간은 0~24 정수 7개, 합계 1시간 이상 (10/24)", () => {
    expect(semesterSchema.safeParse({ ...valid, dailyHours: [0, 0, 0, 0, 0, 0, 0] }).success).toBe(false);
    expect(semesterSchema.safeParse({ ...valid, dailyHours: [25, 0, 0, 0, 0, 0, 0] }).success).toBe(false);
    expect(semesterSchema.safeParse({ ...valid, dailyHours: [8, 8, 8] }).success).toBe(false);
    expect(semesterSchema.safeParse({ ...valid, dailyHours: [8, 8, 8, 8, 8, 5, Number.NaN] }).success).toBe(false);
  });

  it("온보딩은 개인정보 동의가 필수 (NFR-LEGAL-1)", () => {
    const r = onboardingSchema.safeParse({ ...valid, agreePrivacy: false });
    expect(r.success).toBe(false);
    expect(r.error?.issues.map((i) => i.path.join("."))).toContain("agreePrivacy");
    expect(onboardingSchema.safeParse({ ...valid, agreePrivacy: true }).success).toBe(true);
  });

  it("이름은 1~40자, 앞뒤 공백 제거", () => {
    expect(displayNameSchema.safeParse({ displayName: "   " }).success).toBe(false);
    expect(displayNameSchema.safeParse({ displayName: "가".repeat(41) }).success).toBe(false);
    expect(displayNameSchema.parse({ displayName: " 김예보 " }).displayName).toBe("김예보");
  });
});
