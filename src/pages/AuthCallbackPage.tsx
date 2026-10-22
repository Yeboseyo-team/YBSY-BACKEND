import { Link, Navigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { FullScreenSpinner } from "@/components/FullScreenSpinner";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { useAuth } from "@/features/auth/auth-context";
import { returnTo } from "@/features/auth/api";

/**
 * S-06 인증 처리 (경로 /auth/callback) — 담당: 프론트 A
 * Google 로그인 후 돌아오는 곳. ?code= 교환은 supabase 클라이언트가 자동으로 하고(PKCE),
 * 끝나면 AuthProvider 의 status 가 바뀝니다. 성공하면 원래 가려던 화면으로
 * (학기 설정·동의가 비어 있으면 OnboardingGuard 가 /onboarding 으로 보냄).
 */
export default function AuthCallbackPage() {
  const { status } = useAuth();
  const [params] = useSearchParams();
  const cancelled = params.get("error") === "access_denied";

  if (status === "loading") return <FullScreenSpinner label="로그인 처리 중" />;
  if (status === "authenticated") return <Navigate to={returnTo.take()} replace />;

  return (
    <AuthLayout title="로그인을 마치지 못했어요">
      <div className="grid gap-5">
        <FormAlert>
          {cancelled
            ? "Google 계정 선택을 취소했어요. 다시 로그인하려면 아래 버튼을 눌러 주세요."
            : "로그인 정보가 만료되었거나 다른 브라우저에서 열렸어요. 로그인 화면에서 Google 로그인을 다시 시도해 주세요."}
        </FormAlert>
        <Button asChild>
          <Link to="/login" replace>
            로그인 화면으로
          </Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
