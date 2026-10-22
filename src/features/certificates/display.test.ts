import { describe, expect, it } from "vitest";
import { applyStatus, certificatePrepRange } from "@/features/forecast/calc";
import { applyBadge, examLabel, prepSentence, prepWeeksLabel, validatePrep, withJosa } from "./display";

const START = "2026-08-31"; // 1주차 월요일
const TODAY = "2026-10-15"; // 7주차

describe("자격증 표시 문구", () => {
  it("접수 상태 배지", () => {
    const open = { apply_start: "2026-10-10", apply_end: "2026-10-18" };
    expect(applyBadge(open, applyStatus(open, TODAY), TODAY)).toEqual({ label: "접수 마감 D-3", tone: "urgent" });
    const upcoming = { apply_start: "2026-10-20", apply_end: "2026-10-30" };
    expect(applyBadge(upcoming, applyStatus(upcoming, TODAY), TODAY).label).toBe("접수 시작 D-5");
    const closed = { apply_start: "2026-09-01", apply_end: "2026-09-10" };
    expect(applyBadge(closed, applyStatus(closed, TODAY), TODAY)).toEqual({ label: "접수 마감됨", tone: "closed" });
  });

  it("시험 주차와 D-day", () => {
    const range = certificatePrepRange("2026-11-21", 6, START); // 12주차 토요일
    expect(examLabel("2026-11-21", range, TODAY)).toBe("시험 12주차, D-37");
    const out = certificatePrepRange("2027-03-07", 6, START);
    expect(examLabel("2027-03-07", out, TODAY)).toBe("시험 3월 7일, D-143");
    expect(examLabel("2026-10-01", null, TODAY)).toBe("시험 끝남");
  });

  it("준비 기간 문장 — 전부·일부·학기 밖 (FR-04-6)", () => {
    const full = certificatePrepRange("2026-11-21", 6, START);
    expect(prepWeeksLabel(full)).toBe("7~12주차");
    expect(prepSentence(full, 8, 7)).toBe("7주차(이번 주)부터 12주차 시험까지 6주 동안 한 주 8시간씩 예보에 더해져요.");

    const partial = certificatePrepRange("2026-09-12", 4, START); // 2주차 시험, 준비 -1~2
    expect(partial.coverage).toBe("partial");
    expect(prepSentence(partial, 5, 7)).toContain("1~2주차(2주)만");

    const out = certificatePrepRange("2027-03-07", 6, START);
    expect(prepWeeksLabel(out)).toBe("이번 학기 범위 밖");
    expect(prepSentence(out, 8, 7)).toContain("이번 학기 예보에는 들어가지 않아요");
  });

  it("받침에 맞는 조사", () => {
    expect(withJosa("SQLD 제63회", "을", "를")).toBe("SQLD 제63회를");
    expect(withJosa("정기 3회 실기", "을", "를")).toBe("정기 3회 실기를");
    expect(withJosa("정보처리기사 필기", "으로", "로")).toBe("정보처리기사 필기로");
    expect(withJosa("2027년 정기 1회 필기 (예정)", "을", "를")).toBe("2027년 정기 1회 필기 (예정)을(를)");
  });

  it("준비 기간·학습 시간 입력 확인", () => {
    expect(validatePrep(6, 8)).toBeNull();
    expect(validatePrep(0, 8)?.prep).toBeDefined();
    expect(validatePrep(6, 41)?.study).toBeDefined();
    expect(validatePrep(Number.NaN, 8)?.prep).toBeDefined();
  });
});
