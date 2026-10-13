import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "이메일을 입력하세요.")
  .email("이메일 형식이 올바르지 않습니다.");

/** 새 비밀번호 조건. 재설정 화면의 체크리스트와 아래 스키마가 같이 씁니다. */
export const PASSWORD_RULES = [
  { label: "8자 이상", test: (v: string) => v.length >= 8 },
  { label: "영문 포함", test: (v: string) => /[A-Za-z]/.test(v) },
  { label: "숫자 포함", test: (v: string) => /\d/.test(v) },
] as const;

// Supabase(bcrypt)는 72바이트까지만 비교하므로 상한을 둡니다.
const newPassword = z
  .string()
  .min(8, "8자 이상 입력하세요.")
  .max(72, "72자 이하로 입력하세요.")
  .regex(/[A-Za-z]/, "영문을 한 글자 이상 넣으세요.")
  .regex(/\d/, "숫자를 한 글자 이상 넣으세요.");

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "비밀번호를 입력하세요."),
});

export const signUpSchema = z
  .object({
    displayName: z.string().trim().min(1, "이름을 입력하세요.").max(20, "20자 이하로 입력하세요."),
    email,
    password: newPassword,
    passwordConfirm: z.string().min(1, "비밀번호를 한 번 더 입력하세요."),
    agreePrivacy: z.boolean().refine((v) => v, "개인정보 수집·이용에 동의해야 가입할 수 있습니다."),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않습니다.",
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    password: newPassword,
    passwordConfirm: z.string().min(1, "비밀번호를 한 번 더 입력하세요."),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않습니다.",
  });

const examWeek = z
  .number({ invalid_type_error: "주차를 고르세요." })
  .int()
  .min(1, "1~16주차 중에서 고르세요.")
  .max(16, "1~16주차 중에서 고르세요.");

/** 온보딩·설정의 학기 설정 (FR-01-11, FR-01-12) */
export const semesterSchema = z
  .object({
    semesterStart: z
      .string()
      .min(1, "개강일을 고르세요.")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "개강일을 달력에서 다시 고르세요."),
    availableHours: z
      .number({ invalid_type_error: "한 주에 쓸 수 있는 시간을 숫자로 입력하세요." })
      .int("시간은 1시간 단위로 입력하세요.")
      .min(1, "한 주에 쓸 수 있는 시간은 1시간 이상이어야 해요.")
      .max(168, "한 주는 168시간이에요. 168 이하로 입력하세요."),
    midtermWeek: examWeek,
    finalWeek: examWeek,
  })
  .refine((d) => d.midtermWeek < d.finalWeek, {
    path: ["finalWeek"],
    message: "기말고사는 중간고사보다 뒤 주차로 고르세요.",
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type SemesterValues = z.infer<typeof semesterSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
