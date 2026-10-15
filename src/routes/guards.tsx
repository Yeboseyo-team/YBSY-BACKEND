import { Navigate, Outlet, useLocation, type Location } from "react-router";
import { useAuth } from "@/features/auth/auth-context";
import { useProfile } from "@/features/auth/api";
import { isOnboardingDone } from "@/features/auth/onboarding";
import { FullScreenSpinner } from "@/components/FullScreenSpinner";
import { LoadError } from "@/components/LoadError";

/** 로그인한 사용자만 통과. 아니면 /login 으로 보내고 원래 경로를 기억합니다 (FR-01-7). */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <FullScreenSpinner />;
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

/**
 * 학기 설정(가용 시간·학기 시작일)과 개인정보 동의가 모두 있어야 통과 (FR-01-11, NFR-LEGAL-1).
 * 하나라도 비어 있으면 /onboarding 으로 보냅니다. ProtectedRoute 안에서 씁니다.
 */
export function OnboardingGuard() {
  const { user } = useAuth();
  const profile = useProfile(user?.id);

  if (profile.isPending) return <FullScreenSpinner />;
  if (profile.isError) {
    return (
      <main className="mx-auto grid min-h-dvh max-w-md content-center px-4">
        <LoadError what="학기 설정" onRetry={() => profile.refetch()} retrying={profile.isFetching} />
      </main>
    );
  }
  if (!isOnboardingDone(profile.data)) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

/**
 * 로그인 화면용. 이미 로그인했으면 원래 가려던 곳(없으면 홈)으로 보냅니다.
 * 로그인 성공 후 이동도 여기서 일어나므로 각 페이지에서 navigate 할 필요가 없습니다.
 */
export function PublicOnlyRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <FullScreenSpinner />;
  if (status === "authenticated") {
    const from = (location.state as { from?: Location } | null)?.from;
    const to = from ? `${from.pathname}${from.search}${from.hash}` : "/";
    return <Navigate to={to} replace />;
  }
  return <Outlet />;
}
