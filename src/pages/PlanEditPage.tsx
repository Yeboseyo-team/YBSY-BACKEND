import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Trash2 } from "lucide-react";
import { LoadError } from "@/components/LoadError";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toPlanMessage, useDeletePlan, usePlan, useUpdatePlan, type PlanInput } from "@/features/plans/api";
import { DeletePlanDialog } from "@/features/plans/components/DeletePlanDialog";
import { PlanForm } from "@/features/plans/components/PlanForm";
import { PreviewSheet } from "@/features/preview/PreviewSheet";
import type { PreviewDraft } from "@/features/preview/preview";
import type { Plan, PlanLoadLevel, PlanPriority, PlanType } from "@/types/database";

/**
 * S-09 계획 수정 (경로 /plans/:id/edit) — 담당: 프론트 B (feature/frontend-jw)
 * 등록 화면과 같은 PlanForm 을 저장된 값으로 채워 씁니다. [사전 검토]는 "이 계획을 바꾸면" 예보를 보여 줘요 (F-06).
 * 디자인: docs/design-pc/PcPlanEdit.html
 */
export default function PlanEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const plan = usePlan(id);
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();
  // 사전 검토 중인 입력값. null 이면 시트 닫힘. 취소하면 아무것도 저장하지 않아요.
  const [previewing, setPreviewing] = useState<PlanInput | null>(null);
  const [deleting, setDeleting] = useState<Plan | null>(null);
  const draft = useMemo<PreviewDraft | null>(
    () => (previewing && id ? { kind: "plan", plan: previewing, replacePlanId: id } : null),
    [previewing, id],
  );

  const header = (
    <PageHeader
      title="계획 수정"
      description="바꾼 내용은 저장해야 예보에 반영돼요. 저장하기 전에 [사전 검토]로 미리 볼 수 있어요."
      back={{ to: "/plans", label: "계획 목록으로" }}
    />
  );

  if (plan.isPending) {
    return (
      <PageContainer>
        {header}
        <Skeleton className="h-[480px] max-w-[520px] rounded-2xl" aria-label="계획을 불러오는 중" />
      </PageContainer>
    );
  }
  if (plan.isError) {
    return (
      <PageContainer>
        {header}
        <LoadError what="계획 데이터" retrying={plan.isFetching} onRetry={() => void plan.refetch()} />
      </PageContainer>
    );
  }
  if (!plan.data || !id) {
    return (
      <PageContainer>
        {header}
        <section className="grid max-w-[520px] justify-items-start gap-3 rounded-2xl border border-dashed border-border bg-card p-6">
          <h2 className="font-semibold">계획을 찾을 수 없어요</h2>
          <p className="text-sm text-muted-foreground">이미 삭제했거나 주소가 잘못됐어요. 계획 목록에서 다시 골라 주세요.</p>
          <Button asChild variant="outline">
            <Link to="/plans">계획 목록으로</Link>
          </Button>
        </section>
      </PageContainer>
    );
  }

  const current = plan.data;
  const save = (values: PlanInput) =>
    updatePlan.mutate(
      { id, input: values },
      {
        onSuccess: () => navigate("/plans"),
        onError: () => setPreviewing(null),
      },
    );

  return (
    <PageContainer>
      {header}

      {/* PC 에서는 사전 검토가 폼 옆 칸에 펼쳐져요 (10/24 QA) */}
      <div className="grid items-start gap-6 lg:grid-cols-[520px_minmax(0,1fr)]">
      <div className="max-w-[520px] rounded-2xl border border-border bg-card p-5 sm:p-6">
        <PlanForm
          defaultValues={{
            title: current.title,
            type: current.type as PlanType,
            credits: current.credits,
            load_level: current.load_level as PlanLoadLevel,
            start_week: current.start_week,
            end_week: current.end_week,
            hours_per_week: current.hours_per_week,
            start_date: current.start_date,
            end_date: current.end_date,
            priority: current.priority as PlanPriority,
            category_id: current.category_id,
          }}
          submitLabel="저장"
          pendingLabel="저장하는 중…"
          isPending={updatePlan.isPending}
          errorMessage={
            updatePlan.error ? toPlanMessage(updatePlan.error) : deletePlan.error ? toPlanMessage(deletePlan.error) : null
          }
          onSubmit={save}
          onPreview={setPreviewing}
          onValuesChange={(values) => setPreviewing((open) => (open && values ? values : open))}
          extraActions={
            <Button
              type="button"
              variant="ghost"
              className="text-storm hover:text-storm"
              onClick={() => {
                deletePlan.reset();
                setDeleting(current);
              }}
            >
              <Trash2 aria-hidden="true" />
              삭제
            </Button>
          }
        />
      </div>

      <PreviewSheet
        inline
        placeholder="[사전 검토]를 누르면 바꾼 내용으로 예보가 어떻게 달라지는지 여기에 보여 드려요."
        open={previewing !== null}
        title={previewing?.title ?? current.title}
        draft={draft}
        confirmLabel="이대로 저장"
        pending={updatePlan.isPending}
        onCancel={() => setPreviewing(null)}
        onConfirm={() => previewing && save(previewing)}
      />
      </div>

      <DeletePlanDialog
        plan={deleting}
        isPending={deletePlan.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={(p) =>
          deletePlan.mutate(p.id, {
            onSuccess: () => navigate("/plans"),
            onError: () => setDeleting(null),
          })
        }
      />
    </PageContainer>
  );
}
