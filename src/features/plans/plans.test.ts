import { describe, expect, it } from "vitest";
import { toPlanRecord } from "./mappers";
import { defaultHours } from "./defaults";
import { planSchema } from "./schemas";
import type { Plan } from "@/types/database";

const valid = {
  title: "운영체제",
  type: "class" as const,
  credits: 3,
  load_level: "normal" as const,
  start_week: 1,
  end_week: 16,
  hours_per_week: 6,
};

const messageOf = (input: unknown, path: string) =>
  planSchema.safeParse(input).error?.issues.find((i) => i.path.join(".") === path)?.message;

describe("defaultHours (F-03)", () => {
  it("수업은 학점당 1.5/2/3시간", () => {
    expect(defaultHours("class", "low", 3)).toBe(4.5);
    expect(defaultHours("class", "normal", 3)).toBe(6);
    expect(defaultHours("class", "high", 2)).toBe(6);
  });
  it("활동 2/4/8, 프로젝트 3/6/10", () => {
    expect(defaultHours("activity", "normal", null)).toBe(4);
    expect(defaultHours("project", "high", null)).toBe(10);
  });
  it("직접 입력이면 null", () => {
    expect(defaultHours("activity", "custom", null)).toBeNull();
  });
});

describe("planSchema", () => {
  it("올바른 값은 통과", () => {
    expect(planSchema.safeParse(valid).success).toBe(true);
  });
  it("계획명 1~30자", () => {
    expect(messageOf({ ...valid, title: "  " }, "title")).toBe("계획 이름을 입력하세요.");
    expect(messageOf({ ...valid, title: "가".repeat(31) }, "title")).toMatch("30자");
  });
  it("시작 주차가 끝 주차보다 뒤면 끝 주차에 오류", () => {
    expect(messageOf({ ...valid, start_week: 10, end_week: 3 }, "end_week")).toMatch("끝 주차");
  });
  it("주차는 1~16", () => {
    expect(messageOf({ ...valid, end_week: 17 }, "end_week")).toMatch("1~16");
  });
  it("시간은 0.5~60, 0.5 단위", () => {
    expect(planSchema.safeParse({ ...valid, hours_per_week: 0.5 }).success).toBe(true);
    expect(messageOf({ ...valid, hours_per_week: 0 }, "hours_per_week")).toMatch("0.5시간 이상");
    expect(messageOf({ ...valid, hours_per_week: 60.5 }, "hours_per_week")).toMatch("60시간 이하");
    expect(messageOf({ ...valid, hours_per_week: 4.3 }, "hours_per_week")).toMatch("0.5시간 단위");
  });
  it("수업은 학점이 필요하고, 수업이 아니면 학점을 지웁니다", () => {
    expect(messageOf({ ...valid, credits: null }, "credits")).toBe("학점을 고르세요.");
    const parsed = planSchema.parse({ ...valid, type: "activity", credits: 3 });
    expect(parsed.credits).toBeNull();
  });
});

describe("toPlanRecord", () => {
  it("numeric 문자열도 숫자로 바꿉니다", () => {
    const row = { ...valid, id: "p1", user_id: "u1", created_at: "", updated_at: "", hours_per_week: "4.5" } as unknown as Plan;
    expect(toPlanRecord(row)).toEqual({ ...valid, id: "p1", hours_per_week: 4.5 });
  });
});
