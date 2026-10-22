import { describe, expect, it } from "vitest";
import { certificates, demoUsers, expectedPreviewDiff, plans, previewPlan, profiles, userCertificates } from "@/mocks/dummy-data";
import { calculateForecast, semesterWeekOf, type ForecastInput } from "@/features/forecast/calc";
import { peakHours, runPreview } from "./preview";

function inputOf(email: string): ForecastInput {
  const userId = demoUsers.find((u) => u.email === email)!.id;
  return {
    profile: profiles.find((p) => p.user_id === userId)!,
    plans: plans.filter((p) => p.user_id === userId),
    userCertificates: userCertificates.filter((uc) => uc.user_id === userId),
    certificates,
  };
}

describe("runPreview (F-06)", () => {
  const yebo = inputOf("yebo@hakgi.test");

  it("계획을 더하면 명세서 예시 문구가 나온다 (FR-06-3)", () => {
    expect(runPreview(yebo, { kind: "plan", plan: previewPlan }).diff).toEqual(expectedPreviewDiff);
  });

  it("수정할 계획을 같은 값으로 바꾸면 예보가 그대로다", () => {
    const target = yebo.plans[0] as (typeof plans)[number];
    const { before, after, diff } = runPreview(yebo, { kind: "plan", plan: target, replacePlanId: target.id });
    // 주차별 내역 순서는 바뀔 수 있어서 시간·단계·요약만 비교
    const shape = (f: typeof before) => f.weeks.map((w) => [w.total_hours, w.level]);
    expect(shape(after)).toEqual(shape(before));
    expect(after.summary).toEqual(before.summary);
    expect(diff.new_storm_weeks).toEqual([]);
  });

  it("이미 고른 자격증 회차를 같은 값으로 미리 보면 예보가 그대로다", () => {
    const mine = yebo.userCertificates[0];
    const cert = certificates.find((c) => c.id === mine.certificate_id)!;
    const { before, after, diff } = runPreview(yebo, {
      kind: "certificate",
      certificate: cert,
      study_hours: mine.study_hours,
      prep_weeks: mine.prep_weeks,
    });
    expect(after).toEqual(before);
    expect(diff.new_storm_weeks).toEqual([]);
  });

  it("새 자격증을 더하면 시간이 늘어난다", () => {
    const mineIds = new Set(yebo.userCertificates.map((uc) => uc.certificate_id));
    const other = certificates.find((c) => !mineIds.has(c.id) && semesterWeekOf(c.exam_date, yebo.profile.semester_start!) !== null)!;
    const { before, after } = runPreview(yebo, { kind: "certificate", certificate: other, study_hours: 10, prep_weeks: 4 });
    expect(peakHours(after)).toBeGreaterThanOrEqual(peakHours(before));
    expect(after.weeks.reduce((s, w) => s + w.total_hours, 0)).toBeGreaterThan(before.weeks.reduce((s, w) => s + w.total_hours, 0));
    expect(before).toEqual(calculateForecast(yebo));
  });
});
