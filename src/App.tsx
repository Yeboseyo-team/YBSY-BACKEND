import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { FullScreenSpinner } from "@/components/FullScreenSpinner";
import { ProtectedRoute, PublicOnlyRoute } from "@/routes/guards";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const SignUpPage = lazy(() => import("@/pages/SignUpPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const AuthCallbackPage = lazy(() => import("@/pages/AuthCallbackPage"));
const HomePage = lazy(() => import("@/pages/HomePage"));

export default function App() {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <Routes>
        {/* 로그인한 사용자만 */}
        <Route element={<ProtectedRoute />}>
          <Route index element={<HomePage />} />
        </Route>

        {/* 로그인하지 않은 사용자만 */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignUpPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* 메일·소셜 로그인 링크가 돌아오는 곳 (가드 없음) */}
        <Route path="auth/callback" element={<AuthCallbackPage />} />
        <Route path="auth/reset-password" element={<ResetPasswordPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
