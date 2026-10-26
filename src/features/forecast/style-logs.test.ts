// 10/26 피드백: 공부 스타일(벼락치기)과 실제 기록 반영
import { describe, expect, it } from "vitest";
import { certificates, demoUsers, plans, profiles, userCertificates } from "@/mocks/dummy-data";
import { calculateForecast, dailyForecast, type ForecastInput, type StudyLog } from "./calc";

const yeboId = demoUsers.find((u) => u.email === "yebo@hakgi.test")!.id;
const base: ForecastInput = {
  profile: profiles.find((p) => p.user_id === yeboId)!,
  plans: plans.filter((p) => p.user_id === yeboId),
  userCertificates: userCertificates.filter((uc) => uc.user_id === yeboId),
  certificates,
};
const withStyle = (style: string): ForecastInput => ({ ...base, profile: { ...base.profile, study_style: style } });
const withLogs = (logs: StudyLog[]): ForecastInput => ({ ...base, logs });
const os = plans.find((p) => p.user_id === yeboId && p.title === "운영체제")!;
const itemHours = (input: ForecastInput, week: number, title: string) =>
  calculateForecast(input).weeks[week - 1].items.find((i) => i.title === title)?.hours ?? 0;
const semesterBase = (input: ForecastInput, title: string) =>
  calculateForecast(input).weeks.reduce((sum, w) => sum + (w.items.find((i) => i.title === title)?.base_hours ?? 0), 0);

describe("공부 스타일 (꾸준·보통·벼락치기)", () => {
  it("꾸준형은 지금까지와 똑같다", () => {
    expect(calculateForecast(withStyle("steady"))).toEqual(calculateForecast(base));
  });

  it("벼락치기형: 수업은 평소 주가 절반, 시험 직전 2주(7·8주, 14·15주)에 몰리고 학기 합계는 같다", () => {
    const cram = withStyle("cram");
    expect(itemHours(cram, 1, "운영체제")).toBe(3);
    expect(itemHours(cram, 8, "운영체제")).toBeGreaterThan(itemHours(base, 8, "운영체제"));
    expect(itemHours(cram, 14, "운영체제")).toBeGreaterThan(6);
    expect(semesterBase(cram, "운영체제")).toBeCloseTo(semesterBase(base, "운영체제"), 1);
  });

  it("보통은 그 중간, 활동(정기 모임)은 스타일과 상관없이 그대로", () => {
    expect(itemHours(withStyle("normal"), 1, "운영체제")).toBe(4.5);
    expect(itemHours(withStyle("cram"), 1, "프로그래밍 학회")).toBe(4);
  });

  it("벼락치기형이면 시험 주가 더 무거워져 폭풍 주가 늘거나 같다", () => {
    expect(calculateForecast(withStyle("cram")).summary.storm).toBeGreaterThanOrEqual(calculateForecast(base).summary.storm);
  });
});

describe("실제 기록 반영 (같은 계획의 남은 일정에서 빼기)", () => {
  it("월요일에 계획보다 더 해도 이번 주 남은 날로 흡수되면 주 합계는 그대로, 월요일은 기록한 시간", () => {
    const input = withLogs([{ plan_id: os.id, date: "2026-10-26", hours: 5 }]);
    expect(itemHours(input, 9, "운영체제")).toBe(6);
    const monday = dailyForecast(input, 9)![0].items.find((i) => i.title === "운영체제")!;
    expect(monday).toMatchObject({ hours: 5, logged: true, plan_id: os.id });
    const rest = dailyForecast(input, 9)!.slice(1).reduce((s, d) => s + (d.items.find((i) => i.title === "운영체제")?.hours ?? 0), 0);
    expect(rest).toBeCloseTo(1, 1);
  });

  it("이번 주 남은 시간보다 많이 하면 다음 주에서 뺀다 (학기 합계는 그대로)", () => {
    const input = withLogs([{ plan_id: os.id, date: "2026-10-26", hours: 10 }]);
    expect(itemHours(input, 9, "운영체제")).toBe(10);
    expect(itemHours(input, 10, "운영체제")).toBe(2);
    const total = (i: ForecastInput) => calculateForecast(i).weeks.reduce((s, w) => s + (w.items.find((x) => x.title === "운영체제")?.hours ?? 0), 0);
    expect(total(input)).toBeCloseTo(total(base), 1);
  });

  it("주 마지막 날 덜 했으면 모자란 만큼 다음 주로", () => {
    const input = withLogs([{ plan_id: os.id, date: "2026-11-01", hours: 0 }]);
    expect(itemHours(input, 9, "운영체제")).toBeCloseTo(5.5, 1);
    expect(itemHours(input, 10, "운영체제")).toBeCloseTo(6.5, 1);
  });
});

describe("시험 없는 수업 (발표·과제로 평가, 10/26)", () => {
  const noExam = (input: ForecastInput): ForecastInput => ({
    ...input,
    plans: input.plans.map((p) => (p.id === os.id ? { ...p, no_exam: true } : p)),
  });

  it("시험 주간에도 1.5배를 하지 않는다", () => {
    expect(itemHours(base, 8, "운영체제")).toBe(9);
    expect(itemHours(noExam(base), 8, "운영체제")).toBe(6);
  });

  it("벼락치기형이면 시험 전이 아니라 수업이 끝나는 마지막 2주에 몰린다", () => {
    const cram = noExam(withStyle("cram"));
    expect(itemHours(cram, 8, "운영체제")).toBe(3);
    expect(itemHours(cram, 16, "운영체제")).toBeGreaterThan(6);
  });
});

describe("다 끝낸 계획은 예보에서 빠진다 (10/27)", () => {
  it("남은 시간을 미리 다 하면 다음 주 목록에서 사라진다", () => {
    const short = { ...os, id: "short-plan", title: "짧은 과제", start_week: 9, end_week: 10, hours_per_week: 2, start_date: null, end_date: null };
    const input: ForecastInput = { ...base, plans: [...base.plans, short], logs: [{ plan_id: "short-plan", date: "2026-10-26", hours: 4 }] };
    expect(itemHours(input, 9, "짧은 과제")).toBe(4);
    expect(calculateForecast(input).weeks[9].items.find((i) => i.title === "짧은 과제")).toBeUndefined();
    expect(calculateForecast(base).weeks[9].items.find((i) => i.title === "짧은 과제")).toBeUndefined();
    expect(calculateForecast({ ...base, plans: [...base.plans, short] }).weeks[9].items.find((i) => i.title === "짧은 과제")?.hours).toBe(2);
  });
});
