import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, type Location } from "react-router";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { Field } from "@/features/auth/components/Field";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { OrDivider } from "@/features/auth/components/OrDivider";
import { signInSchema, type SignInValues } from "@/features/auth/schemas";
import { useGoogleSignIn, useSignIn } from "@/features/auth/api";
import { toAuthMessage } from "@/features/auth/errors";

export default function LoginPage() {
  const location = useLocation();
  const from = (location.state as { from?: Location } | null)?.from?.pathname;

  const signIn = useSignIn();
  const google = useGoogleSignIn();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const error = signIn.error ?? google.error;

  return (
    <AuthLayout
      title="로그인"
      footer={
        <>
          아직 계정이 없나요?{" "}
          <Link to="/signup" state={location.state} className="font-semibold text-primary hover:underline">
            회원가입
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit((v) => signIn.mutate(v))} className="grid gap-5">
        {error ? <FormAlert>{toAuthMessage(error)}</FormAlert> : null}

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
        <div className="grid gap-2">
          <Field
            id="password"
            label="비밀번호"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Link to="/forgot-password" className="justify-self-end text-[13px] text-muted-foreground hover:text-foreground hover:underline">
            비밀번호를 잊었나요?
          </Link>
        </div>

        <Button type="submit" disabled={signIn.isPending}>
          {signIn.isPending ? "로그인하는 중…" : "로그인"}
        </Button>
      </form>

      <OrDivider />

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={google.isPending}
        onClick={() => google.mutate(from)}
      >
        {google.isPending ? "구글로 이동하는 중…" : "Google 계정으로 계속하기"}
      </Button>
    </AuthLayout>
  );
}
