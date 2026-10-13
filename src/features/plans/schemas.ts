import { z } from "zod";
import { SEMESTER_WEEKS } from "@/features/auth/semester";

/** 계획 최대 개수 (FR-02-5). DB가 아니라 화면에서 막습니다. */
export const MAX_PLANS = 30;

const week = (label: string) =>
  z
    .number({ invalid_type_error: `${label} 주차를 고르세요.` })
    .int()
    .min(1, `${label} 주차는 1~${SEMESTER_WEEKS}주차 중에서 고르세요.`)
    .max(SEMESTER_WEEKS, `${label} 주차는 1~${SEMESTER_WEEKS}주차 중에서 고르세요.`);

/** 계획 추가·수정 폼 (FR-02-1, F-03). 필드 이름은 DB·PlanInput과 같습니다. */
export const planSchema = z
  .object({
    title: z.string().trim().min(1, "계획 이름을 입력하세요.").max(30, "계획 이름은 30자 이하로 줄여 주세요."),
    type: z.enum(["class", "activity", "project"], { message: "유형을 고르세요." }),
    credits: z.number().int().min(1).max(4).nullable(),
    load_level: z.enum(["low", "normal", "high", "custom"]),
    start_week: week("시작"),
    end_week: week("끝"),
    hours_per_week: z
      .number({ invalid_type_error: "한 주 시간을 숫자로 입력하세요." })
      .min(0.5, "한 주 시간은 0.5시간 이상으로 입력하세요.")
      .max(60, "한 주 시간은 60시간 이하로 입력하세요.")
      .refine((n) => Number.isInteger(n * 2), "한 주 시간은 0.5시간 단위로 입력하세요. 예: 4.5"),
  })
  .superRefine((d, ctx) => {
    if (d.start_week > d.end_week) {
      ctx.addIssue({ code: "custom", path: ["end_week"], message: "끝 주차는 시작 주차와 같거나 뒤여야 해요." });
    }
    if (d.type === "class" && d.credits === null) {
      ctx.addIssue({ code: "custom", path: ["credits"], message: "학점을 고르세요." });
    }
  })
  // 수업이 아니면 학점은 의미가 없으므로 null로 저장합니다
  .transform((d) => ({ ...d, credits: d.type === "class" ? d.credits : null }));

export type PlanFormValues = z.input<typeof planSchema>;
