import { useState } from "react";
import { Link } from "react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { LoadError } from "@/components/LoadError";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { TOTAL_WEEKS } from "@/features/forecast/calc";
import { formatHours } from "@/features/forecast/weather";
import { toPlanMessage, useDeletePlan, usePlans } from "@/features/plans/api";
import { DeletePlanDialog } from "@/features/plans/components/DeletePlanDialog";
import { canAddPlan, groupPlansByType, LOAD_LEVEL_LABEL, MAX_PLANS } from "@/features/plans/defaults";
import type { Plan, PlanLoadLevel } from "@/types/database";

/**
 * S-09 계획 목록 (경로 /plans) — 담당: 프론트 B (feature/frontend-jw)
 * 유형별로 묶어 보여 주고(FR-02-2), 수정은 /plans/:id/edit, 삭제는 확인 창을 거쳐요 (FR-02-4).
 */
export default function PlansPage() {
  const plans = usePlans();
  const deletePlan = useDeletePlan();
  const [deleting, setDeleting] = useState<Plan | null>(null);

  const list = plans.data ?? [];
  const canAdd = canAddPlan(list.length);

  const addButton = canAdd ? (
    <Button asChild size="lg" className="bg-ink hover:bg-ink/90">
      <Link to="/plans/new">
        <Plus aria-hidden="true" />
        계획 추가
      </Link>
    </Button>
  ) : (
    <Button size="lg" disabled aria-describedby="plan-limit">
      <Plus aria-hidden="true" />
      계획 추가
    </Button>
  );

  return (
    <PageContainer>
      <PageHeader
        title="계획"
        description={
          list.length > 0 ? `계획 ${list.length}개를 넣었어요. ${MAX_PLANS}개까지 넣을 수 있어요.` : "수업·활동·프로젝트를 담아두면 예보에 반영돼요."
        }
        action={plans.isPending || plans.isError || list.length === 0 ? null : addButton}
      />

      {!canAdd && plans.data ? (
        <p id="plan-limit" role="status" className="rounded-xl border border-caution/40 bg-caution/10 px-4 py-3 text-sm">
          계획이 {MAX_PLANS}개라 더 넣을 수 없어요. 끝난 계획을 지운 뒤 추가하세요.
        </p>
      ) : null}

      {deletePlan.error ? <FormAlert>{toPlanMessage(deletePlan.error)}</FormAlert> : null}

      {plans.isPending ? (
        <PlansSkeleton />
      ) : plans.isError ? (
        <LoadError what="계획 데이터" onRetry={() => void plans.refetch()} retrying={plans.isFetching} />
      ) : list.length === 0 ? (
        <section className="grid justify-items-center gap-3 rounded-2xl border border-border bg-card px-6 py-12 text-center">
          <h2 className="text-lg font-semibold">아직 넣은 계획이 없어요</h2>
          <p className="text-sm text-muted-foreground">수업부터 넣으면 주차별로 얼마나 바쁜지 예보해 드려요.</p>
          {addButton}
        </section>
      ) : (
        <div className="grid gap-5">
          {groupPlansByType(list).map((group) => (
            <section key={group.type} aria-labelledby={`group-${group.type}`} className="rounded-2xl border border-border bg-card">
              <h2 id={`group-${group.type}`} className="flex items-baseline gap-2 border-b border-border/60 px-5 py-3.5 text-base font-semibold">
                {group.label}
                <span className="text-sm font-normal text-muted-foreground">{group.plans.length}개</span>
              </h2>
              <ul>
                {group.plans.map((plan) => (
                  <PlanRow key={plan.id} plan={plan} onDelete={() => setDeleting(plan)} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <DeletePlanDialog
        plan={deleting}
        isPending={deletePlan.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={(plan) => {
          deletePlan.reset();
          // 목록에서 먼저 빠지고, 실패하면 훅이 되돌려요
          deletePlan.mutate(plan.id);
          setDeleting(null);
        }}
      />
    </PageContainer>
  );
}

function PlanRow({ plan, onDelete }: { plan: Plan; onDelete: () => void }) {
  const left = ((plan.start_week - 1) / TOTAL_WEEKS) * 100;
  const width = ((plan.end_week - plan.start_week + 1) / TOTAL_WEEKS) * 100;
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-border/60 px-5 py-3.5 last:border-b-0 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_6.5rem_auto]">
      <div className="min-w-0">
        <p className="truncate font-medium">{plan.title}</p>
        <p className="text-[13px] text-muted-foreground">
          {plan.credits ? `${plan.credits}학점 · ` : ""}
          {LOAD_LEVEL_LABEL[plan.load_level as PlanLoadLevel]}
        </p>
      </div>

      <div className="col-span-2 row-start-2 flex items-center gap-3 sm:col-span-1 sm:row-start-auto">
        <span className="relative h-2 flex-1 rounded bg-muted" aria-hidden="true">
          <span className="absolute inset-y-0 rounded bg-[#9aa6ba]" style={{ left: `${left}%`, width: `${width}%` }} />
        </span>
        <span className="w-14 shrink-0 text-[13px] text-muted-foreground tabular-nums">
          {plan.start_week}~{plan.end_week}주
        </span>
      </div>

      <p className="hidden text-sm font-semibold tabular-nums sm:block">한 주 {formatHours(plan.hours_per_week)}시간</p>

      <div className="flex items-center gap-1">
        <span className="mr-1 text-sm font-semibold tabular-nums sm:hidden">{formatHours(plan.hours_per_week)}시간</span>
        <Button asChild variant="ghost" size="icon" aria-label={`${plan.title} 수정`}>
          <Link to={`/plans/${plan.id}/edit`}>
            <Pencil aria-hidden="true" />
          </Link>
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label={`${plan.title} 삭제`} onClick={onDelete} className="hover:text-destructive">
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}

function PlansSkeleton() {
  return (
    <div className="grid gap-5" aria-busy="true" aria-label="계획을 불러오는 중">
      {[3, 2].map((rows, i) => (
        <div key={i} className="grid gap-3 rounded-2xl border border-border bg-card p-5">
          <Skeleton className="h-5 w-20" />
          {Array.from({ length: rows }, (_, j) => (
            <Skeleton key={j} className="h-10 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
