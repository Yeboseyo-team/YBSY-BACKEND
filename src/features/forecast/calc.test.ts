import { describe, expect, it } from "vitest";
import {
  certificates,
  demoUsers,
  expectedForecast,
  expectedForecastWithPreview,
  expectedPreviewDiff,
  plans,
  previewPlan,
  profiles,
  userCertificates,
} from "@/mocks/dummy-data";
import {
  calculateForecast,
  certificatePrepRange,
  comparePreview,
  isSemesterReady,
  levelOf,
  previewForecast,
  semesterWeekOf,
  weekOf,
  type ForecastInput,
} from "./calc";

const SEMESTER_START = "2026-08-31";

function userIdOf(email: string): string {
  const user = demoUsers.find((u) => u.email === email);
  if (!user) throw new Error(`데모 계정 없음: ${email}`);
  return user.id;
}

function inputOf(userId: string): ForecastInput {
  const profile = profiles.find((p) => p.user_id === userId);
  if (!profile) throw new Error(`프로필 없음: ${userId}`);
  return {
    profile,
    plans: plans.filter((p) => p.user_id === userId),
    userCertificates: userCertificates.filter((uc) => uc.user_id === userId),
    certificates,
  };
}

const yebo = userIdOf("yebo@hakgi.test");
const woonyoung = userIdOf("woonyoung@hakgi.test");
const empty = userIdOf("empty@hakgi.test");
const newbie = userIdOf("newbie@hakgi.test");

describe("주차 계산 (4.1)", () => {
  it("학기 시작일은 1주차, 7일 뒤는 2주차", () => {
    expect(weekOf("2026-08-31", SEMESTER_START)).toBe(1);
    expect(weekOf("2026-09-06", SEMESTER_START)).toBe(1);
    expect(weekOf("2026-09-07", SEMESTER_START)).toBe(2);
    expect(weekOf("2026-10-13", SEMESTER_START)).toBe(7);
  });

  it("1~16주차 밖이면 학기 범위 밖(null)", () => {
    expect(semesterWeekOf("2026-08-30", SEMESTER_START)).toBeNull();
    expect(semesterWeekOf("2026-12-20", SEMESTER_START)).toBe(16);
    expect(semesterWeekOf("2026-12-21", SEMESTER_START)).toBeNull();
  });
});

describe("명세서 4.5 검증 예시", () => {
  it("김예보 8주차 = 57시간, 부담률 1.14, 폭풍", () => {
    const week8 = calculateForecast(inputOf(yebo)).weeks[7];
    expect(week8.week).toBe(8);
    expect(week8.total_hours).toBe(57);
    expect(week8.ratio).toBe(1.14);
    expect(week8.level).toBe("storm");
  });

  it("8주차 상세 내역: 수업만 시험 가중치 적용", () => {
    const { items } = calculateForecast(inputOf(yebo)).weeks[7];
    const classItem = items.find((x) => x.title === "운영체제");
    const activityItem = items.find((x) => x.title === "프로그래밍 학회");
    const certItem = items.find((x) => x.source === "certificate");
    expect(classItem).toEqual({ source: "plan", title: "운영체제", base_hours: 6, weighted: true, hours: 9 });
    expect(activityItem?.weighted).toBe(false);
    expect(certItem).toEqual({ source: "certificate", title: "정보처리기사 준비", base_hours: 8, weighted: false, hours: 8 });
  });
});

describe("데모 계정 예보가 참조 구현(expectedForecast)과 같다", () => {
  for (const [userId, expected] of Object.entries(expectedForecast)) {
    const name = profiles.find((p) => p.user_id === userId)?.display_name;
    it(`${name}`, () => {
      expect(calculateForecast(inputOf(userId))).toEqual(expected);
    });
  }

  it("학기 설정을 마친 데모 계정 4명이 모두 비교됨", () => {
    expect(Object.keys(expectedForecast)).toHaveLength(4);
  });
});

describe("사전 검토 (F-06)", () => {
  it("요약이 expectedPreviewDiff와 같다", () => {
    const { after, diff } = previewForecast(inputOf(yebo), [previewPlan]);
    expect(after).toEqual(expectedForecastWithPreview);
    expect(diff).toEqual(expectedPreviewDiff);
    expect(diff.message).toBe("폭풍 1주 → 3주 (9, 10주차 추가)");
  });

  it("새 폭풍 주차가 없으면 괄호 없이 요약", () => {
    const base = calculateForecast(inputOf(yebo));
    expect(comparePreview(base, base).message).toBe("폭풍 1주 → 1주");
  });
});

describe("경계값과 예외", () => {
  it("박운영 8주차 부담률 정확히 1.0 → 흐림", () => {
    const week8 = calculateForecast(inputOf(woonyoung)).weeks[7];
    expect(week8.total_hours).toBe(55);
    expect(week8.ratio).toBe(1);
    expect(week8.level).toBe("cloudy");
  });

  it("단계 기준: 0.8 미만 맑음 / 0.8~1.0 흐림 / 1.0 초과 폭풍", () => {
    expect(levelOf(0.799)).toBe("clear");
    expect(levelOf(0.8)).toBe("cloudy");
    expect(levelOf(1.0)).toBe("cloudy");
    expect(levelOf(1.0001)).toBe("storm");
  });

  it("준비 기간이 학기 밖인 자격증(정보처리기사 2027년 1회)은 반영하지 않음", () => {
    const cert = certificates.find((c) => c.name === "정보처리기사" && c.round.startsWith("2027년"));
    expect(cert).toBeDefined();
    const range = certificatePrepRange(cert!.exam_date, cert!.prep_weeks, SEMESTER_START);
    expect(range.coverage).toBe("out");
    expect(range.weeks).toEqual([]);

    const input = inputOf(empty);
    const forecast = calculateForecast({
      ...input,
      userCertificates: [{ certificate_id: cert!.id, study_hours: 8, prep_weeks: cert!.prep_weeks }],
    });
    expect(forecast.weeks.every((w) => w.total_hours === 0 && w.items.length === 0)).toBe(true);
  });

  it("준비 기간 일부만 학기 안이면 그 주차만 반영 (전산회계 1급 13~17주 → 13~16)", () => {
    const cert = certificates.find((c) => c.name === "전산회계 1급")!;
    const range = certificatePrepRange(cert.exam_date, cert.prep_weeks, SEMESTER_START);
    expect(range.coverage).toBe("partial");
    expect(range.weeks).toEqual([13, 14, 15, 16]);
  });

  it("계획이 없는 사용자 → 전부 0, 맑음", () => {
    const forecast = calculateForecast(inputOf(empty));
    expect(forecast.weeks).toHaveLength(16);
    for (const w of forecast.weeks) {
      expect(w.total_hours).toBe(0);
      expect(w.ratio).toBe(0);
      expect(w.level).toBe("clear");
      expect(w.items).toEqual([]);
    }
    expect(forecast.summary).toEqual({ storm: 0, cloudy: 0, clear: 16 });
  });

  it("학기 설정 전 사용자는 예보를 계산하지 않음", () => {
    const input = inputOf(newbie);
    expect(isSemesterReady(input.profile)).toBe(false);
    expect(() => calculateForecast(input)).toThrow();
  });
});
