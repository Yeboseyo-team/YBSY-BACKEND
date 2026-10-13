import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, type Location } from "react-router";
import { Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { Field } from "@/features/auth/components/Field";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { OrDivider } from "@/features/auth/components/OrDivider";
import { signUpSchema, type SignUpValues } from "@/features/auth/schemas";
import { useGoogleSignIn, useResendSignUpEmail, useSignUp } from "@/features/auth/api";
import { toAuthMessage } from "@/features/auth/errors";

export default function SignUpPage() {
  const location = useLocation();
  const from = (location.state as { from?: Location } | null)?.from?.pathname;

  const signUp = useSignUp();
  const google = useGoogleSignIn();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { displayName: "", email: "", password: "", passwordConfirm: "", agreePrivacy: false },
  });

  // 이메일 인증이 꺼져 있으면 세션이 바로 생기고, PublicOnlyRoute가 홈으로 보냅니다.
  if (signUp.data?.needsEmailConfirm) {
    return <CheckEmail email={signUp.data.email} />;
  }

  const error = signUp.error ?? google.error;

  return (
    <AuthLayout
      title="회원가입"
      description="가입하면 내 학기 계획과 자격증 일정을 저장할 수 있어요."
      footer={
        <>
          이미 계정이 있나요?{" "}
          <Link to="/login" state={location.state} className="font-semibold text-primary underline underline-offset-2">
            로그인
          </Link>
        </>
      }
    >
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={google.isPending}
        onClick={() => google.mutate(from)}
      >
        {google.isPending ? "구글로 이동하는 중…" : "Google 계정으로 가입하기"}
      </Button>

      <OrDivider label="또는 이메일로 가입" />

      <form noValidate onSubmit={handleSubmit((v) => signUp.mutate(v))} className="grid gap-4">
        {error ? <FormAlert>{toAuthMessage(error)}</FormAlert> : null}

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-3">
          <Field
            id="displayName"
            label="이름"
            autoComplete="name"
            error={errors.displayName?.message}
            {...register("displayName")}
          />
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
        </div>
        <Field
          id="password"
          label="비밀번호"
          type="password"
          autoComplete="new-password"
          hint="8자 이상, 영문과 숫자를 섞어 주세요."
          error={errors.password?.message}
          {...register("password")}
        />
        <Field
          id="passwordConfirm"
          label="비밀번호 확인"
          type="password"
          autoComplete="new-password"
          error={errors.passwordConfirm?.message}
          {...register("passwordConfirm")}
        />

        <div className="grid gap-2">
          <label className="flex items-start gap-2.5 text-sm leading-snug">
            <input
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 accent-primary"
              aria-invalid={errors.agreePrivacy ? true : undefined}
              aria-describedby={errors.agreePrivacy ? "agreePrivacy-message" : undefined}
              {...register("agreePrivacy")}
            />
            <span>
              서비스 이용을 위한 개인정보(이메일, 이름) 수집·이용에 동의합니다.
              <span className="text-muted-foreground"> (필수)</span>{" "}
              <Link to="/privacy" target="_blank" className="text-primary underline underline-offset-2">
                내용 보기
                <span className="sr-only"> (새 창)</span>
              </Link>
            </span>
          </label>
          {errors.agreePrivacy ? (
            <p id="agreePrivacy-message" className="text-[13px] text-destructive">
              {errors.agreePrivacy.message}
            </p>
          ) : null}
        </div>

        <Button type="submit" disabled={signUp.isPending}>
          {signUp.isPending ? "가입하는 중…" : "가입하기"}
        </Button>
      </form>
    </AuthLayout>
  );
}

function CheckEmail({ email }: { email: string }) {
  const resend = useResendSignUpEmail();

  return (
    <AuthCard
      icon={<Mail />}
      title="메일함을 확인하세요"
      description={
        <>
          <strong className="font-semibold text-foreground">{email}</strong> 로 인증 메일을 보냈어요. 메일의 링크를
          누르면 가입이 끝나고 바로 로그인돼요.
        </>
      }
      footer={
        <Link to="/login" className="text-primary underline underline-offset-2">
          로그인 화면으로 돌아가기
        </Link>
      }
    >
      <div className="grid gap-4">
        <ul className="grid list-disc gap-1 pl-5 text-[13px] leading-relaxed text-muted-foreground marker:text-border">
          <li>메일이 보이지 않으면 스팸함을 확인하세요.</li>
          <li>링크는 가입한 이 브라우저에서 열어야 해요.</li>
          <li>이미 가입한 이메일이라면 로그인하거나 비밀번호를 재설정하세요.</li>
        </ul>
        {resend.isSuccess ? (
          <FormAlert tone="info">
            <span className="inline-flex items-center gap-2">
              <Check className="size-4" aria-hidden="true" />
              인증 메일을 다시 보냈어요.
            </span>
          </FormAlert>
        ) : null}
        {resend.error ? <FormAlert>{toAuthMessage(resend.error)}</FormAlert> : null}
        <Button variant="outline" disabled={resend.isPending} onClick={() => resend.mutate(email)}>
          {resend.isPending ? "보내는 중…" : "인증 메일 다시 보내기"}
        </Button>
      </div>
    </AuthCard>
  );
}
