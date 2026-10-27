// 학기 진단·해결 제안 (10/27)
import { describe, expect, it } from "vitest";
import { certificates, demoUsers, plans, profiles, userCertificates } from "@/mocks/dummy-data";
import { calculateForecast, type ForecastInput } from "./calc";
import { diagnose, planKeyOf, suggest } from "./advice";

const yeboId = demoUsers.find((u) => u.email === "yebo@hakgi.test")!.id;
const base: ForecastInput = {
  profile: profiles.find((p) => p.user_id === yeboId)!,
  plans: plans.filter((p) => p.user_id === yeboId),
  userCertificates: userCertificates.filter((uc) => uc.user_id === yeboId),
  certificates,
};
const cram: ForecastInput = { ...base, profile: { ...base.profile, study_style: "cram" } };

describe("진단", () => {
  it("폭풍 주차와 가장 바쁜 주를 알려 준다", () => {
    const d = diagnose(cram);
    const f = calculateForecast(cram);
    expect(d.stormWeeks).toEqual(f.weeks.filter((w) => w.level === "storm").map((w) => w.week));
    expect(d.peak!.total_hours).toBe(Math.max(...f.weeks.map((w) => w.total_hours)));
    expect(d.available).toBe(base.profile.available_hours);
  });
});

describe("해결 제안", () => {
  it("폭풍이 없으면 제안하지 않는다", () => {
    const calm: ForecastInput = { ...base, plans: [], userCertificates: [] };
    expect(suggest(calm)).toEqual([]);
  });

  it("최대 3개, 모두 실제로 나아지고, 효과 큰 순서", () => {
    const list = suggest(cram);
    expect(list.length).toBeGreaterThan(0);
    expect(list.length).toBeLessThanOrEqual(3);
    for (const a of list) expect(a.stormAfter < a.stormBefore || a.overAfter < a.overBefore).toBe(true);
    for (let i = 1; i < list.length; i++) expect(list[i].stormAfter).toBeGreaterThanOrEqual(list[i - 1].stormAfter);
  });

  it("제안의 '바꾼 뒤' 숫자는 그대로 적용해 다시 계산한 값과 같다", () => {
    for (const a of suggest(cram)) {
      let next: ForecastInput = cram;
      const act = a.action;
      if (act.type === "style") next = { ...cram, profile: { ...cram.profile, study_style: act.style } };
      if (act.type === "plan_hours") next = { ...cram, plans: cram.plans.map((p) => (planKeyOf(p) === act.planKey ? { ...p, hours_per_week: act.hours } : p)) };
      if (act.type === "remove_plan") next = { ...cram, plans: cram.plans.filter((p) => planKeyOf(p) !== act.planKey) };
      if (act.type === "available")
        next = { ...cram, profile: { ...cram.profile, daily_hours: act.daily_hours, available_hours: act.daily_hours.reduce((s, h) => s + h, 0) } };
      expect(calculateForecast(next).summary.storm).toBe(a.stormAfter);
    }
  });

  it("바꿀 수 없는 계획(예: 이미 저장된 계획)은 줄이자고 하지 않는다", () => {
    const list = suggest(cram, { canChangePlan: () => false });
    expect(list.every((a) => a.action.type !== "plan_hours" && a.action.type !== "remove_plan")).toBe(true);
  });

  it("같은 종류 제안은 하나만 (스타일 제안 두 개가 같이 나오지 않는다)", () => {
    const list = suggest(cram);
    expect(list.filter((a) => a.action.type === "style").length).toBeLessThanOrEqual(1);
  });
});

describe("지난 주는 빼고 센다", () => {
  it("fromWeek 뒤의 폭풍만 센다", () => {
    const all = diagnose(cram).stormWeeks;
    const later = diagnose(cram, 10).stormWeeks;
    expect(later).toEqual(all.filter((w) => w >= 10));
    for (const a of suggest(cram, { fromWeek: 10 })) expect(a.stormBefore).toBe(later.length);
  });
});
