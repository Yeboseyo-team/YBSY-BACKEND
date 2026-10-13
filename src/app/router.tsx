import { createBrowserRouter } from 'react-router'

import NotFoundPage from '@/app/pages/NotFoundPage'
import PrivacyPage from '@/app/pages/PrivacyPage'
import AuthCallbackPage from '@/features/auth/AuthCallbackPage'
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage'
import LoginPage from '@/features/auth/LoginPage'
import ResetPasswordPage from '@/features/auth/ResetPasswordPage'
import SignupPage from '@/features/auth/SignupPage'
import CertificatesPage from '@/features/certificates/CertificatesPage'
import ForecastPage from '@/features/forecast/ForecastPage'
import OnboardingPage from '@/features/onboarding/OnboardingPage'
import PlansPage from '@/features/plans/PlansPage'
import SettingsPage from '@/features/settings/SettingsPage'

// 화면 ID는 요구사항 명세서 6장 기준
export const router = createBrowserRouter([
  // 비로그인
  { path: '/login', element: <LoginPage /> }, // S-01
  { path: '/signup', element: <SignupPage /> }, // S-02, S-03
  { path: '/forgot-password', element: <ForgotPasswordPage /> }, // S-04
  { path: '/auth/reset-password', element: <ResetPasswordPage /> }, // S-05
  { path: '/auth/callback', element: <AuthCallbackPage /> }, // S-06
  { path: '/privacy', element: <PrivacyPage /> },

  // 로그인, 학기 설정 미완료
  { path: '/onboarding', element: <OnboardingPage /> }, // S-07

  // 로그인, 학기 설정 완료
  { path: '/', element: <ForecastPage /> }, // S-08
  { path: '/plans', element: <PlansPage /> }, // S-09 (S-11 시트 포함)
  { path: '/certificates', element: <CertificatesPage /> }, // S-10 (S-11 시트 포함)
  { path: '/settings', element: <SettingsPage /> }, // S-12

  { path: '*', element: <NotFoundPage /> },
])
