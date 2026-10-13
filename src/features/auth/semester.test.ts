import { describe, expect, it } from "vitest";
import { semesterSchema } from "./schemas";
import { defaultSemesterStart, mondayOf, shortDate } from "./semester";

describe("mondayOf", () => {
  it("월요일은 그대로 둡니다", () => {
    expect(mondayOf("2026-08-31")).toBe("2026-08-31");
  });
  it("주 중간 날짜는 그 주 월요일로 맞춥니다", () => {
    expect(mondayOf("2026-09-01")).toBe("2026-08-31"); // 화요일
    expect(mondayOf("2026-09-06")).toBe("2026-08-31"); // 일요일
  });
  it("달과 해를 넘어갑니다", () => {
    expect(mondayOf("2027-01-01")).toBe("2026-12-28");
  });
});

describe("shortDate / defaultSemesterStart", () => {
  it("짧은 날짜 표기", () => {
    expect(shortDate("2026-08-31")).toBe("8/31");
  });
  it("8월 이후는 2학기, 그 전은 1학기 개강일", () => {
    expect(defaultSemesterStart(new Date(2026, 9, 13))).toBe("2026-09-01");
    expect(defaultSemesterStart(new Date(2027, 0, 5))).toBe("2027-03-01");
  });
});

describe("semesterSchema", () => {
  const valid = { semesterStart: "2026-09-01", availableHours: 50, midtermWeek: 8, finalWeek: 15 };

  it("올바른 값은 통과", () => {
    expect(semesterSchema.safeParse(valid).success).toBe(true);
  });
  it("가용 시간 범위 1~168", () => {
    expect(semesterSchema.safeParse({ ...valid, availableHours: 0 }).success).toBe(false);
    expect(semesterSchema.safeParse({ ...valid, availableHours: 169 }).success).toBe(false);
    expect(semesterSchema.safeParse({ ...valid, availableHours: Number.NaN }).success).toBe(false);
  });
  it("기말은 중간보다 뒤 주차여야 하고, 오류는 기말 입력란에 붙습니다", () => {
    const result = semesterSchema.safeParse({ ...valid, midtermWeek: 15, finalWeek: 8 });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["finalWeek"]);
  });
  it("개강일이 비어 있으면 실패", () => {
    expect(semesterSchema.safeParse({ ...valid, semesterStart: "" }).success).toBe(false);
  });
});
