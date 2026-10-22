import { describe, expect, it } from "vitest";
import { defaultSemesterStart, longDate, shortDate } from "./semester";

describe("semester 표시 함수", () => {
  it("날짜를 짧게·길게 표시한다", () => {
    expect(shortDate("2026-09-01")).toBe("9/1");
    expect(longDate("2026-09-01")).toBe("2026년 9월 1일");
  });

  it("개강일 기본값은 1~7월이면 3월, 8~12월이면 9월", () => {
    expect(defaultSemesterStart("2026-02-10")).toBe("2026-03-01");
    expect(defaultSemesterStart("2026-07-31")).toBe("2026-03-01");
    expect(defaultSemesterStart("2026-08-01")).toBe("2026-09-01");
  });
});
