import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { Check, Circle, LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FullScreenSpinner } from "@/components/FullScreenSpinner";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { Field } from "@/features/auth/components/Field";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { useAuth } from "@/features/auth/auth-context";
import { PASSWORD_RULES, resetPasswordSchema, type ResetPasswordValues } from "@/features/auth/schemas";
import { useUpdatePassword } from "@/features/auth/api";
import { toAuthMessage } from "@/features/auth/errors";
import { cn } from "@/lib/utils";

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
    watch,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", passwordConfirm: "" },
  });
  const password = watch("password");

  if (status === "loading") return <FullScreenSpinner />;

  if (status === "unauthenticated") {
    return (
      <AuthCard
        icon={<LinkIcon />}
        title="링크를 사용할 수 없어요"
        description="재설정 링크가 만료되었거나 이미 사용되었어요. 링크는 재설정을 요청한 브라우저에서 열어야 해요."
      >
        <Button asChild className="w-full">
          <Link to="/forgot-password">재설정 링크 다시 받기</Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="새 비밀번호 정하기" description="저장하면 바로 로그인된 상태로 예보 화면이 열려요.">
      <form
        noValidate
        onSubmit={handleSubmit((v) => update.mutate(v, { onSuccess: () => navigate("/", { replace: true }) }))}
        className="grid gap-4"
      >
        {update.error ? <FormAlert>{toAuthMessage(update.error)}</FormAlert> : null}
        <div className="grid gap-2">
          <Field
            id="password"
            label="새 비밀번호"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            aria-describedby="password-rules"
            {...register("password")}
          />
          <ul id="password-rules" className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(password);
              return (
                <li key={rule.label} className={cn("inline-flex items-center gap-1", ok ? "text-foreground" : "text-muted-foreground")}>
                  {ok ? <Check className="size-3.5" aria-hidden="true" /> : <Circle className="size-3.5" aria-hidden="true" />}
                  {rule.label}
                  <span className="sr-only">{ok ? " 충족" : " 미충족"}</span>
                </li>
              );
            })}
          </ul>
        </div>
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
    </AuthCard>
  );
}
