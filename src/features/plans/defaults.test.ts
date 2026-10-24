import { describe, expect, it } from "vitest";
import { demoUsers, plans } from "@/mocks/dummy-data";
import { MAX_PLANS, canAddPlan, defaultHoursPerWeek, groupPlansByType } from "./defaults";

describe("계획 기본 시간 (F-03)", () => {
  it("3학점 수업 보통 = 주 4.5시간 (10/24: 수업 밖 공부 시간만)", () => {
    expect(defaultHoursPerWeek("class", "normal", 3)).toBe(4.5);
  });

  it("수업은 학점에 비례, 활동·프로젝트는 학점과 무관", () => {
    expect(defaultHoursPerWeek("class", "low", 2)).toBe(2);
    expect(defaultHoursPerWeek("class", "high", 6)).toBe(12);
    expect(defaultHoursPerWeek("activity", "normal")).toBe(4);
    expect(defaultHoursPerWeek("project", "high")).toBe(10);
  });

  it("직접 입력이거나 수업인데 학점이 없으면 자동값 없음(null)", () => {
    expect(defaultHoursPerWeek("activity", "custom")).toBeNull();
    expect(defaultHoursPerWeek("class", "normal", null)).toBeNull();
    expect(defaultHoursPerWeek("custom", "normal")).toBeNull();
  });

  it("데모 데이터의 기본값 계획은 모두 이 규칙과 같은 시간", () => {
    for (const p of plans.filter((x) => x.load_level !== "custom")) {
      expect(defaultHoursPerWeek(p.type, p.load_level, p.credits)).toBe(p.hours_per_week);
    }
  });
});

describe("계획 목록 정리 (FR-02-2, FR-02-5)", () => {
  it("유형별로 묶고(수업 → 활동 → 프로젝트) 시작 주차 순, 빈 유형은 빠짐", () => {
    const jiwon = demoUsers.find((u) => u.email === "jiwon@hakgi.test")!.id;
    const groups = groupPlansByType(plans.filter((p) => p.user_id === jiwon));
    expect(groups.map((g) => [g.label, g.plans.length])).toEqual([["수업", 5], ["활동", 1], ["프로젝트", 1]]);

    const shuffled = [
      { type: "class", start_week: 5, end_week: 9, created_at: "b", title: "늦게 시작" },
      { type: "class", start_week: 1, end_week: 16, created_at: "a", title: "먼저 시작" },
    ];
    expect(groupPlansByType(shuffled)[0].plans.map((p) => p.title)).toEqual(["먼저 시작", "늦게 시작"]);
  });

  it(`계획은 ${MAX_PLANS}개까지`, () => {
    expect(canAddPlan(29)).toBe(true);
    expect(canAddPlan(30)).toBe(false);
  });
});
