import { useState } from "react";
import { Link } from "react-router";
import { CircleStop, Pencil, Play, Plus, Trash2, X } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { LoadError } from "@/components/LoadError";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { todayInKorea, TOTAL_WEEKS, WEEKDAY_LABELS } from "@/features/forecast/calc";
import { formatDuration } from "@/features/forecast/weather";
import { toPlanMessage, useDeletePlan, usePlans, useStopPlan } from "@/features/plans/api";
import { DeletePlanDialog } from "@/features/plans/components/DeletePlanDialog";
import { toCategoryMessage, useDeleteCategory, usePlanCategories } from "@/features/plans/categories";
import { typeTagOf } from "@/features/plans/colors";
import { canAddPlan, EXAM_MODE_LABEL, groupPlansByType, LOAD_LEVEL_LABEL, MAX_PLANS, PRIORITY_LABEL, toExamMode } from "@/features/plans/defaults";
import { withJosa } from "@/features/certificates/display";
import { cn } from "@/lib/utils";
import type { Plan, PlanLoadLevel, PlanPriority } from "@/types/database";

/**
 * S-09 계획 목록 (경로 /plans) — 담당: 프론트 B (feature/frontend-jw)
 * 유형별로 묶어 보여 주고(FR-02-2), 수정은 /plans/:id/edit, 삭제는 확인 창을 거쳐요 (FR-02-4).
 */
