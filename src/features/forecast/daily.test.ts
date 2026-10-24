// 10/24 QA 반영 계산: 개강일 기준 주차, 날짜 → 주차, 요일별 예보, 우선순위 줄이기 후보
import { describe, expect, it } from "vitest";
import { certificates, demoUsers, plans, profiles, userCertificates } from "@/mocks/dummy-data";
import {
  calculateForecast,
  dailyForecast,
  splitWeeklyHours,
  trimSuggestions,
  weekDates,
  weekOf,
  weeksFromDates,
  type ForecastInput,
} from "./calc";

const yeboId = demoUsers.find((u) => u.email === "yebo@hakgi.test")!.id;
const yebo: ForecastInput = {
  profile: profiles.find((p) => p.user_id === yeboId)!,
  plans: plans.filter((p) => p.user_id === yeboId),
  userCertificates: userCertificates.filter((uc) => uc.user_id === yeboId),
  certificates,
};

describe("1주차 = 개강일부터 7일 (10/24 QA)", () => {
  it("9/1(화) 개강이면 1주차는 9/1~9/7, 2주차는 9/8부터", () => {
    expect(weekDates(1, "2026-09-01")).toEqual([
      "2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05", "2026-09-06", "2026-09-07",
    ]);
    expect(weekDates(2, "2026-09-01")[0]).toBe("2026-09-08");
    expect(weekOf("2026-09-07", "2026-09-01")).toBe(1);
    expect(weekOf("2026-09-08", "2026-09-01")).toBe(2);
  });
});

describe("날짜로 정한 기간 → 주차", () => {
  it("하루짜리 일정은 그 주차 하나", () => {
    expect(weeksFromDates("2026-10-31", "2026-10-31", "2026-08-31")).toEqual({ start_week: 9, end_week: 9 });
  });
  it("학기 밖으로 걸치면 1·16주차로 자르고, 완전히 밖이면 null", () => {
    expect(weeksFromDates("2026-08-01", "2026-09-10", "2026-08-31")).toEqual({ start_week: 1, end_week: 2 });
    expect(weeksFromDates("2026-12-01", "2027-01-31", "2026-08-31")).toEqual({ start_week: 14, end_week: 16 });
    expect(weeksFromDates("2027-02-01", "2027-02-10", "2026-08-31")).toBeNull();
  });
});

describe("요일별 예보", () => {
  it("요일별 합계는 그 주 부담과 같다", () => {
    const week9 = calculateForecast(yebo).weeks[8];
    const days = dailyForecast(yebo, 9)!;
    expect(days).toHaveLength(7);
    expect(days.reduce((sum, d) => sum + d.hours, 0)).toBeCloseTo(week9.total_hours, 0);
  });

  it("날짜를 정한 일정(10/31 토 결혼식 6시간)은 그날에만 들어가 토요일이 폭풍", () => {
    const days = dailyForecast(yebo, 9)!;
    const saturday = days.find((d) => d.date === "2026-10-31")!;
    expect(saturday.weekday).toBe(5);
    expect(saturday.hours).toBeGreaterThan(6);
    expect(saturday.level).toBe("storm");
    expect(days[0].level).toBe("cloudy"); // 월요일은 결혼식 없이 42시간을 비율대로 → 84%
  });

  it("그날 할 일별 시간이 그날 합계와 같고, 결혼식은 토요일에만 있다", () => {
    const days = dailyForecast(yebo, 9)!;
    for (const day of days) expect(day.items.reduce((sum, item) => sum + item.hours, 0)).toBeCloseTo(day.hours, 0);
    const wedding = days.filter((d) => d.items.some((i) => i.title === "사촌형 결혼식"));
    expect(wedding.map((d) => d.date)).toEqual(["2026-10-31"]);
    expect(wedding[0].items[0]).toMatchObject({ title: "사촌형 결혼식", hours: 6, plan_type: "custom" });
  });

  it("요일별 시간을 안 정했으면 null", () => {
    expect(dailyForecast({ ...yebo, profile: { ...yebo.profile, daily_hours: null } }, 9)).toBeNull();
  });

  it("가용 시간이 0인 날에 할 일이 몰리면 폭풍 (부담률 없음)", () => {
    const days = dailyForecast({ ...yebo, profile: { ...yebo.profile, daily_hours: [10, 10, 10, 10, 10, 0, 0] } }, 9)!;
    const saturday = days.find((d) => d.date === "2026-10-31")!;
    expect(saturday.ratio).toBeNull();
    expect(saturday.level).toBe("storm");
  });

  it("한 주 시간을 요일별로 나눈 기본값 — 합계가 같다", () => {
    expect(splitWeeklyHours(50)).toEqual([8, 8, 8, 8, 8, 5, 5]);
    for (const w of [1, 13, 40, 45, 60, 100]) expect(splitWeeklyHours(w).reduce((a, b) => a + b, 0)).toBe(w);
  });
});

describe("폭풍 주에 줄여 볼 계획 (우선순위)", () => {
  it("중요한 계획과 자격증은 빼고, 우선순위 낮은 것 → 시간이 많은 것 순", () => {
    const week8 = calculateForecast(yebo).weeks[7];
    expect(week8.level).toBe("storm");
    const titles = trimSuggestions(week8).map((i) => i.title);
    expect(titles.slice(0, 2)).toEqual(["소프트웨어공학", "프로그래밍 학회"]);
    expect(titles).not.toContain("알고리즘"); // 중요
    expect(titles).not.toContain("정보처리기사 준비");
  });
});
