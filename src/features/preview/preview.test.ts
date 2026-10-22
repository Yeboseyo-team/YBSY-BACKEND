import { describe, expect, it } from "vitest";
import { certificates, demoUsers, expectedPreviewDiff, plans, previewPlan, profiles, userCertificates } from "@/mocks/dummy-data";
import { calculateForecast } from "@/features/forecast/calc";
import { buildPreview, levelChanges, previewHeadline, type PreviewInput } from "./preview";

function inputOf(email: string): PreviewInput {
  const userId = demoUsers.find((u) => u.email === email)!.id;
  return {
    profile: profiles.find((p) => p.user_id === userId)!,
    plans: plans.filter((p) => p.user_id === userId),
    userCertificates: userCertificates.filter((uc) => uc.user_id === userId),
    certificates,
  };
}

const yebo = inputOf("yebo@hakgi.test");
const empty = inputOf("empty@hakgi.test");

describe("사전 검토 계산 (F-06)", () => {
  it("계획 추가는 previewForecast 와 같은 결과 (폭풍 1주 → 3주)", () => {
    const result = buildPreview(yebo, { kind: "plan", plan: previewPlan });
    expect(result.diff).toEqual(expectedPreviewDiff);
    expect(previewHeadline("대학생 서포터즈 1차 미션", result, "add")).toBe("대학생 서포터즈 1차 미션을 더하면 폭풍 주가 늘어요");
  });

  it("계획 수정은 그 계획을 바꿔서 비교하고, 같은 값이면 그대로", () => {
    const first = yebo.plans[0];
    const result = buildPreview(yebo, { kind: "plan", plan: first, replacePlanId: first.id });
    expect(result.after).toEqual(result.before);
    expect(previewHeadline(first.title, result, "edit")).toBe("바꿔도 날씨 단계는 그대로예요");
  });

  it("자격증 회차 추가는 준비 기간만큼 예보에 더해짐 (원본 입력은 그대로)", () => {
    const cert = certificates.find((c) => c.name === "정보처리기사" && c.round === "2026년 정기 3회 실기")!;
    const before = calculateForecast(empty);
    const result = buildPreview(empty, { kind: "certificate", certificate: cert, prep_weeks: 6, study_hours: 40 });
    expect(result.before).toEqual(before);
    expect(result.after.weeks.map((w) => w.total_hours)).not.toEqual(before.weeks.map((w) => w.total_hours));
    expect(empty.userCertificates).toHaveLength(0);
  });

  it("같은 자격증의 다른 회차로 바꾸면 예전 회차는 빠짐 (김예보: 3회 실기 → 2027년 1회, 폭풍 1주 → 0주)", () => {
    const current = certificates.find((c) => c.name === "정보처리기사" && c.round === "2026년 정기 3회 실기")!;
    const next = certificates.find((c) => c.name === "정보처리기사" && c.round === "2027년 정기 1회 필기 (예정)")!;
    const mine = yebo.userCertificates.find((uc) => uc.certificate_id === current.id)!;
    const result = buildPreview(yebo, {
      kind: "certificate",
      certificate: next,
      prep_weeks: mine.prep_weeks,
      study_hours: mine.study_hours,
      replaceCertificateId: current.id,
    });
    expect(result.diff.message).toBe("폭풍 1주 → 0주");
    expect(levelChanges(result)[0]).toEqual({ level: "storm", before: 1, after: 0 });
    expect(previewHeadline("정보처리기사 2027년 정기 1회 필기 (예정)", result, "switch")).toBe("이 회차로 바꾸면 폭풍 주가 줄어요");
  });
});
