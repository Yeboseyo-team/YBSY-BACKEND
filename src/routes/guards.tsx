import { Navigate, Outlet, useLocation, type Location } from "react-router";
import { useAuth } from "@/features/auth/auth-context";
import { FullScreenSpinner } from "@/components/FullScreenSpinner";

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
