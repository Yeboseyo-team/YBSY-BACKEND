import { describe, expect, it } from "vitest";
import { calculateForecast, type ForecastInput } from "./calc";
import { describePreview, objectParticle } from "./preview-text";

const base: ForecastInput = {
  profile: { available_hours: 50, semester_start: "2026-08-31", midterm_week: 8, final_week: 15 },
  plans: [{ title: "전공", type: "class", start_week: 1, end_week: 16, hours_per_week: 30 }],
  userCertificates: [],
  certificates: [],
};

describe("objectParticle", () => {
  it("받침에 따라 을/를", () => {
    expect(objectParticle("운영체제")).toBe("를");
    expect(objectParticle("학회 활동")).toBe("을");
    expect(objectParticle("SQLD")).toBe("을(를)");
  });
});

describe("describePreview", () => {
  const before = calculateForecast(base);
  it("폭풍이 늘면 몇 주에서 몇 주로", () => {
    const after = calculateForecast({ ...base, plans: [...base.plans, { title: "운영체제", type: "class", start_week: 1, end_week: 16, hours_per_week: 6 }] });
    const text = describePreview(before, after, "운영체제", "add");
    expect(text.title).toBe("운영체제를 더하면 폭풍이 0주에서 2주로 늘어요");
    expect(text.detail).toContain("8, 15주차가 새로 폭풍이 돼요");
  });
  it("단계 변화가 없으면 그대로", () => {
    const after = calculateForecast({ ...base, plans: [...base.plans, { title: "독서", type: "activity", start_week: 1, end_week: 1, hours_per_week: 1 }] });
    expect(describePreview(before, after, "독서", "add").title).toBe("더해도 단계는 그대로예요");
  });
});
