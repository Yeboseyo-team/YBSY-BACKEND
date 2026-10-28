// 예보 달력의 자격증 일정 (10/27)
import { describe, expect, it } from "vitest";
import { certificateEvents, monthsBetween } from "./calendar-events";

describe("달력에 넣을 자격증 일정", () => {
  it("회차마다 접수 시작·접수 마감·시험 3개, 날짜 순", () => {
    const events = certificateEvents([
      { name: "SQLD", round: "제60회", apply_start: "2026-10-20", apply_end: "2026-10-24", exam_date: "2026-11-15" },
      { name: "TOEIC", round: "제540회", apply_start: "2026-10-01", apply_end: "2026-11-15", exam_date: "2026-12-20" },
    ]);
    expect(events).toHaveLength(6);
    expect(events.map((e) => e.date)).toEqual([...events.map((e) => e.date)].sort());
    // 같은 날이면 시험이 먼저
    const sameDay = events.filter((e) => e.date === "2026-11-15");
    expect(sameDay.map((e) => e.kind)).toEqual(["exam", "apply_end"]);
  });
});

describe("달 목록", () => {
  it("해를 넘어가도 빠짐없이", () => {
    expect(monthsBetween("2026-11", "2027-02")).toEqual(["2026-11", "2026-12", "2027-01", "2027-02"]);
    expect(monthsBetween("2026-10", "2026-10")).toEqual(["2026-10"]);
  });
});
