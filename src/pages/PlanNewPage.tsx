import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";

/**
 * S-09 계획 등록 (경로 /plans/new) — 담당: 프론트 B (feature/frontend-jw)
 * 할 일 목록: docs/tasks/frontend-jw.md
 */
export default function PlanNewPage() {
  return (
    <PageContainer>
      <PageHeader title="계획 추가" back={{ to: "/plans", label: "계획 목록" }} />
      <ScreenPlaceholder
        screen="S-09 계획 등록"
        owner="프론트 B (jw)"
        design="PcPlan.html"
        todo={[
          "F-02 계획명, 유형, 시작·종료 주차, 주당 시간 입력 폼 (React Hook Form + Zod)",
          "F-03 적음·보통·많음 선택 시 기본 시간 자동 입력 (3학점 수업 보통 = 6시간)",
          "F-06 저장 전 '사전 검토' 버튼 → 사전 검토 시트 열기",
        ]}
      />
    </PageContainer>
  );
}
