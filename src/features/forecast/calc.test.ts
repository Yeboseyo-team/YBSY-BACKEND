import { describe, expect, it } from "vitest";
import {
  DEMO_TODAY,
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
  applyStatus,
  calculateForecast,
  certificatePrepRange,
  comparePreview,
  daysUntil,
  formatDday,
  isSemesterReady,
  levelOf,
  previewDraft,
  previewForecast,
  recommendRounds,
  semesterWeekOf,
  todayInKorea,
  upcomingDeadlines,
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
const jiwon = userIdOf("jiwon@hakgi.test");
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
    expect(classItem).toEqual({ source: "plan", title: "운영체제", base_hours: 6, weighted: true, hours: 9, priority: "normal" });
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

  it("준비 기간 일부만 학기 안이면 그 주차만 반영 (이지원: 정보처리기사 2027년 1회, 준비 8주 → 15~22주 중 15·16주)", () => {
    const cert = certificates.find((c) => c.name === "정보처리기사" && c.round.startsWith("2027년"))!;
    const mine = userCertificates.find((uc) => uc.user_id === jiwon && uc.certificate_id === cert.id)!;
    const range = certificatePrepRange(cert.exam_date, mine.prep_weeks, SEMESTER_START);
    expect(range.coverage).toBe("partial");
    expect(range.from_week).toBe(15);
    expect(range.weeks).toEqual([15, 16]);
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

describe("자격증 접수 일정·마감 알림 (FR-04-2, FR-04-4, F-07 화면 알림)", () => {
  const certOf = (name: string, roundPrefix = "") =>
    certificates.find((c) => c.name === name && c.round.startsWith(roundPrefix))!;

  it("한국 날짜: UTC 10/13 16:00 은 한국 10/14", () => {
    expect(todayInKorea(new Date("2026-10-13T16:00:00Z"))).toBe("2026-10-14");
    expect(todayInKorea(new Date("2026-10-13T14:59:00Z"))).toBe("2026-10-13");
  });

  it("D-day: 남은 날 계산과 표시", () => {
    expect(daysUntil("2026-10-16", DEMO_TODAY)).toBe(3);
    expect(daysUntil(DEMO_TODAY, DEMO_TODAY)).toBe(0);
    expect(daysUntil("2026-10-10", DEMO_TODAY)).toBe(-3);
    expect(formatDday(3)).toBe("D-3");
    expect(formatDday(0)).toBe("D-day");
    expect(formatDday(-1)).toBeNull();
  });

  it("접수 상태: 마감 지난 회차는 closed(선택 불가), 마감일 당일은 open", () => {
    expect(applyStatus(certOf("정보처리기사", "2026년 정기 3회"), DEMO_TODAY)).toBe("closed");
    expect(applyStatus(certOf("빅데이터분석기사", "제13회 실기"), DEMO_TODAY)).toBe("upcoming");
    expect(applyStatus(certOf("SQLD", "제63회"), DEMO_TODAY)).toBe("open");
    expect(applyStatus(certOf("SQLD", "제63회"), "2026-10-16")).toBe("open");
    expect(applyStatus(certOf("SQLD", "제63회"), "2026-10-17")).toBe("closed");
  });

  it("홈 배너: 박운영은 SQLD 63회 접수 마감 D-3 하나만 (빅데이터 실기는 D-17 이라 7일 밖)", () => {
    const mine = userCertificates.filter((uc) => uc.user_id === woonyoung);
    const alerts = upcomingDeadlines(mine, certificates, DEMO_TODAY);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].certificate.name).toBe("SQLD");
    expect(alerts[0].apply_dday).toBe(3);
    expect(alerts[0].status).toBe("open");

    const within20 = upcomingDeadlines(mine, certificates, DEMO_TODAY, 20);
    expect(within20.map((a) => [a.certificate.name, a.apply_dday])).toEqual([["SQLD", 3], ["빅데이터분석기사", 17]]);
  });

  it("발표일(10/27): 박운영 홈에 빅데이터분석기사 실기 접수 마감 D-3 배너", () => {
    const mine = userCertificates.filter((uc) => uc.user_id === woonyoung);
    const alerts = upcomingDeadlines(mine, certificates, "2026-10-27");
    expect(alerts.map((a) => [a.certificate.name, a.apply_dday, a.status])).toEqual([["빅데이터분석기사", 3, "open"]]);
  });

  it("마감이 지난 회차와 고른 자격증이 없는 사용자는 알림 없음", () => {
    expect(upcomingDeadlines(userCertificates.filter((uc) => uc.user_id === woonyoung), certificates, "2026-10-31")).toEqual([]);
    expect(upcomingDeadlines([], certificates, DEMO_TODAY)).toEqual([]);
  });
});

describe("시험 회차 추천 (F-09, FR-09-1)", () => {
  it("김예보 정보처리기사: 2027년 1회로 미루면 폭풍 1주 → 0주. 접수 끝난 3회 필기는 제외, 지금 고른 3회 실기는 비교용으로 남김", () => {
    const recs = recommendRounds({ ...inputOf(yebo), certificates, name: "정보처리기사", today: DEMO_TODAY });
    expect(recs.map((r) => [r.certificate.round, r.storm_weeks, r.status, r.is_current])).toEqual([
      ["2027년 정기 1회 필기 (예정)", 0, "upcoming", false],
      ["2026년 정기 3회 실기", 1, "closed", true],
    ]);
    expect(recs[0].prep_range.coverage).toBe("out");
  });

  it("지금 고른 회차의 준비 기간·학습 시간을 다른 회차에도 똑같이 적용", () => {
    // 이지원은 2027년 1회를 준비 8주로 늘려 둠 → 같은 8주로 비교
    const recs = recommendRounds({ ...inputOf(jiwon), certificates, name: "정보처리기사", today: DEMO_TODAY });
    const current = recs.find((r) => r.is_current)!;
    expect(current.certificate.round).toBe("2027년 정기 1회 필기 (예정)");
    expect(current.prep_range.weeks).toEqual([15, 16]);
  });

  it("아직 고르지 않은 자격증은 회차 기본값으로 비교 (최수강 · 빅데이터분석기사: 접수 전인 13회 실기만)", () => {
    const recs = recommendRounds({ ...inputOf(empty), certificates, name: "빅데이터분석기사", today: DEMO_TODAY });
    expect(recs.map((r) => [r.certificate.round, r.storm_weeks, r.is_current])).toEqual([["제13회 실기", 0, false]]);
  });

  it("고를 수 있는 회차가 없으면 빈 목록", () => {
    expect(recommendRounds({ ...inputOf(empty), certificates, name: "유통관리사 2급", today: DEMO_TODAY })).toEqual([]);
  });
});

describe("사전 검토: 자격증 고르기·회차 바꾸기·계획 수정 (previewDraft, F-06)", () => {
  const SQLD63 = "c0000000-0000-4000-8000-000000000007";
  const BIGDATA_PRACTICAL = "c0000000-0000-4000-8000-000000000011"; // 시험 11/28 = 13주차
  const hours = (f: { weeks: { total_hours: number }[] }, week: number) => f.weeks[week - 1].total_hours;

  it("자격증 고르기: 김예보가 빅데이터분석기사 실기(준비 6주, 주 10시간)를 고르면 9·10·11주차가 새로 폭풍", () => {
    const { before, after, diff } = previewDraft(inputOf(yebo), {
      addCertificates: [{ certificate_id: BIGDATA_PRACTICAL, prep_weeks: 6, study_hours: 10 }],
    });
    expect(hours(before, 9)).toBe(48); // 42 + 사촌형 결혼식 6 (10/31)
    expect(hours(after, 9)).toBe(58);
    expect(hours(after, 13)).toBe(44);
    expect(diff.message).toBe("폭풍 1주 → 4주 (9, 10, 11주차 추가)");
  });

  it("회차 바꾸기: SQLD 63회(9~11주)를 빼고 빅데이터 실기(준비 3주 → 11~13주)를 넣음", () => {
    const { after } = previewDraft(inputOf(yebo), {
      removeCertificateIds: [SQLD63],
      addCertificates: [{ certificate_id: BIGDATA_PRACTICAL, prep_weeks: 3, study_hours: 8 }],
    });
    expect([hours(after, 9), hours(after, 10), hours(after, 11), hours(after, 12), hours(after, 13)]).toEqual([40, 34, 42, 42, 42]); // 9주차는 결혼식 6시간
    expect(after.weeks.flatMap((w) => w.items).some((i) => i.title === "SQLD 준비")).toBe(false);
  });

  it("이미 고른 회차를 다시 넣으면 두 번 더하지 않고 새 값으로 바꿔 계산 (준비 시간 수정 미리 보기)", () => {
    const { after } = previewDraft(inputOf(yebo), {
      addCertificates: [{ certificate_id: SQLD63, prep_weeks: 3, study_hours: 12 }],
    });
    expect(hours(after, 9)).toBe(52); // 34 + 결혼식 6 + 12 (8시간이 남아 있으면 60)
  });

  it("계획 수정: 프로그래밍 학회를 주 4시간 → 20시간으로 바꾸면 원래 계획은 빼고 계산", () => {
    const input = inputOf(yebo);
    const club = plans.find((p) => p.user_id === yebo && p.title === "프로그래밍 학회")!;
    const { after } = previewDraft(input, { removePlanIds: [club.id], addPlans: [{ ...club, hours_per_week: 20 }] });
    expect(hours(after, 8)).toBe(73); // 수업 45 + 학회 20 + 정보처리기사 8
    expect(hours(after, 1)).toBe(50);
    expect(after.weeks[0].level).toBe("cloudy"); // 정확히 100%
  });

  it("계획 추가만 하면 previewForecast 와 같은 결과, 입력값은 바뀌지 않음", () => {
    const input = inputOf(yebo);
    const snapshot = JSON.stringify(input);
    expect(previewDraft(input, { addPlans: [previewPlan] })).toEqual(previewForecast(input, [previewPlan]));
    expect(previewDraft(input, {}).diff.message).toBe("폭풍 1주 → 1주");
    expect(JSON.stringify(input)).toBe(snapshot);
  });
});

describe("성능 (NFR-PERF-2: 사전 검토 계산은 서버 호출 없이 0.2초 이내)", () => {
  it("계획 30개 + 자격증 2개인 사용자의 사전 검토 계산이 0.2초보다 훨씬 빠름", () => {
    const base = inputOf(yebo);
    const plans30 = Array.from({ length: 30 }, (_, i) => ({
      id: `p${i}`,
      title: `계획 ${i + 1}`,
      type: i % 3 === 0 ? "class" : "activity",
      start_week: (i % 16) + 1,
      end_week: 16,
      hours_per_week: 1.5,
    }));
    const input = { ...base, plans: plans30 };
    const draft = {
      removePlanIds: ["p0"],
      addPlans: [{ ...plans30[0], hours_per_week: 10 }],
      addCertificates: [{ certificate_id: "c0000000-0000-4000-8000-000000000011", prep_weeks: 6, study_hours: 10 }],
    };
    previewDraft(input, draft); // 첫 실행(준비) 제외
    const runs = 50;
    const start = performance.now();
    for (let i = 0; i < runs; i++) previewDraft(input, draft);
    const perRunMs = (performance.now() - start) / runs;
    expect(perRunMs).toBeLessThan(200);
    expect(perRunMs).toBeLessThan(20); // 실제로는 1ms 안팎 — 여유 있게 20ms 로 확인
  });
});
