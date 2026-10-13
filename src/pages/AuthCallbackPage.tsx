import { Link, Navigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { FullScreenSpinner } from "@/components/FullScreenSpinner";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { useAuth } from "@/features/auth/auth-context";
import { returnTo } from "@/features/auth/api";

/**
 * 이메일 인증 링크와 구글 로그인이 돌아오는 곳.
 * ?code= 교환은 supabase 클라이언트가 자동으로 하고,
 * 끝나면 AuthProvider의 status가 바뀝니다.
 */
export default function AuthCallbackPage() {
  const { status } = useAuth();
  const [params] = useSearchParams();
  const providerError = params.get("error_description");

  if (status === "loading") return <FullScreenSpinner label="로그인 처리 중" />;
  if (status === "authenticated") return <Navigate to={returnTo.take()} replace />;

  return (
    <AuthLayout title="로그인을 마치지 못했어요">
      <div className="grid gap-5">
        <FormAlert>
          {providerError
            ? `로그인 제공자가 요청을 거절했습니다. (${providerError})`
            : "링크가 만료되었거나 이미 사용되었습니다. 가입이나 로그인을 진행한 브라우저에서 링크를 열어 주세요."}
        </FormAlert>
        <Button asChild>
          <Link to="/login">로그인 화면으로</Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
