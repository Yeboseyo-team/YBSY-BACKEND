// 계획 입력 검사 (F-02) — DB 제약(5.2)과 같은 규칙을 화면에서 먼저 확인합니다.
import { z } from "zod";
import { TOTAL_WEEKS } from "@/features/forecast/calc";

const week = z
  .number({ invalid_type_error: "주차를 고르세요." })
  .int()
  .min(1, "1주차 이후로 고르세요.")
  .max(TOTAL_WEEKS, `${TOTAL_WEEKS}주차 이내로 고르세요.`);

export const planSchema = z
  .object({
    title: z.string().trim().min(1, "이름을 입력하세요.").max(30, "이름은 30자까지 쓸 수 있어요."),
    type: z.enum(["class", "activity", "project"]),
    credits: z.number().int().min(1).max(4).nullable(),
    load_level: z.enum(["low", "normal", "high", "custom"]),
    start_week: week,
    end_week: week,
    hours_per_week: z
      .number({ invalid_type_error: "한 주에 쓰는 시간을 숫자로 입력하세요." })
      .min(0.5, "0.5시간 이상 입력하세요.")
      .max(60, "한 주에 60시간까지 넣을 수 있어요.")
      .refine((h) => Number.isInteger(h * 2), "0.5시간 단위로 입력하세요."),
  })
  .refine((d) => d.start_week <= d.end_week, { path: ["end_week"], message: "끝나는 주차는 시작 주차와 같거나 뒤로 고르세요." })
  .refine((d) => d.type !== "class" || d.credits !== null, { path: ["credits"], message: "학점을 고르세요." });

export type PlanFormValues = z.infer<typeof planSchema>;