export default function PlansPage() {
  const plans = usePlans();
  const deletePlan = useDeletePlan();
  const categories = usePlanCategories();
  const deleteCategory = useDeleteCategory();
  const [deleting, setDeleting] = useState<Plan | null>(null);
  const stopPlan = useStopPlan();
  const today = todayInKorea();

  const list = plans.data ?? [];
  // 10/28: 그만둔 계획은 아래 "그만둔 계획"으로 따로
  const active = list.filter((p) => !p.stopped_at);
  const stopped = list.filter((p) => p.stopped_at);
  const stop = (plan: Plan) => {
    const [, m, d] = today.split("-").map(Number);
    if (
      window.confirm(
        `${withJosa(plan.title, "을", "를")} 오늘(${m}/${d})까지만 하고 그만둘까요?\n지금까지 기록한 시간과 지난 주 예보는 그대로 남고, 내일부터 예보에서 빠져요. [다시 시작]으로 되돌릴 수 있어요.`,
      )
    ) {
      stopPlan.mutate({ id: plan.id, date: today });
    }
  };
  const colorOf = (plan: Plan) => typeTagOf({ plan_type: plan.type, category_id: plan.category_id }, categories.data ?? []).color;
  const canAdd = canAddPlan(list.length);

  // 위쪽 메뉴(휴대폰·PC 모두)에 [계획 추가]가 있어서, 본문 버튼은 빈 목록일 때와 30개가 찼을 때만 (10/26 UI 점검: 휴대폰에서 두 번 보였음)
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
        action={plans.isPending || plans.isError || list.length === 0 || canAdd ? null : addButton}
      />

      {!canAdd && plans.data ? (
        <p id="plan-limit" role="status" className="rounded-xl border border-caution/40 bg-caution/10 px-4 py-3 text-sm">
          계획이 {MAX_PLANS}개라 더 넣을 수 없어요. 끝난 계획을 지운 뒤 추가하세요.
        </p>
      ) : null}

      {deletePlan.error ? <FormAlert>{toPlanMessage(deletePlan.error)}</FormAlert> : null}
      {stopPlan.error ? <FormAlert>{toPlanMessage(stopPlan.error)}</FormAlert> : null}
      {deleteCategory.error ? <FormAlert>{toCategoryMessage(deleteCategory.error)}</FormAlert> : null}

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
          {groupPlansByType(active, categories.data ?? []).map((group) => {
            const category = categories.data?.find((c) => c.id === group.key);
            return (
            <section key={group.key} aria-labelledby={`group-${group.key}`} className="rounded-2xl border border-border bg-card">
              <h2 id={`group-${group.key}`} className="flex items-baseline gap-2 border-b border-border/60 px-5 py-3.5 text-base font-semibold">
                {group.label}
                <span className="text-sm font-normal text-muted-foreground">{group.plans.length}개</span>
                {category ? (
                  <button
                    type="button"
                    className="ml-auto inline-flex items-center gap-1 self-center text-xs font-normal text-muted-foreground hover:text-destructive"
                    disabled={deleteCategory.isPending}
                    onClick={() => {
                      if (window.confirm(`"${category.name}" 유형을 지울까요? 이 유형의 계획은 지워지지 않고 "기타"로 옮겨져요.`)) {
                        deleteCategory.mutate(category.id);
                      }
                    }}
                  >
                    <X aria-hidden="true" className="size-3.5" />
                    유형 지우기
                  </button>
                ) : null}
              </h2>
              <ul>
                {group.plans.map((plan) => (
                  <PlanRow
                    key={plan.id}
                    plan={plan}
                    color={colorOf(plan)}
                    onDelete={() => setDeleting(plan)}
                    // 이미 끝난 계획은 그만둘 게 없어요
                    onStop={plan.end_date && plan.end_date < today ? undefined : () => stop(plan)}
                    busy={stopPlan.isPending}
                  />
                ))}
              </ul>
            </section>
            );
          })}

          {stopped.length > 0 ? (
            <section aria-labelledby="group-stopped" className="rounded-2xl border border-dashed border-border bg-card/60">
              <h2 id="group-stopped" className="flex items-baseline gap-2 border-b border-border/60 px-5 py-3.5 text-base font-semibold">
                그만둔 계획
                <span className="text-sm font-normal text-muted-foreground">{stopped.length}개</span>
              </h2>
              <p className="px-5 pt-3 text-[13px] text-muted-foreground">그만둔 날까지의 기록과 예보는 남아 있어요. 다음부터는 예보에 들어가지 않아요.</p>
              <ul className="opacity-70">
                {stopped.map((plan) => (
                  <PlanRow
                    key={plan.id}
                    plan={plan}
                    color={colorOf(plan)}
                    onDelete={() => setDeleting(plan)}
                    onResume={() => stopPlan.mutate({ id: plan.id, date: null })}
                    busy={stopPlan.isPending}
                  />
                ))}
              </ul>
            </section>
          ) : null}
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

function PlanRow({
  plan,
  color,
  onDelete,
  onStop,
  onResume,
  busy = false,
}: {
  plan: Plan;
  color: string;
  onDelete: () => void;
  /** 그만두기 (진행 중인 계획만) */
  onStop?: () => void;
  /** 다시 시작 (그만둔 계획만) */
  onResume?: () => void;
  busy?: boolean;
}) {
  const left = ((plan.start_week - 1) / TOTAL_WEEKS) * 100;
  const width = ((plan.end_week - plan.start_week + 1) / TOTAL_WEEKS) * 100;
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-border/60 px-5 py-3.5 last:border-b-0 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_6.5rem_auto]">
      <div className="min-w-0">
        <p className="truncate font-medium">{plan.title}</p>
        <p className="flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted-foreground">
          <PriorityBadge priority={plan.priority as PlanPriority} />
          {plan.credits ? `${plan.credits}학점 · ` : ""}
          {plan.type === "class" && toExamMode(plan) !== "both" ? `${EXAM_MODE_LABEL[toExamMode(plan)]} · ` : ""}
          {plan.study_days?.length ? `${plan.study_days.map((d) => WEEKDAY_LABELS[d]).join("·")} · ` : ""}
          {LOAD_LEVEL_LABEL[plan.load_level as PlanLoadLevel]}
          {plan.start_date && plan.end_date ? <span>· {dateRange(plan.start_date, plan.end_date)}</span> : null}
          {plan.stopped_at ? (
            <span className="font-semibold text-foreground">
              · 그만둠 {Number(plan.stopped_at.slice(5, 7))}/{Number(plan.stopped_at.slice(8, 10))}
            </span>
          ) : null}
        </p>
      </div>

      <div className="col-span-2 row-start-2 flex items-center gap-3 sm:col-span-1 sm:row-start-auto">
        <span className="relative h-2 flex-1 rounded bg-muted" aria-hidden="true">
          {/* 유형 색으로 (10/26 UI 점검: 회색 막대가 다 똑같아 보였음) */}
          <span className="absolute inset-y-0 rounded opacity-70" style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color }} />
        </span>
        <span className="w-14 shrink-0 text-[13px] text-muted-foreground tabular-nums">
          {plan.start_week === plan.end_week ? plan.start_week : `${plan.start_week}~${plan.end_week}`}주
        </span>
      </div>

      <p className="hidden text-sm font-semibold tabular-nums sm:block">
        {plan.start_week === plan.end_week ? "그 주" : "매주"} {formatDuration(plan.hours_per_week)}
      </p>

      <div className="flex items-center gap-1">
        <span className="mr-1 text-sm font-semibold tabular-nums sm:hidden">{formatDuration(plan.hours_per_week)}</span>
        {onStop ? (
          <Button type="button" variant="ghost" size="sm" aria-label={`${plan.title} 그만두기`} title="그만두기" disabled={busy} onClick={onStop} className="px-2">
            <CircleStop aria-hidden="true" />
            <span className="hidden lg:inline">그만두기</span>
          </Button>
        ) : null}
        {onResume ? (
          <Button type="button" variant="ghost" size="sm" aria-label={`${plan.title} 다시 시작`} disabled={busy} onClick={onResume} className="px-2">
            <Play aria-hidden="true" />
            <span className="hidden sm:inline">다시 시작</span>
          </Button>
        ) : null}
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

/** "10/31" 또는 "9/1~12/20" */
function dateRange(start: string, end: string): string {
  const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
  return start === end ? md(start) : `${md(start)}~${md(end)}`;
}

/** 우선순위 표시 (10/24 QA). 보통은 따로 표시하지 않아요 */
function PriorityBadge({ priority }: { priority: PlanPriority }) {
  if (priority === "normal") return null;
  return (
    <span
      className={cn(
        "rounded px-1.5 py-px text-[11px] font-semibold",
        priority === "high" ? "bg-ink text-white" : "bg-muted text-muted-foreground",
      )}
    >
      {PRIORITY_LABEL[priority]}
    </span>
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
