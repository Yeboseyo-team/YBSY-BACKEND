import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";

/**
 * S-10 자격증 선택 (경로 /certificates) — 담당: 프론트 A (feature/frontend-ge)
 * 할 일 목록: docs/tasks/frontend-ge.md
 * 사전 검토는 src/features/preview/PreviewSheet.tsx (프론트 B) 를 가져다 씁니다.
 */
export default function CertificatesPage() {
  return (
    <PageContainer>
      <PageHeader title="자격증" description="시험 회차를 고르면 준비 기간이 예보에 반영돼요." />
      <ScreenPlaceholder
        screen="S-10 자격증 선택"
        owner="프론트 A (ge)"
        design="PcCertificate.html, PcMyCertificates.html"
        todo={[
          "F-04 자격증 검색, 회차별 접수 기간·시험일, D-day",
          "F-04 준비 기간·주당 학습 시간, 출처 링크",
          "접수 마감된 회차는 선택 불가 (화면에서)",
          "F-06 선택 전 사전 검토 시트 열기",
        ]}
      />
    </PageContainer>
  );
}
