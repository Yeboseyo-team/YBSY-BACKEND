import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import { FullScreenSpinner } from "@/components/FullScreenSpinner";
import { AppShell } from "@/components/layout/AppShell";
import { OnboardingGuard, ProtectedRoute, PublicOnlyRoute } from "@/routes/guards";

// 화면 목록은 docs/REQUIREMENTS.md 6장. 담당자는 각 파일 맨 위 주석에 적혀 있어요.
// ── 프론트 A (feature/frontend-ge) ──
const LoginPage = lazy(() => import("@/pages/LoginPage")); // S-01
const AuthCallbackPage = lazy(() => import("@/pages/AuthCallbackPage")); // S-06
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage")); // S-07
const CertificatesPage = lazy(() => import("@/pages/CertificatesPage")); // S-10
const SettingsPage = lazy(() => import("@/pages/SettingsPage")); // S-12
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
// 이메일 가입·비밀번호 찾기(S-02~S-05)는 팀 결정(10/13)으로 만들지 않음 — 로그인은 Google만 (docs/AUTH.md)

// ── 프론트 B (feature/frontend-jw) ──
const HomePage = lazy(() => import("@/pages/HomePage")); // S-08
const PlansPage = lazy(() => import("@/pages/PlansPage")); // S-09 목록
const PlanNewPage = lazy(() => import("@/pages/PlanNewPage")); // S-09 등록
const PlanEditPage = lazy(() => import("@/pages/PlanEditPage")); // S-09 수정

// ── 10/24 QA ──
const ReviewPage = lazy(() => import("@/pages/ReviewPage")); // 학기 회고·내보내기

export default function App() {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <Routes>
        {/* 로그인한 사용자만 */}
        <Route element={<ProtectedRoute />}>
          {/* 학기 설정·동의 전. 이미 마쳤으면 페이지가 홈으로 보냄 */}
          <Route path="onboarding" element={<OnboardingPage />} />

          {/* 학기 설정·동의가 비어 있으면 /onboarding 으로 */}
          <Route element={<OnboardingGuard />}>
            {/* 메뉴가 있는 화면들 */}
            <Route element={<AppShell />}>
              <Route index element={<HomePage />} />
              <Route path="plans" element={<PlansPage />} />
              <Route path="plans/new" element={<PlanNewPage />} />
              <Route path="plans/:id/edit" element={<PlanEditPage />} />
              <Route path="certificates" element={<CertificatesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="review" element={<ReviewPage />} />
            </Route>
          </Route>
        </Route>

        {/* 로그인하지 않은 사용자만 */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="login" element={<LoginPage />} />
        </Route>

        {/* 누구나 */}
        <Route path="auth/callback" element={<AuthCallbackPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
