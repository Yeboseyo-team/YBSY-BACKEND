import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { FullScreenSpinner } from "@/components/FullScreenSpinner";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { Field } from "@/features/auth/components/Field";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { useAuth } from "@/features/auth/auth-context";
import { resetPasswordSchema, type ResetPasswordValues } from "@/features/auth/schemas";
import { useUpdatePassword } from "@/features/auth/api";
import { toAuthMessage } from "@/features/auth/errors";

/**
 * 재설정 메일의 링크(?code=...)로 들어오면 supabase-js가 임시 세션을 만들고
 * PASSWORD_RECOVERY 이벤트를 보냅니다. 세션이 있어야 새 비밀번호를 저장할 수 있습니다.
 */
export default function ResetPasswordPage() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const update = useUpdatePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", passwordConfirm: "" },
  });

  if (status === "loading") return <FullScreenSpinner />;

  if (status === "unauthenticated") {
    return (
      <AuthLayout title="링크를 사용할 수 없어요">
        <div className="grid gap-5">
          <FormAlert>
            재설정 링크가 만료되었거나 이미 사용되었습니다. 링크는 요청한 브라우저에서 열어야 합니다.
          </FormAlert>
          <Button asChild>
            <Link to="/forgot-password">재설정 링크 다시 받기</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="새 비밀번호 정하기">
      <form
        noValidate
        onSubmit={handleSubmit((v) =>
          update.mutate(v, { onSuccess: () => navigate("/", { replace: true }) }),
        )}
        className="grid gap-5"
      >
        {update.error ? <FormAlert>{toAuthMessage(update.error)}</FormAlert> : null}
        <Field
          id="password"
          label="새 비밀번호"
          type="password"
          autoComplete="new-password"
          hint="8자 이상, 영문과 숫자를 섞어 주세요."
          error={errors.password?.message}
          {...register("password")}
        />
        <Field
          id="passwordConfirm"
          label="새 비밀번호 확인"
          type="password"
          autoComplete="new-password"
          error={errors.passwordConfirm?.message}
          {...register("passwordConfirm")}
        />
        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? "저장하는 중…" : "비밀번호 저장"}
        </Button>
      </form>
    </AuthLayout>
  );
}
