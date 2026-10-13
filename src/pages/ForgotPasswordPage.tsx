import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/features/auth/components/AuthCard";
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
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  return (
    <AuthCard
      back={{ to: "/login", label: "로그인으로" }}
      title="비밀번호 재설정"
      description="가입한 이메일을 입력하면 새 비밀번호를 정할 수 있는 링크를 보내 드려요."
    >
      <form noValidate onSubmit={handleSubmit((v) => request.mutate(v))} className="grid gap-4">
        {request.error ? <FormAlert>{toAuthMessage(request.error)}</FormAlert> : null}
        <Field
          id="email"
          label="이메일"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@university.ac.kr"
          error={errors.email?.message}
          {...register("email")}
        />
        <Button type="submit" disabled={request.isPending}>
          {request.isPending ? "보내는 중…" : request.isSuccess ? "재설정 링크 다시 보내기" : "재설정 링크 보내기"}
        </Button>
        {/* 가입 여부를 드러내지 않도록 성공 문구는 항상 같습니다 */}
        {request.isSuccess ? (
          <FormAlert tone="info">
            <span className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              가입된 계정이 있으면 재설정 링크가 도착해요. 링크는 이 브라우저에서 열어 주세요.
            </span>
          </FormAlert>
        ) : null}
      </form>
    </AuthCard>
  );
}
