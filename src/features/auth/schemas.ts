import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "이메일을 입력하세요.")
  .email("이메일 형식이 올바르지 않습니다.");

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

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
