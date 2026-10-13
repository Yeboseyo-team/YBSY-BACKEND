import { Link, Navigate, useSearchParams } from "react-router";
import { CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FullScreenSpinner } from "@/components/FullScreenSpinner";
import { AuthCard } from "@/features/auth/components/AuthCard";
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
    <AuthCard
      icon={<CloudOff />}
      title="로그인을 마치지 못했어요"
      description={
        providerError
          ? `로그인 제공자가 요청을 거절했어요. (${providerError})`
          : "링크가 만료되었거나 이미 사용되었어요. 가입이나 로그인을 진행한 브라우저에서 링크를 열어 주세요."
      }
      footer={
        <Link to="/signup" className="text-primary underline underline-offset-2">
          인증 메일 새로 받기
        </Link>
      }
    >
      <div className="grid gap-4">
        <p className="rounded-md bg-muted px-3.5 py-3 text-[13px] leading-relaxed text-muted-foreground">
          휴대폰으로 가입하고 PC에서 메일을 열면 이 화면이 나와요. 가입한 기기에서 다시 열거나, 인증 메일을 새로 받으세요.
        </p>
        <Button asChild>
          <Link to="/login">로그인 화면으로</Link>
        </Button>
      </div>
    </AuthCard>
  );
}
