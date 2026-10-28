// 왜 바쁜지 설명 (10/27)
import { describe, expect, it } from "vitest";
import { certificates, demoUsers, plans, profiles, userCertificates } from "@/mocks/dummy-data";
import { calculateForecast, type ForecastInput } from "./calc";
import { explainBusy } from "./explain";

const yeboId = demoUsers.find((u) => u.email === "yebo@hakgi.test")!.id;
const base: ForecastInput = {
  profile: profiles.find((p) => p.user_id === yeboId)!,
  plans: plans.filter((p) => p.user_id === yeboId),
  userCertificates: userCertificates.filter((uc) => uc.user_id === yeboId),
  certificates,
};
const cram: ForecastInput = { ...base, profile: { ...base.profile, study_style: "cram" } };

describe("왜 바쁜지 설명", () => {
  it("폭풍이 없으면 아무것도 안 보여 준다", () => {
    expect(explainBusy({ ...base, plans: [], userCertificates: [] })).toBeNull();
  });

  it("폭풍 주차와 가장 바쁜 주를 알려 준다", () => {
    const e = explainBusy(cram)!;
    const f = calculateForecast(cram);
    expect(e.stormWeeks).toEqual(f.weeks.filter((w) => w.level === "storm").map((w) => w.week));
    expect(e.peak.total_hours).toBe(Math.max(...f.weeks.map((w) => w.total_hours)));
  });

  it("시간이 많이 드는 순서로 최대 5개, 계획마다 이유 문장이 있다", () => {
    const { reasons } = explainBusy(cram)!;
    expect(reasons.length).toBeGreaterThan(0);
    expect(reasons.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < reasons.length; i++) expect(reasons[i].hours).toBeLessThanOrEqual(reasons[i - 1].hours);
    for (const r of reasons) expect(r.text.length).toBeGreaterThan(5);
  });

  it("수업은 학점과 A+ 기준, 자격증은 준비 기간을 말해 준다", () => {
    const { reasons } = explainBusy(cram, 1, 20)!;
    const cls = reasons.find((r) => r.kind === "class");
    expect(cls?.text).toMatch(/학점 수업은.*A\+/);
    const cert = reasons.find((r) => r.kind === "certificate");
    if (cert) expect(cert.text).toMatch(/주 동안 매주/);
  });

  it("벼락치기면 몰린다는 까닭이 붙는다", () => {
    const e = explainBusy(cram)!;
    if (e.peak.week !== 8 && e.peak.week !== 15) return;
    expect(e.why.join(" ")).toMatch(/시험 주간|벼락치기/);
  });

  it("fromWeek 뒤의 폭풍만 센다", () => {
    const all = explainBusy(cram)!.stormWeeks;
    expect(explainBusy(cram, 10)?.stormWeeks ?? []).toEqual(all.filter((w) => w >= 10));
  });
});

describe("지금 내 계획 상태", () => {
  it("평소 한 주 시간과 기준 비교, 기록한 시간을 알려 준다", () => {
    const os = base.plans.find((p) => p.title === "운영체제")!;
    const withLog: ForecastInput = { ...cram, logs: [{ plan_id: os.id, date: "2026-10-26", hours: 3 }] };
    const r = explainBusy(withLog, 1, 20)!.reasons.find((x) => x.title === "운영체제");
    if (!r) return;
    expect(r.now).toMatch(/^지금은 매주 .+으로 잡혀 있어요 \(기준/);
    expect(r.now).toContain("지금까지 3시간 기록했어요");
  });
});
