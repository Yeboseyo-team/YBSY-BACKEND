import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { toPlanMessage, useCreatePlan, usePlans, type PlanInput } from "@/features/plans/api";
import { PlanForm } from "@/features/plans/components/PlanForm";
import { canAddPlan, MAX_PLANS } from "@/features/plans/defaults";
import { PreviewSheet } from "@/features/preview/PreviewSheet";
import type { PreviewDraft } from "@/features/preview/preview";

/**
 * S-09 계획 등록 (경로 /plans/new) — 담당: 프론트 B (feature/frontend-jw)
 * 폼은 PlanForm (수정 화면과 같이 씀). [사전 검토]를 누르면 PreviewSheet 로 추가했을 때의 예보를 보여 줘요 (F-06).
 */
export default function PlanNewPage() {
  const navigate = useNavigate();
  const plans = usePlans();
  const createPlan = useCreatePlan();
  // 30개 상한은 화면에서 먼저 막아요 (FR-02-5)
  const full = plans.data ? !canAddPlan(plans.data.length) : false;
  // 사전 검토 중인 입력값. null 이면 시트 닫힘. 취소하면 아무것도 저장하지 않아요.
  const [previewing, setPreviewing] = useState<PlanInput | null>(null);
  const draft = useMemo<PreviewDraft | null>(() => (previewing ? { kind: "plan", plan: previewing } : null), [previewing]);

  const save = (values: PlanInput) =>
    createPlan.mutate(values, {
      onSuccess: () => navigate("/plans"),
      onError: () => setPreviewing(null),
    });

  return (
    <PageContainer>
      <PageHeader
        title="계획 추가"
        description="수업·활동·프로젝트를 넣으면 예보 그래프에 바로 반영돼요."
        back={{ to: "/plans", label: "계획 목록으로" }}
      />

      {full ? (
        <section role="alert" className="grid max-w-[520px] gap-3 rounded-2xl border border-caution/40 bg-caution/10 p-5">
          <h2 className="font-semibold">계획은 {MAX_PLANS}개까지 넣을 수 있어요</h2>
          <p className="text-sm text-muted-foreground">끝난 계획을 지운 뒤 다시 추가하세요.</p>
          <Button asChild variant="outline" className="justify-self-start">
            <Link to="/plans">계획 목록으로</Link>
          </Button>
        </section>
      ) : null}

      <div className="max-w-[520px] rounded-2xl border border-border bg-card p-5 sm:p-6">
        <PlanForm
          submitLabel="추가하기"
          pendingLabel="추가하는 중…"
          isPending={createPlan.isPending}
          errorMessage={createPlan.error ? toPlanMessage(createPlan.error) : null}
          disabled={full}
          onSubmit={save}
          onPreview={setPreviewing}
        />
      </div>

      <PreviewSheet
        open={previewing !== null}
        title={previewing?.title ?? ""}
        draft={draft}
        pending={createPlan.isPending}
        onCancel={() => setPreviewing(null)}
        onConfirm={() => previewing && save(previewing)}
      />
    </PageContainer>
  );
}
