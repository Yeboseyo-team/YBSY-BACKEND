import type { ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LoadError } from "@/components/LoadError";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useForecastData } from "@/features/forecast/api";
import { addDays, dailyForecast, isInSemester, WEEKDAY_LABELS, weekOf } from "@/features/forecast/calc";
import { formatDuration, WEATHER_STYLE } from "@/features/forecast/weather";
import { usePlanCategories } from "@/features/plans/categories";
import { typeTagOf } from "@/features/plans/colors";
import { PRIORITY_LABEL } from "@/features/plans/defaults";
import { cn } from "@/lib/utils";

const isIsoDate = (s: string | undefined): s is string => Boolean(s && /^\d{4}-\d{2}-\d{2}$/.test(s));

/**
 * 하루 상세 (경로 /day/:date) — 10/24 QA
 * 예보 화면의 요일별 부담에서 한 줄을 누르면 와요. 그날 무엇에 몇 시간을 쓰면 되는지 보여 줍니다.
 * 계획에는 요일이 없어서, 한 주 시간을 요일별 가용 시간 비율대로 나눈 값이에요 (날짜를 정한 일정은 그날에만).
 */
export default function DayPage() {
  const { date } = useParams();
  const data = useForecastData();
  const categories = usePlanCategories().data ?? [];

  if (!isIsoDate(date)) return <Navigate to="/" replace />;

  const header = (title: string, description?: string) => (
    <PageHeader title={title} description={description} back={{ to: "/", label: "예보로" }} />
  );

  if (data.status === "loading") {
    return (
      <PageContainer>
        {header("하루 할 일")}
        <Skeleton className="h-72 max-w-2xl rounded-2xl" />
      </PageContainer>
    );
  }
  if (data.status === "error") {
    return (
      <PageContainer>
        {header("하루 할 일")}
        <LoadError what="예보 데이터" onRetry={data.refetch} />
      </PageContainer>
    );
  }
  if (data.status === "needs-onboarding" || !data.profile?.semester_start || !data.input) return <Navigate to="/onboarding" replace />;

  const week = weekOf(date, data.profile.semester_start);
  const [, m, d] = date.split("-").map(Number);
  const prev = addDays(date, -1);
  const next = addDays(date, 1);
  const inSemester = (day: string) => isInSemester(weekOf(day, data.profile!.semester_start!));

  const days = isInSemester(week) ? dailyForecast(data.input, week) : null;
  const day = days?.find((x) => x.date === date);
  const title = day ? `${m}월 ${d}일 (${WEEKDAY_LABELS[day.weekday]})` : `${m}월 ${d}일`;

  const dayLink = (to: string, children: ReactNode) =>
    inSemester(to) ? (
      <Button asChild variant="outline" size="sm">
        <Link to={`/day/${to}`}>{children}</Link>
      </Button>
    ) : (
      <Button variant="outline" size="sm" disabled>
        {children}
      </Button>
    );
  const nav = (
    <div className="flex flex-wrap gap-2">
      {dayLink(prev, <><ChevronLeft aria-hidden="true" />전날</>)}
      {dayLink(next, <>다음 날<ChevronRight aria-hidden="true" /></>)}
    </div>
  );

  if (!isInSemester(week)) {
    return (
      <PageContainer>
        {header(title, "학기(1~16주차) 밖의 날짜예요.")}
      </PageContainer>
    );
  }
  if (!days || !day) {
    return (
      <PageContainer>
        {header(title, `${week}주차`)}
        <p className="max-w-2xl rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
          요일마다 쓸 수 있는 시간을 정하면 날마다 할 일을 나눠 보여 드려요.{" "}
          <Link to="/settings" className="font-semibold text-primary underline underline-offset-[3px]">
            설정에서 정하기
          </Link>
        </p>
      </PageContainer>
    );
  }

  const style = WEATHER_STYLE[day.level];
  const over = day.hours - day.available;
  const scale = Math.max(...day.items.map((i) => i.hours), 1);

  return (
    <PageContainer>
      {header(title, `${week}주차${week === data.profile.midterm_week ? " · 중간고사 주간" : week === data.profile.final_week ? " · 기말고사 주간" : ""}`)}

      <div className="grid max-w-2xl gap-4">
        <section className="grid gap-3 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              이날 예상 <span className={cn("text-2xl font-bold tabular-nums", style.text)}>{formatDuration(day.hours)}</span> · 쓸 수 있는 시간{" "}
              {day.available}시간
            </p>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", style.badge)}>
              {style.label}
              {day.ratio !== null ? ` ${Math.round(day.ratio * 100)}%` : ""}
            </span>
          </div>
          {over > 0 ? (
            <p className="rounded-lg bg-storm/5 px-3 py-2 text-[13px]">
              쓸 수 있는 시간보다 <span className="font-semibold">{formatDuration(over)}</span> 많아요. 같은 주에 여유 있는 날로 옮기거나,
              우선순위가 낮은 일부터 줄여 보세요.
            </p>
          ) : null}
          {nav}
        </section>

        <section aria-labelledby="day-items" className="grid gap-1 rounded-2xl border border-border bg-card p-5">
          <h2 id="day-items" className="mb-1 text-base font-semibold">
            이날 할 일
          </h2>
          {day.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">이날은 잡힌 일이 없어요.</p>
          ) : (
            <ul>
              {day.items.map((item, i) => {
                const tag = typeTagOf(item, categories);
                return (
                  <li key={`${item.source}-${item.title}-${i}`} className="grid gap-1.5 border-t border-border/60 py-3 first:border-t-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="flex min-w-0 flex-wrap items-center gap-x-1.5">
                        <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} aria-hidden="true" />
                        <span className="font-medium">{item.title}</span>
                        <span className="text-xs font-semibold" style={{ color: tag.color }}>
                          {tag.label}
                        </span>
                        {item.weighted ? <span className="text-xs text-[#9a5b00]">시험 ×1.5</span> : null}
                        {item.priority && item.priority !== "normal" ? (
                          <span className="text-xs text-muted-foreground">{PRIORITY_LABEL[item.priority]}</span>
                        ) : null}
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums">{formatDuration(item.hours)}</span>
                    </div>
                    <span className="h-2 rounded-full bg-muted" aria-hidden="true">
                      <span className="block h-full rounded-full" style={{ width: `${(item.hours / scale) * 100}%`, backgroundColor: tag.color }} />
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            계획에는 요일이 정해져 있지 않아서, 한 주 시간을 요일별로 쓸 수 있는 시간에 맞춰 나눴어요. 날짜를 정한 일정(예: 결혼식)은 그날에만
            들어가요.
          </p>
        </section>
      </div>
    </PageContainer>
  );
}
