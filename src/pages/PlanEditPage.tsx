import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { ForecastPreview } from "@/features/forecast/components/ForecastPreview";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { toPlanMessage, useDeletePlan, usePlans, useUpdatePlan } from "@/features/plans/api";
import { PlanForm } from "@/features/plans/components/PlanForm";
import { objectParticle } from "@/features/forecast/preview-text";
import type { PlanInput } from "@/features/plans/types";

/** 계획 수정 (PcPlanEdit, FR-02-2·3) */
export default function PlanEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const plans = usePlans();
  const update = useUpdatePlan();
  const remove = useDeletePlan();
  const [draft, setDraft] = useState<PlanInput | null>(null);
  const [confirming, setConfirming] = useState(false);

  const plan = plans.data?.find((p) => p.id === id);
  const back = { to: "/plans", label: "계획 목록으로" };

  if (plans.isPending) {
    return (
      <PageContainer>
        <PageHeader back={back} title="계획 수정" description="계획을 불러오는 중…" />
      </PageContainer>
    );
  }
  if (!plan) {
    return (
      <PageContainer>
        <PageHeader back={back} title="계획을 찾을 수 없어요" />
        <FormAlert>
          {plans.isError ? toPlanMessage(plans.error) : "이미 지웠거나 주소가 잘못되었어요."}{" "}
          <Link to="/plans" className="underline underline-offset-2">
            계획 목록
          </Link>
          에서 다시 골라 주세요.
        </FormAlert>
      </PageContainer>
    );
  }

  const { id: _id, ...initial } = plan;

  return (
    <PageContainer>
      <PageHeader
        back={back}
        title="계획 수정"
        description="바꾼 내용은 오른쪽 예보에 바로 보여요. 저장하기 전에는 반영되지 않아요."
        action={
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setConfirming(true)}>
            <Trash2 aria-hidden="true" />
            삭제
          </Button>
        }
      />
      {remove.error ? <FormAlert>{toPlanMessage(remove.error)}</FormAlert> : null}
      <div className="grid items-start gap-6 lg:grid-cols-[22.5rem_minmax(0,1fr)] [&>*]:min-w-0">
        <div className="rounded-xl border border-border bg-card p-6">
          <PlanForm
            key={plan.id}
            defaultValues={initial}
            submitLabel="저장"
            pendingLabel="저장하는 중…"
            isPending={update.isPending}
            errorMessage={update.error ? toPlanMessage(update.error) : undefined}
            onDraftChange={setDraft}
            onCancel={() => navigate("/plans")}
            onSubmit={(input) => update.mutate({ id: plan.id, input }, { onSuccess: () => navigate("/plans") })}
          />
        </div>
        <ForecastPreview draft={draft} editingId={plan.id} />
      </div>

      <ConfirmDialog
        open={confirming}
        destructive
        title={`${plan.title}${objectParticle(plan.title)} 삭제할까요?`}
        description={`${plan.start_week}~${plan.end_week}주차에서 한 주 ${plan.hours_per_week}시간이 빠져요. 삭제한 계획은 되돌릴 수 없어요.`}
        confirmLabel="삭제"
        pending={remove.isPending}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          remove.mutate(plan.id);
          navigate("/plans");
        }}
      />
    </PageContainer>
  );
}
