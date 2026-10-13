import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";

/**
 * S-08 부담 예보 (홈, 경로 /) — 담당: 프론트 B (feature/frontend-jw)
 * 할 일 목록: docs/tasks/frontend-jw.md
 * 계산은 src/features/forecast/calc.ts 의 함수를 그대로 쓰고, 여기서 다시 계산하지 마세요.
 */
export default function HomePage() {
  return (
    <PageContainer>
      <PageHeader title="이번 학기 부담 예보" description="16주 동안 언제 바쁜지 미리 확인해요." />
      <ScreenPlaceholder
        screen="S-08 부담 예보"
        owner="프론트 B (jw)"
        design="index.html, PcEmptyMain.html, PcLoadError.html"
        todo={[
          "F-05 요약 문구 (폭풍 n주 · 흐림 n주)",
          "F-05 16주 막대그래프 (Recharts, 맑음·흐림·폭풍 색, 가용 시간 점선)",
          "F-05 막대를 누르면 그 주의 상세 내역",
          "계획이 없을 때 빈 화면, 불러오기 실패 화면",
        ]}
      />
    </PageContainer>
  );
}
