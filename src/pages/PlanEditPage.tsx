import { useParams } from "react-router";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";

/**
 * S-09 계획 수정 (경로 /plans/:id/edit) — 담당: 프론트 B (feature/frontend-jw)
 * 할 일 목록: docs/tasks/frontend-jw.md
 */
export default function PlanEditPage() {
  const { id } = useParams();
  return (
    <PageContainer>
      <PageHeader title="계획 수정" back={{ to: "/plans", label: "계획 목록" }} />
      <ScreenPlaceholder
        screen="S-09 계획 수정"
        owner="프론트 B (jw)"
        design="PcPlanEdit.html"
        todo={[`계획 id ${id} 를 불러와 등록 폼을 그대로 재사용`, "저장·삭제 후 목록과 예보에 바로 반영"]}
      />
    </PageContainer>
  );
}
