import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { CalendarRange, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/features/forecast/weather";
import { toPlanMessage, useCreatePlan, useDeletePlan, usePlans, type PlanInput } from "@/features/plans/api";
import { PlanForm } from "@/features/plans/components/PlanForm";
import { canAddPlan, MAX_PLANS, PLAN_TYPE_LABEL } from "@/features/plans/defaults";

/** 시간표 화면 등에서 다 넣고 돌아올 곳 */
export const ONBOARDING_PLANS_PATH = "/start/plans";

/**
 * 온보딩 2단계 — 이번 학기 계획 넣기 (경로 /start/plans, 10/26 피드백)
 * 로그인 → 학기 설정 → 여기서 계획을 다 넣고 → 예보 화면에서 한 번에 봐요.
 * 하나씩 넣거나 시간표로 한 번에 넣을 수 있고, 넣은 계획은 목록에 쌓여요. 나중에 넣어도 돼요.
 */
export default function OnboardingPlansPage() {
  const navigate = useNavigate();
  // 1단계에서 AI 가 읽은 계획을 넣다가 실패했으면 알려 줘요
  const failed = useLocation().state as { planError?: string; missed?: string[] } | null;
  const plans = usePlans();
  const create = useCreatePlan();
  const remove = useDeletePlan();
  // 하나 넣을 때마다 폼을 새로 그려 비워요
  const [formKey, setFormKey] = useState(0);
  const list = plans.data ?? [];
  const full = !canAddPlan(list.length);

  const save = (values: PlanInput) => create.mutate(values, { onSuccess: () => setFormKey((k) => k + 1) });

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 pt-6 sm:px-10">
        <Logo className="text-lg font-extrabold tracking-tight" />
        <span className="text-sm text-muted-foreground tabular-nums">2 / 2 단계</span>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-10 lg:py-12">
        <div>
          <h1 className="text-3xl leading-tight font-bold tracking-tight text-balance lg:text-4xl">이번 학기 계획을 넣어 주세요</h1>
          <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
            수업·활동·프로젝트를 넣으면 다음 화면 예보에 한 번에 보여 드려요. 다 넣었으면 [예보 보기]를 누르세요.
          </p>
        </div>

        {failed?.planError ? (
          <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm">
            1단계에서 고른 계획({failed.missed?.join(", ")})을 넣지 못했어요. {failed.planError} 아래에서 다시 넣어 주세요.
          </p>
        ) : null}

        <div className="grid items-start gap-6 lg:grid-cols-[520px_minmax(0,1fr)]">
          <section aria-label="계획 하나 넣기" className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">계획 하나 넣기</h2>
              <Button asChild variant="outline" size="sm">
                <Link to={`/plans/import?next=${encodeURIComponent(ONBOARDING_PLANS_PATH)}`}>
                  <CalendarRange aria-hidden="true" />
                  시간표로 수업 한 번에
                </Link>
              </Button>
            </div>
            {full ? <p className="text-sm text-muted-foreground">계획은 {MAX_PLANS}개까지 넣을 수 있어요.</p> : null}
            <PlanForm
              key={formKey}
              submitLabel="넣기"
              pendingLabel="넣는 중…"
              isPending={create.isPending}
              errorMessage={create.error ? toPlanMessage(create.error) : null}
              disabled={full}
              onSubmit={save}
            />
          </section>

          <section aria-labelledby="added-plans" className="grid gap-3 rounded-2xl border border-border bg-card p-5 sm:p-6 lg:sticky lg:top-6">
            <h2 id="added-plans" className="text-base font-semibold">
              넣은 계획 <span className="text-muted-foreground tabular-nums">{list.length}개</span>
            </h2>
            {list.length === 0 ? (
              <p className="text-sm text-muted-foreground">아직 없어요. 계획을 하나씩 넣거나 시간표로 한 번에 넣어 보세요.</p>
            ) : (
              <ul className="grid gap-1.5" aria-live="polite">
                {list.map((p) => (
                  <li key={p.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="min-w-0 flex-1 truncate font-medium">{p.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {PLAN_TYPE_LABEL[p.type as keyof typeof PLAN_TYPE_LABEL] ?? "기타"}
                      {p.credits ? ` · ${p.credits}학점` : ""}{p.no_exam ? " · 시험 없음" : ""} · 한 주 {formatDuration(Number(p.hours_per_week))}
                    </span>
                    <button
                      type="button"
                      aria-label={`${p.title} 빼기`}
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(p.id)}
                      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <X aria-hidden="true" className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Button size="lg" className="mt-2 bg-ink hover:bg-ink/90" onClick={() => navigate("/", { replace: true })}>
              {list.length === 0 ? "나중에 넣을게요, 예보 보기" : `계획 ${list.length}개로 예보 보기`}
            </Button>
            <p className="text-xs text-muted-foreground">자격증 준비는 예보 화면의 [자격증]에서 넣을 수 있어요.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
