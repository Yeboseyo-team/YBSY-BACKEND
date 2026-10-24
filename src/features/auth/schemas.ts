import { z } from "zod";
import { TOTAL_WEEKS } from "@/features/forecast/calc";

const examWeek = z
  .number({ invalid_type_error: "시험 주차를 고르세요." })
  .int()
  .min(1, "1주차 이후로 고르세요.")
  .max(TOTAL_WEEKS, `${TOTAL_WEEKS}주차 이내로 고르세요.`);

/** 학기 설정 (온보딩 FR-01-11, 설정 FR-01-12) */
export const semesterSchema = z
  .object({
    semesterStart: z
      .string()
      .min(1, "개강일을 고르세요.")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "개강일을 달력에서 다시 고르세요."),
    /** 요일별 가용 시간 [월~일] (10/24 QA). 합계가 한 주 가용 시간이 돼요 */
    dailyHours: z
      .array(
        z
          .number({ invalid_type_error: "시간을 숫자로 입력하세요." })
          .int("시간은 1시간 단위로 입력하세요.")
          .min(0, "0시간 이상으로 입력하세요.")
          .max(24, "하루는 24시간이에요."),
      )
      .length(7)
      .refine((days) => days.reduce((a, b) => a + b, 0) >= 1, "한 주에 쓸 수 있는 시간이 1시간 이상이어야 해요."),
    midtermWeek: examWeek,
    finalWeek: examWeek,
  })
  .refine((d) => d.midtermWeek < d.finalWeek, {
    path: ["finalWeek"],
    message: "기말고사는 중간고사보다 뒤 주차로 고르세요.",
  });

/** 온보딩 = 학기 설정 + 개인정보 수집·이용 동의 (NFR-LEGAL-1) */
export const onboardingSchema = semesterSchema.and(
  z.object({
    agreePrivacy: z.boolean().refine((v) => v, "개인정보 수집·이용에 동의해야 시작할 수 있어요."),
  }),
);

/** 이름 (profiles.display_name 40자 이하) */
export const displayNameSchema = z.object({
  displayName: z.string().trim().min(1, "이름을 입력하세요.").max(40, "이름은 40자까지 쓸 수 있어요."),
});

export type SemesterValues = z.infer<typeof semesterSchema>;
export type OnboardingValues = z.infer<typeof onboardingSchema>;
export type DisplayNameValues = z.infer<typeof displayNameSchema>;
