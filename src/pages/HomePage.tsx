import { useState } from "react";
import { Link, Navigate } from "react-router";
import { CloudLightning, CloudSun, Plus, RotateCw, Sun } from "lucide-react";
import { PageContainer } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useForecastData } from "@/features/forecast/api";
import { dailyForecast, type Forecast, type WeekForecast } from "@/features/forecast/calc";
import { DailyBreakdown } from "@/features/forecast/components/DailyBreakdown";
import { DeadlineBanner } from "@/features/forecast/components/DeadlineBanner";
import { ForecastChart } from "@/features/forecast/components/ForecastChart";
import { WeekDetail } from "@/features/forecast/components/WeekDetail";
import { formatDuration, summaryText, WEATHER_ORDER, WEATHER_STYLE } from "@/features/forecast/weather";
import { usePlanCategories } from "@/features/plans/categories";
import { typeTagOf } from "@/features/plans/colors";
import { cn } from "@/lib/utils";
import type { Plan, PlanCategory } from "@/types/database";

/**
 * S-08 부담 예보 (홈, 경로 /) — 담당: 프론트 B (feature/frontend-jw)
 * 데이터와 계산은 useForecastData() 하나로 끝나요. 여기서 다시 계산하지 마세요.
 */
export default function HomePage() {
  const data = useForecastData();
  const [picked, setPicked] = useState<number | null>(null);
  const categories = usePlanCategories().data ?? [];

  if (data.status === "loading") return <HomeSkeleton />;
  if (data.status === "error") return <HomeError onRetry={data.refetch} />;
  if (data.status === "needs-onboarding" || !data.profile || !data.forecast) return <Navigate to="/onboarding" replace />;

  const { profile, forecast, currentWeek, plans, deadlines } = data;
  const available = profile.available_hours ?? 0;
  const empty = data.status === "empty";
  const selectedWeek = picked ?? currentWeek ?? 1;
  const selected = forecast.weeks[selectedWeek - 1];

  return (
    <PageContainer>
      {empty ? <EmptyHeadline /> : <Headline forecast={forecast} currentWeek={currentWeek} available={available} />}

      <DeadlineBanner deadlines={deadlines} semesterStart={profile.semester_start ?? ""} />

      <div className="flex flex-wrap items-start gap-6">
        <section
          aria-labelledby="chart-title"
          className="grid min-w-0 flex-[999_1_600px] gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <h2 id="chart-title" className="text-lg font-semibold">
              주차별 예상 시간
            </h2>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
              {!empty &&
                WEATHER_ORDER.map((level) => (
                  <li key={level} className="inline-flex items-center gap-1.5">
                    <span className={cn("size-2.5 rounded-[3px]", WEATHER_STYLE[level].dot)} aria-hidden="true" />
                    {WEATHER_STYLE[level].label} {forecast.summary[level]}주
                  </li>
                ))}
              <li className="inline-flex items-center gap-1.5">
                <span className="w-4 border-t-[1.5px] border-dashed border-ink" aria-hidden="true" />
                가용 {available}시간
              </li>
            </ul>
          </div>

          <ForecastChart
            weeks={forecast.weeks}
            availableHours={available}
            currentWeek={currentWeek}
            selectedWeek={selectedWeek}
            onSelect={setPicked}
          />

          <p className="border-t border-border/60 pt-3 text-[13px] text-muted-foreground">
            {empty
              ? "계획을 하나 넣을 때마다 이 자리에 막대가 쌓여요."
              : "막대나 주차를 누르면 그 주의 내역이 나와요. 진한 원은 이번 주예요."}
          </p>

          {/* 요일별 가용 시간·부담 (10/24 QA) */}
          <div className="border-t border-border/60 pt-4">
            <DailyBreakdown week={selectedWeek} days={data.input ? dailyForecast(data.input, selectedWeek) : null} />
          </div>
        </section>

        <aside className="grid min-w-0 flex-[1_1_320px] gap-4">
          {empty ? (
            <EmptyActions />
          ) : (
            <>
              <WeekDetail
                week={selected}
                availableHours={available}
                midtermWeek={profile.midterm_week}
                finalWeek={profile.final_week}
                isCurrent={selectedWeek === currentWeek}
                categories={categories}
              />
              <PlanSummary plans={plans} categories={categories} />
            </>
          )}
        </aside>
      </div>
    </PageContainer>
  );
}

