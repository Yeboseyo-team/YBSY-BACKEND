import { describe, expect, it } from "vitest";
import { DEMO_TODAY, certificates } from "@/mocks/dummy-data";
import { searchCertificates } from "./search";

describe("자격증 검색 (FR-04-1, FR-04-2, FR-04-4)", () => {
  it('"정보처리" 검색 → 정보처리기사·정보처리산업기사가 모두 보임', () => {
    expect(searchCertificates(certificates, "정보처리", DEMO_TODAY).map((g) => g.name)).toEqual(["정보처리기사", "정보처리산업기사"]);
  });

  it("공백·대소문자 무시 (sqld, '정보 처리')", () => {
    expect(searchCertificates(certificates, "sqld", DEMO_TODAY).map((g) => g.name)).toEqual(["SQLD"]);
    expect(searchCertificates(certificates, " 정보 처리 ", DEMO_TODAY)).toHaveLength(2);
  });

  it("빈 검색어면 전체를 이름별로 묶음", () => {
    const groups = searchCertificates(certificates, "", DEMO_TODAY);
    expect(groups.reduce((n, g) => n + g.rounds.length, 0)).toBe(certificates.length);
    expect(new Set(groups.map((g) => g.name)).size).toBe(groups.length);
  });

  it("회차는 시험일 순, 접수 마감 회차는 선택 불가, D-day 계산", () => {
    const [info] = searchCertificates(certificates, "정보처리기사", DEMO_TODAY);
    expect(info.rounds.map((r) => [r.certificate.round, r.status, r.selectable])).toEqual([
      ["2026년 정기 3회 필기", "closed", false],
      ["2026년 정기 3회 실기", "closed", false],
      ["2027년 정기 1회 필기 (예정)", "upcoming", true],
    ]);
    const [sqld] = searchCertificates(certificates, "SQLD", DEMO_TODAY);
    const r63 = sqld.rounds.find((r) => r.certificate.round === "제63회")!;
    expect([r63.status, r63.selectable, r63.apply_dday, r63.exam_dday]).toEqual(["open", true, 3, 32]);
  });

  it("없는 자격증은 빈 목록", () => {
    expect(searchCertificates(certificates, "없는자격증", DEMO_TODAY)).toEqual([]);
  });
});
