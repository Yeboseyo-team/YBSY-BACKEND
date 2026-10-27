// 달성률 (10/27 피드백: 시간 대신 "계획의 몇 %를 해낼 수 있는지")
import { describe, expect, it } from "vitest";
import { certificates, demoUsers, plans, profiles, userCertificates } from "@/mocks/dummy-data";
import { allocateWeek, calculateForecast, planLoads, semesterAchievement, weekAchievement, type ForecastInput, type WeekItem } from "./calc";

const yeboId = demoUsers.find((u) => u.email === "yebo@hakgi.test")!.id;
const base: ForecastInput = {
  profile: profiles.find((p) => p.user_id === yeboId)!,
  plans: plans.filter((p) => p.user_id === yeboId),
  userCertificates: userCertificates.filter((uc) => uc.user_id === yeboId),
  certificates,
};
const item = (title: string, hours: number, priority?: WeekItem["priority"]): WeekItem => ({ source: "plan", title, base_hours: hours, weighted: false, hours, priority });

describe("주 달성률", () => {
  it("쓸 수 있는 시간 ÷ 필요한 시간, 100% 를 넘지 않는다", () => {
    expect(weekAchievement({ total_hours: 50 }, 40)).toBeCloseTo(0.8);
    expect(weekAchievement({ total_hours: 20 }, 40)).toBe(1);
    expect(weekAchievement({ total_hours: 0 }, 40)).toBe(1);
  });
});

describe("시간이 모자랄 때 계획마다 나누기", () => {
  it("우선순위 높은 것부터, 같은 우선순위끼리는 필요한 시간 비율대로", () => {
    const week = { items: [item("높음", 10, "high"), item("보통A", 10), item("보통B", 30), item("낮음", 10, "low")] };
    const done = allocateWeek(week, 30);
    expect(done[0]).toBe(10);
    expect(done[1]).toBeCloseTo(5);
    expect(done[2]).toBeCloseTo(15);
    expect(done[3]).toBe(0);
  });

  it("시간이 넉넉하면 다 한다", () => {
    expect(allocateWeek({ items: [item("a", 5), item("b", 5, "low")] }, 40)).toEqual([5, 5]);
  });
});

describe("학기 달성률·계획별 부담", () => {
  const f = calculateForecast({ ...base, profile: { ...base.profile, study_style: "cram" } });
  const available = base.profile.available_hours!;

  it("학기 달성률은 주마다 해낼 수 있는 시간 합 ÷ 필요한 시간 합", () => {
    const s = semesterAchievement(f, available);
    const need = f.weeks.reduce((a, w) => a + w.total_hours, 0);
    const can = f.weeks.reduce((a, w) => a + Math.min(w.total_hours, available), 0);
    expect(s.rate).toBeCloseTo(can / need);
    expect(s.rate).toBeLessThanOrEqual(1);
  });

  it("계획별 해낼 수 있는 시간을 다 더하면 학기 해낼 수 있는 시간과 같고, 비중 합은 100%", () => {
    const loads = planLoads(f, available);
    const s = semesterAchievement(f, available);
    expect(loads.reduce((a, r) => a + r.can_hours, 0)).toBeCloseTo(s.can_hours, 1);
    expect(loads.reduce((a, r) => a + r.share, 0)).toBeCloseTo(1, 5);
    for (const r of loads) expect(r.rate).toBeLessThanOrEqual(1 + 1e-9);
  });

  it("fromWeek 앞의 주는 빼고 센다", () => {
    const later = semesterAchievement(f, available, 10);
    expect(later.need_hours).toBeCloseTo(f.weeks.filter((w) => w.week >= 10).reduce((a, w) => a + w.total_hours, 0));
  });
});
