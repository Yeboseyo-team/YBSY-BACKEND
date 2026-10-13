import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { Field } from "@/features/auth/components/Field";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/features/auth/schemas";
import { useRequestPasswordReset } from "@/features/auth/api";
import { toAuthMessage } from "@/features/auth/errors";

export default function ForgotPasswordPage() {
  const request = useRequestPasswordReset();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  return (
    <AuthLayout
      title="비밀번호 재설정"
      description="가입한 이메일을 입력하면 새 비밀번호를 정할 수 있는 링크를 보내 드려요."
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          로그인 화면으로 돌아가기
        </Link>
      }
    >
      {request.isSuccess ? (
        <FormAlert tone="info">
          {getValues("email")} 로 가입된 계정이 있다면 재설정 링크가 도착합니다. 링크는 이 브라우저에서 열어 주세요.
        </FormAlert>
      ) : (
        <form noValidate onSubmit={handleSubmit((v) => request.mutate(v))} className="grid gap-5">
          {request.error ? <FormAlert>{toAuthMessage(request.error)}</FormAlert> : null}
          <Field
            id="email"
            label="이메일"
            type="email"
            autoComplete="email"
            inputMode="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Button type="submit" disabled={request.isPending}>
            {request.isPending ? "보내는 중…" : "재설정 링크 보내기"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
