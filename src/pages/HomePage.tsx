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

/** 불러오는 동안 화면 틀 (6.1) */
function HomeSkeleton() {
  return (
    <PageContainer>
      <div className="grid gap-3" aria-busy="true" aria-label="예보를 불러오는 중">
        <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
        <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-muted" />
        <div className="h-5 w-full max-w-sm animate-pulse rounded bg-muted" />
      </div>
      <div className="flex flex-wrap gap-6">
        <div className="h-[380px] min-w-0 flex-[999_1_600px] animate-pulse rounded-2xl bg-muted" />
        <div className="h-[260px] min-w-0 flex-[1_1_320px] animate-pulse rounded-2xl bg-muted" />
      </div>
    </PageContainer>
  );
}

/** 불러오기 실패 — 디자인: PcLoadError.html */
function HomeError({ onRetry }: { onRetry: () => void }) {
  return (
    <PageContainer>
      <section role="alert" className="flex flex-wrap items-center gap-4 rounded-2xl border border-storm/30 bg-storm/5 p-5 sm:p-6">
        <div className="grid min-w-0 flex-1 gap-1">
          <h1 className="text-xl font-bold">예보를 불러오지 못했어요</h1>
          <p className="text-sm text-muted-foreground">인터넷 연결을 확인한 뒤 다시 시도하세요. 입력한 계획은 그대로 저장돼 있어요.</p>
        </div>
        <Button type="button" onClick={onRetry}>
          <RotateCw aria-hidden="true" />
          다시 시도
        </Button>
      </section>
    </PageContainer>
  );
}
