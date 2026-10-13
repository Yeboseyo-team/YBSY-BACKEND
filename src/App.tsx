import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { FullScreenSpinner } from "@/components/FullScreenSpinner";
import { AppShell } from "@/components/layout/AppShell";
import { OnboardingGuard, ProtectedRoute, PublicOnlyRoute } from "@/routes/guards";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const SignUpPage = lazy(() => import("@/pages/SignUpPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const AuthCallbackPage = lazy(() => import("@/pages/AuthCallbackPage"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const PlansPage = lazy(() => import("@/pages/PlansPage"));
const PlanNewPage = lazy(() => import("@/pages/PlanNewPage"));
const PlanEditPage = lazy(() => import("@/pages/PlanEditPage"));
const CertificateSearchPage = lazy(() => import("@/pages/CertificateSearchPage"));

export default function App() {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <Routes>
        {/* 로그인한 사용자만 */}
        <Route element={<ProtectedRoute />}>
          <Route path="onboarding" element={<OnboardingPage />} />
          {/* 학기 설정을 마친 사용자만 */}
          <Route element={<OnboardingGuard />}>
            <Route element={<AppShell />}>
              <Route index element={<HomePage />} />
              <Route path="plans" element={<PlansPage />} />
              <Route path="plans/new" element={<PlanNewPage />} />
              <Route path="plans/:id" element={<PlanEditPage />} />
              {/* /certificates 는 B의 "내 자격증" 화면이 생기면 그쪽으로 바꿉니다 */}
              <Route path="certificates" element={<CertificateSearchPage />} />
              <Route path="certificates/add" element={<CertificateSearchPage />} />
            </Route>
          </Route>
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
