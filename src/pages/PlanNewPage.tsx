import { useState } from "react";
import { useNavigate } from "react-router";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { ForecastPreview } from "@/features/forecast/components/ForecastPreview";
import { toPlanMessage, useCreatePlan, usePlans } from "@/features/plans/api";
import { PlanForm } from "@/features/plans/components/PlanForm";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { MAX_PLANS } from "@/features/plans/schemas";
import type { PlanInput } from "@/features/plans/types";

/** 계획 추가와 사전 검토 (PcPlan, FR-02-1, F-06) */
export default function PlanNewPage() {
  const navigate = useNavigate();
  const plans = usePlans();
  const create = useCreatePlan();
  const [draft, setDraft] = useState<PlanInput | null>(null);
  const full = (plans.data?.length ?? 0) >= MAX_PLANS;

  return (
    <PageContainer>
      <PageHeader
        back={{ to: "/plans", label: "계획 목록으로" }}
        title="계획 추가"
        description="입력하는 동안 오른쪽 예보가 바로 바뀌어요. 추가하기를 누르기 전에는 저장되지 않아요."
      />
      {full ? (
        <FormAlert>계획은 {MAX_PLANS}개까지 넣을 수 있어요. 끝난 계획을 지운 뒤 다시 추가하세요.</FormAlert>
      ) : null}
      <div className="grid items-start gap-6 lg:grid-cols-[22.5rem_minmax(0,1fr)] [&>*]:min-w-0">
        <div className="rounded-xl border border-border bg-card p-6">
          <PlanForm
            submitLabel="추가하기"
            pendingLabel="추가하는 중…"
            isPending={create.isPending}
            errorMessage={create.error ? toPlanMessage(create.error) : undefined}
            onDraftChange={setDraft}
            onCancel={() => navigate("/plans")}
            onSubmit={(values) => create.mutate(values, { onSuccess: () => navigate("/plans") })}
          />
        </div>
        <ForecastPreview draft={draft} />
      </div>
    </PageContainer>
  );
}
