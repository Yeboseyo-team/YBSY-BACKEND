import { describe, expect, it } from "vitest";
import type { Certificate } from "@/types/database";
import { dDay, daysUntil, groupByName, isApplyClosed, nextOpenRound, toForecastCertificates } from "./utils";

const cert = (id: string, name: string, apply_end: string, exam_date: string): Certificate => ({
  id,
  name,
  round: id,
  apply_start: "2026-01-01",
  apply_end,
  exam_date,
  prep_weeks: 6,
  default_study_hours: 8,
  source_url: null,
});

const r3 = cert("r3", "정보처리기사", "2026-07-24", "2026-08-09");
const r4 = cert("r4", "정보처리기사", "2026-10-22", "2026-11-28");
const today = "2026-10-13";

describe("날짜", () => {
  it("D-day", () => {
    expect(daysUntil("2026-10-16", today)).toBe(3);
    expect(dDay("2026-10-16", today)).toBe("D-3");
    expect(dDay(today, today)).toBe("D-day");
    expect(dDay("2026-10-11", today)).toBe("D+2");
  });
  it("접수 마감일 당일까지는 선택 가능 (FR-04-2)", () => {
    expect(isApplyClosed(r3, today)).toBe(true);
    expect(isApplyClosed(r4, "2026-10-22")).toBe(false);
    expect(isApplyClosed(r4, "2026-10-23")).toBe(true);
  });
});

describe("회차 묶기", () => {
  it("이름별로 묶고 시험일 순", () => {
    const groups = groupByName([r4, cert("s", "SQLD", "2026-10-16", "2026-11-14"), r3]);
    expect(groups.map((g) => g.name)).toEqual(["정보처리기사", "SQLD"]);
    expect(groups[0].rounds.map((r) => r.id)).toEqual(["r3", "r4"]);
  });
  it("가장 가까운 접수 중 회차", () => {
    expect(nextOpenRound([r3, r4], today)?.id).toBe("r4");
    expect(nextOpenRound([r3], today)).toBeUndefined();
  });
});

it("calc.ts 입력으로 나누기", () => {
  const out = toForecastCertificates([{ certificate_id: "r4", study_hours: 8, prep_weeks: 6, certificate: r4 }]);
  expect(out.userCertificates).toEqual([{ certificate_id: "r4", study_hours: 8, prep_weeks: 6 }]);
  expect(out.certificates).toEqual([{ id: "r4", name: "정보처리기사", exam_date: "2026-11-28" }]);
});
