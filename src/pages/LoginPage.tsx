import { Link, useLocation, type Location } from "react-router";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { GoogleIcon } from "@/features/auth/components/GoogleIcon";
import { useGoogleSignIn } from "@/features/auth/api";
import { DEMO_LOGIN_ENABLED, demoAccounts, useDemoSignIn } from "@/features/auth/demo";
import { toAuthMessage } from "@/features/auth/errors";

/**
 * S-01 로그인 (경로 /login) — 담당: 프론트 A
 * 팀 결정(10/13): Google 로그인만. 데모 계정 버튼은 VITE_DEMO_LOGIN=true 인 로컬·프리뷰에서만 보입니다.
 * 로그인되면 PublicOnlyRoute 가 원래 가려던 화면으로 보내 줍니다.
 */
export default function LoginPage() {
  const location = useLocation();
  const fromLocation = (location.state as { from?: Location } | null)?.from;
  const from = fromLocation ? `${fromLocation.pathname}${fromLocation.search}` : undefined;

  const google = useGoogleSignIn();
  const demo = useDemoSignIn();
  const error = google.error ?? demo.error;

  return (
    <AuthLayout
      title="로그인"
      description="Google 계정으로 바로 시작할 수 있어요. 처음이면 학기 설정 화면으로 안내해 드려요."
      footer={
        <>
          로그인하면{" "}
          <Link to="/privacy" className="font-semibold text-primary hover:underline">
            개인정보처리방침
          </Link>
          을 확인한 것으로 봐요. 수집·이용 동의는 첫 학기 설정에서 받아요.
        </>
      }
    >
      <div className="grid gap-5">
        {error ? <FormAlert>{toAuthMessage(error)}</FormAlert> : null}

        <Button
          type="button"
          size="lg"
          variant="outline"
          className="w-full bg-card"
          disabled={google.isPending || demo.isPending}
          onClick={() => google.mutate(from)}
        >
          <GoogleIcon />
          {google.isPending ? "Google로 이동하는 중…" : "Google 계정으로 계속하기"}
        </Button>

        {DEMO_LOGIN_ENABLED ? (
          <section aria-labelledby="demo-title" className="mt-4 grid gap-3 rounded-xl border border-dashed border-border p-4">
            <div>
              <h2 id="demo-title" className="text-sm font-semibold">
                데모 계정으로 로그인
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">개발·시연 환경에서만 보여요.</p>
            </div>
            <ul className="grid gap-2">
              {demoAccounts.map((account) => (
                <li key={account.email}>
                  <button
                    type="button"
                    disabled={google.isPending || demo.isPending}
                    onClick={() => {
                      // 로그인되면 PublicOnlyRoute 가 state.from 으로 이동시킴
                      demo.mutate(account.email);
                    }}
                    className="grid w-full gap-0.5 rounded-md border border-input bg-card px-3 py-2 text-left outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:opacity-50"
                  >
                    <span className="text-sm font-medium">
                      {account.display_name}{" "}
                      <span className="font-normal text-muted-foreground">{account.email}</span>
                    </span>
                    <span className="text-[12px] text-muted-foreground">{account.persona}</span>
                  </button>
                </li>
              ))}
            </ul>
            {demo.isPending ? (
              <p role="status" className="text-[13px] text-muted-foreground">
                데모 계정으로 로그인하는 중…
              </p>
            ) : null}
          </section>
        ) : null}
      </div>
    </AuthLayout>
  );
}