/** 맨 위 요약: 다가오는 폭풍(없으면 흐림) 주와 "폭풍 n주 · 흐림 n주" (FR-05-3) */
function Headline({ forecast, currentWeek, available }: { forecast: Forecast; currentWeek: number | null; available: number }) {
  const from = currentWeek ?? 1;
  const upcoming = forecast.weeks.filter((w) => w.week >= from);
  const focus: WeekForecast | undefined =
    upcoming.find((w) => w.level === "storm") ?? upcoming.find((w) => w.level === "cloudy");

  const level = focus?.level ?? "clear";
  const Icon = level === "storm" ? CloudLightning : level === "cloudy" ? CloudSun : Sun;
  const badge = level === "storm" ? "폭풍 경보" : level === "cloudy" ? "흐림 주의" : "맑음";
  const title = !focus
    ? "남은 학기는 맑을 예정이에요"
    : level === "storm"
      ? `${focus.week}주차에 폭풍이 예보돼요`
      : `${focus.week}주차가 흐릴 예정이에요`;
  const over = focus ? Math.round((focus.total_hours - available) * 10) / 10 : 0;

  return (
    <section className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
      <div className="grid max-w-[620px] gap-2.5">
        <span
          className={cn(
            "inline-flex h-[30px] items-center gap-1.5 justify-self-start rounded-full pr-3 pl-2.5 text-sm font-semibold",
            WEATHER_STYLE[level].badge,
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
          {badge}
        </span>
        <h1 className="text-[28px] leading-tight font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          <strong className="font-semibold text-foreground">{summaryText(forecast.summary)}</strong>
          {focus ? (
            <>
              {" "}
              · {focus.week}주차에 {formatDuration(focus.total_hours)}이 예상돼요.{" "}
              {over > 0 ? `가용 시간보다 ${formatDuration(over)} 많아요.` : "가용 시간에 거의 꽉 차요."}
            </>
          ) : null}
        </p>
      </div>
      {currentWeek ? <WeekProgress currentWeek={currentWeek} /> : null}
    </section>
  );
}

function WeekProgress({ currentWeek }: { currentWeek: number }) {
  return (
    <div className="grid w-full min-w-[260px] gap-2 sm:w-auto">
      <div className="flex justify-between text-sm">
        <span className="font-semibold">{currentWeek}주차</span>
        <span className="text-muted-foreground">16주 중</span>
      </div>
      <div className="grid grid-cols-16 gap-[3px]" aria-hidden="true">
        {Array.from({ length: 16 }, (_, i) => (
          <span
            key={i}
            className={cn("h-2 rounded-[2px]", i + 1 < currentWeek ? "bg-[#9aa6ba]" : i + 1 === currentWeek ? "bg-ink" : "bg-border")}
          />
        ))}
      </div>
    </div>
  );
}

function PlanSummary({ plans, categories }: { plans: Plan[]; categories: PlanCategory[] }) {
  const shown = plans.slice(0, 5);
  return (
    <section aria-labelledby="plans-title" className="grid gap-2 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <h2 id="plans-title" className="text-base font-semibold">
          이번 학기 계획 {plans.length}개
        </h2>
        <Link to="/plans/new" className="text-sm font-semibold text-primary hover:underline">
          추가
        </Link>
      </div>
      {plans.length === 0 ? (
        <p className="border-t border-border/60 pt-2 text-sm text-muted-foreground">자격증만 골라져 있어요.</p>
      ) : (
        <ul className="text-sm">
          {shown.map((p) => {
            const tag = typeTagOf({ source: "plan", plan_type: p.type, category_id: p.category_id }, categories);
            return (
            <li key={p.id} className="flex justify-between gap-3 border-t border-border/60 py-2">
              <span className="flex min-w-0 items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} aria-hidden="true" />
                <span className="truncate">{p.title}</span>
                <span className="sr-only">({tag.label})</span>
              </span>
              <span className="shrink-0 text-muted-foreground tabular-nums">
                {p.start_week}~{p.end_week}주, {formatDuration(p.hours_per_week)}
              </span>
            </li>
            );
          })}
        </ul>
      )}
      {plans.length > shown.length ? (
        <Link to="/plans" className="text-sm text-muted-foreground hover:text-foreground">
          전체 {plans.length}개 보기
        </Link>
      ) : null}
    </section>
  );
}

/** 빈 상태 (FR-05-6) — 디자인: PcEmptyMain.html */
function EmptyHeadline() {
  return (
    <section className="grid max-w-[620px] gap-2.5">
      <h1 className="text-[28px] leading-tight font-bold tracking-tight sm:text-4xl">아직 예보할 계획이 없어요</h1>
      <p className="text-[15px] leading-relaxed text-muted-foreground sm:text-base">
        계획을 추가하면 예보가 나타납니다. 수업부터 넣는 걸 추천해요.
      </p>
    </section>
  );
}

function EmptyActions() {
  return (
    <div className="grid gap-3">
      <Button asChild size="lg" className="bg-ink hover:bg-ink/90">
        <Link to="/plans/new">
          <Plus aria-hidden="true" />
          계획 추가
        </Link>
      </Button>
      <Button asChild size="lg" variant="outline">
        <Link to="/certificates">자격증 고르기</Link>
      </Button>
    </div>
  );
}

/** 불러오는 동안 화면 틀 (6.1) */
function HomeSkeleton() {
  return (
    <PageContainer>
      <div className="grid gap-3" aria-busy="true" aria-label="예보를 불러오는 중">
        <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
        <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-muted" />
        <div className="h-5 w-full max-w-sm animate-pulse rounded bg-muted" />
      </div>
      <div className="flex flex-wrap gap-6">
        <div className="h-[380px] min-w-0 flex-[999_1_600px] animate-pulse rounded-2xl bg-muted" />
        <div className="h-[260px] min-w-0 flex-[1_1_320px] animate-pulse rounded-2xl bg-muted" />
      </div>
    </PageContainer>
  );
}

/** 불러오기 실패 — 디자인: PcLoadError.html */
function HomeError({ onRetry }: { onRetry: () => void }) {
  return (
    <PageContainer>
      <section role="alert" className="flex flex-wrap items-center gap-4 rounded-2xl border border-storm/30 bg-storm/5 p-5 sm:p-6">
        <div className="grid min-w-0 flex-1 gap-1">
          <h1 className="text-xl font-bold">예보를 불러오지 못했어요</h1>
          <p className="text-sm text-muted-foreground">인터넷 연결을 확인한 뒤 다시 시도하세요. 입력한 계획은 그대로 저장돼 있어요.</p>
        </div>
        <Button type="button" onClick={onRetry}>
          <RotateCw aria-hidden="true" />
          다시 시도
        </Button>
      </section>
    </PageContainer>
  );
}
