import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";

/**
 * S-07 온보딩 (경로 /onboarding) — 담당: 프론트 A (feature/frontend-ge)
 * 할 일 목록: docs/tasks/frontend-ge.md
 */
export default function OnboardingPage() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-xl content-center gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">학기 설정</h1>
      <ScreenPlaceholder
        screen="S-07 온보딩"
        owner="프론트 A (ge)"
        design="PcOnboarding.html"
        todo={[
          "주당 가용 시간, 학기 시작일, 중간·기말 주차 입력",
          "개인정보 수집·이용 동의(필수) → profiles.privacy_agreed_at 기록",
          "저장하면 홈(/)으로 이동",
        ]}
      />
    </main>
  );
}
