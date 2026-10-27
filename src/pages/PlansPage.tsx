import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { LoadError } from "@/components/LoadError";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { useForecastData } from "@/features/forecast/api";
import { planLoads, semesterAchievement, TOTAL_WEEKS, WEEKDAY_LABELS, type PlanLoad } from "@/features/forecast/calc";
import { formatDuration, WEATHER_STYLE, toPercent } from "@/features/forecast/weather";
import { toPlanMessage, useDeletePlan, usePlans } from "@/features/plans/api";
import { DeletePlanDialog } from "@/features/plans/components/DeletePlanDialog";
import { toCategoryMessage, useDeleteCategory, usePlanCategories } from "@/features/plans/categories";
import { typeTagOf } from "@/features/plans/colors";
import { canAddPlan, groupPlansByType, LOAD_LEVEL_LABEL, MAX_PLANS, PRIORITY_LABEL } from "@/features/plans/defaults";
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
  // 10/27: 계획마다 학기 부담(비중)·가장 바쁜 주·달성률
  const forecastData = useForecastData();
  const available = forecastData.profile?.available_hours ?? 0;
  const loads = useMemo(() => {
    if (!forecastData.forecast) return new Map<string, PlanLoad>();
    return new Map(planLoads(forecastData.forecast, available).filter((l) => l.source === "plan").map((l) => [l.title, l]));
  }, [forecastData.forecast, available]);
  const semesterRate = forecastData.forecast ? semesterAchievement(forecastData.forecast, available) : null;

  const list = plans.data ?? [];
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
          list.length > 0
            ? `계획 ${list.length}개를 넣었어요. ${MAX_PLANS}개까지 넣을 수 있어요.${semesterRate && semesterRate.need_hours > 0 ? ` 이대로면 학기 계획의 ${toPercent(semesterRate.rate)}%를 해낼 수 있어요 (시간이 모자란 주는 우선순위 높은 계획부터).` : ""}`
            : "수업·활동·프로젝트를 담아두면 예보에 반영돼요."
        }
        action={plans.isPending || plans.isError || list.length === 0 || canAdd ? null : addButton}
      />

      {!canAdd && plans.data ? (
        <p id="plan-limit" role="status" className="rounded-xl border border-caution/40 bg-caution/10 px-4 py-3 text-sm">
          계획이 {MAX_PLANS}개라 더 넣을 수 없어요. 끝난 계획을 지운 뒤 추가하세요.
        </p>
      ) : null}

      {deletePlan.error ? <FormAlert>{toPlanMessage(deletePlan.error)}</FormAlert> : null}
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
          {groupPlansByType(list, categories.data ?? []).map((group) => {
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
                    load={loads.get(plan.title)}
                    color={typeTagOf({ plan_type: plan.type, category_id: plan.category_id }, categories.data ?? []).color}
                    onDelete={() => setDeleting(plan)}
                  />
                ))}
              </ul>
            </section>
            );
          })}
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

function PlanRow({ plan, load, color, onDelete }: { plan: Plan; load?: PlanLoad; color: string; onDelete: () => void }) {
  const left = ((plan.start_week - 1) / TOTAL_WEEKS) * 100;
  const width = ((plan.end_week - plan.start_week + 1) / TOTAL_WEEKS) * 100;
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-border/60 px-5 py-3.5 last:border-b-0 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_6.5rem_auto]">
      <div className="min-w-0">
        <p className="truncate font-medium">{plan.title}</p>
        <p className="flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted-foreground">
          <PriorityBadge priority={plan.priority as PlanPriority} />
          {plan.credits ? `${plan.credits}학점 · ` : ""}
          {plan.no_exam ? "시험 없음 · " : ""}
          {plan.study_days?.length ? `${plan.study_days.map((d) => WEEKDAY_LABELS[d]).join("·")} · ` : ""}
          {LOAD_LEVEL_LABEL[plan.load_level as PlanLoadLevel]}
          {plan.start_date && plan.end_date ? <span>· {dateRange(plan.start_date, plan.end_date)}</span> : null}
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
        <Button asChild variant="ghost" size="icon" aria-label={`${plan.title} 수정`}>
          <Link to={`/plans/${plan.id}/edit`}>
            <Pencil aria-hidden="true" />
          </Link>
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label={`${plan.title} 삭제`} onClick={onDelete} className="hover:text-destructive">
          <Trash2 aria-hidden="true" />
        </Button>
      </div>

      {load ? <PlanLoadLine load={load} color={color} /> : null}
    </li>
  );
}

/**
 * 계획마다 부담 (10/27 피드백): 학기 전체 공부 중 이 계획의 비중(막대), 가장 많이 드는 주, 달성률.
 * 달성률은 시간이 모자란 주에 우선순위 높은 계획부터 시간을 준다고 계산해요 (calc.ts planLoads).
 */
function PlanLoadLine({ load, color }: { load: PlanLoad; color: string }) {
  const share = Math.round(load.share * 100);
  const rate = toPercent(load.rate);
  const tone = rate >= 100 ? WEATHER_STYLE.clear.text : rate >= 80 ? WEATHER_STYLE.cloudy.text : WEATHER_STYLE.storm.text;
  return (
    <div className="col-span-full flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        학기 부담
        <span className="relative h-1.5 w-16 rounded bg-muted" aria-hidden="true">
          <span className="absolute inset-y-0 left-0 rounded" style={{ width: `${Math.max(4, Math.min(100, share * 3))}%`, backgroundColor: color }} />
        </span>
        <strong className="font-semibold text-foreground tabular-nums">{share}%</strong>
      </span>
      <span>
        가장 바쁜 주 {load.peak_week}주차 {formatDuration(load.peak_hours)}
      </span>
      <span>
        예상 달성률 <strong className={cn("font-semibold tabular-nums", tone)}>{rate}%</strong>
      </span>
    </div>
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
