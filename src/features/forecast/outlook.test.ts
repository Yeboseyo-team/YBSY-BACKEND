import { describe, expect, it } from "vitest";
import type { Weather } from "./calc";
import { examOf, nextCertificateExam, nextWeekWith, outlookText } from "./outlook";

const weeksOf = (levels: Weather[]) => levels.map((level, i) => ({ week: i + 1, level }));

describe("날씨 앱식 예보 문구 (10/28)", () => {
  // 김예보 예시: 8·9주차 폭풍, 10·11 흐림, 12~14 맑음
  const weeks = weeksOf(["clear", "clear", "cloudy", "cloudy", "cloudy", "cloudy", "cloudy", "storm", "storm", "cloudy", "cloudy", "clear", "clear", "clear", "cloudy", "clear"]);

  it("다음 주와 날씨가 바뀌는 주를 한 줄로", () => {
    expect(outlookText(weeks, 8)).toBe("다음 주도 폭풍 · 10주차부터 흐림");
    expect(outlookText(weeks, 9)).toBe("다음 주는 흐림 · 12주차부터 맑음");
    expect(outlookText(weeksOf(["cloudy", "clear", "clear"]), 1)).toBe("다음 주는 맑음 · 학기 끝까지");
    expect(outlookText(weeks, 16)).toBe("이번 주가 마지막 주예요");
  });

  it("다음 맑은 주", () => {
    expect(nextWeekWith(weeks, 8, "clear")).toBe(12);
    expect(nextWeekWith(weeks, 16, "clear")).toBeNull();
  });

  it("시험 주간 이름 (시험 없는 학기면 null)", () => {
    expect(examOf(8, 8, 15)).toBe("중간고사");
    expect(examOf(15, 8, 15)).toBe("기말고사");
    expect(examOf(9, 8, 15)).toBeNull();
    expect(examOf(8, null, null)).toBeNull();
  });

  it("내 자격증 중 가장 가까운 시험 (지난 시험·안 고른 자격증은 빼요)", () => {
    const certificates = [
      { id: "a", name: "SQLD", exam_date: "2026-11-15" },
      { id: "b", name: "정보처리기사", exam_date: "2026-10-20" },
      { id: "c", name: "TOEIC", exam_date: "2026-11-01" },
    ];
    const mine = [{ certificate_id: "a" }, { certificate_id: "b" }];
    expect(nextCertificateExam(mine, certificates, "2026-10-25")).toEqual({ name: "SQLD", days: 21 });
    expect(nextCertificateExam([], certificates, "2026-10-25")).toBeNull();
  });
});
