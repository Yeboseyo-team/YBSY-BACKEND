import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";

/**
 * S-09 계획 목록 (경로 /plans) — 담당: 프론트 B (feature/frontend-jw)
 * 할 일 목록: docs/tasks/frontend-jw.md
 */
export default function PlansPage() {
  return (
    <PageContainer>
      <PageHeader
        title="내 계획"
        description="수업·활동·프로젝트를 담아두면 예보에 반영돼요."
        action={
          <Button asChild>
            <Link to="/plans/new">계획 추가</Link>
          </Button>
        }
      />
      <ScreenPlaceholder
        screen="S-09 계획 목록"
        owner="프론트 B (jw)"
        design="PcPlanList.html, PcDeleteConfirm.html"
        todo={[
          "F-02 유형별(수업·활동·프로젝트) 계획 목록",
          "F-02 수정 버튼 → /plans/:id/edit, 삭제 확인 후 삭제",
          "계획 30개가 넘으면 추가 버튼 막기 (화면에서)",
        ]}
      />
    </PageContainer>
  );
}
