import { Navigate, Outlet, useLocation, type Location } from "react-router";
import { useAuth } from "@/features/auth/auth-context";
import { FullScreenSpinner } from "@/components/FullScreenSpinner";
import { useProfile } from "@/features/auth/api";

/** 로그인한 사용자만 통과. 아니면 /login 으로 보내고 원래 경로를 기억합니다. */
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
 * 로그인·회원가입 화면용. 이미 로그인했으면 원래 가려던 곳(없으면 홈)으로 보냅니다.
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

/**
 * 학기 설정(가용 시간·개강일)을 마치지 않았으면 /onboarding 으로 보냅니다 (FR-01-11).
 * ProtectedRoute 안쪽에 둡니다.
 */
export function OnboardingGuard() {
  const { user } = useAuth();
  const profile = useProfile(user?.id);

  if (profile.isPending) return <FullScreenSpinner />;
  // 프로필을 불러오지 못하면 화면 쪽 오류 처리에 맡기고 통과시킵니다.
  if (profile.isError) return <Outlet />;
  if (!profile.data?.available_hours || !profile.data.semester_start) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
}
