import { useState } from "react";
import { Link, Navigate } from "react-router";
import { CalendarDays, List, Plus, RotateCw } from "lucide-react";
import { PageContainer } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useForecastData } from "@/features/forecast/api";
import { BusyExplain } from "@/features/forecast/components/BusyExplain";
import { dailyForecast, todayInKorea, upcomingDeadlines } from "@/features/forecast/calc";
import { certificateEvents } from "@/features/forecast/calendar-events";
import { ForecastCalendar } from "@/features/forecast/components/ForecastCalendar";
import { ForecastTiles } from "@/features/forecast/components/ForecastTiles";
import { DailyBreakdown } from "@/features/forecast/components/DailyBreakdown";
import { DeadlineBanner } from "@/features/forecast/components/DeadlineBanner";
import { WeatherHero } from "@/features/forecast/components/WeatherHero";
import { WeekDetail } from "@/features/forecast/components/WeekDetail";
import { WeekOutlook } from "@/features/forecast/components/WeekOutlook";
import { examOf, nextCertificateExam } from "@/features/forecast/outlook";
import { formatDuration } from "@/features/forecast/weather";
import { usePlanCategories } from "@/features/plans/categories";
import { typeTagOf } from "@/features/plans/colors";
import { useIsDesktop } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";
import type { Plan, PlanCategory } from "@/types/database";

/**
 * S-08 부담 예보 (홈, 경로 /) — 담당: 프론트 B (feature/frontend-jw)
 * 10/28 날씨 앱처럼 개편: 맨 위 큰 날씨 카드(숫자 없이 말로) → 왜 바쁜지 → 16주 예보(숫자 없는 막대) → 요일별 할 공부 → 주차 상세(숫자) → 정보 칸.
 * PC 는 왼쪽에 이번 주, 오른쪽에 16주 예보와 주차 상세.
 * 데이터와 계산은 useForecastData() 하나로 끝나요. 여기서 다시 계산하지 마세요.
 */
type ForecastView = "list" | "calendar";
const VIEW_KEY = "hakgi:forecast-view";

/** 목록/달력 중 마지막에 고른 보기 (이 브라우저에만 기억, 못 읽으면 목록) */
function readView(): ForecastView {
  try {
    return localStorage.getItem(VIEW_KEY) === "calendar" ? "calendar" : "list";
  } catch {
    return "list";
  }
}

export default function HomePage() {
  const data = useForecastData();
  const isDesktop = useIsDesktop();
  const [picked, setPicked] = useState<number | null>(null);
  const [view, setViewState] = useState<ForecastView>(readView);
  /** PC 오른쪽 이번 주 카드: 요일별 할 공부 / 계획별 시간 (10/28 시안) */
  const [panel, setPanel] = useState<"daily" | "detail">("daily");
  const setView = (next: ForecastView) => {
    setViewState(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // 저장 못 해도 이번 화면에서는 바뀐 보기 그대로
    }
  };
  const categories = usePlanCategories().data ?? [];

  if (data.status === "loading") return <HomeSkeleton />;
  if (data.status === "error") return <HomeError onRetry={data.refetch} />;
  if (data.status === "needs-onboarding" || !data.profile || !data.forecast) return <Navigate to="/onboarding" replace />;

  const { profile, forecast, currentWeek, plans, deadlines, today } = data;
  const available = profile.available_hours ?? 0;
  const empty = data.status === "empty";
  // 학기 밖이면 개강 전은 1주차, 끝난 뒤는 16주차를 큰 카드에 보여 줘요
  const beforeStart = !!profile.semester_start && today < profile.semester_start;
  const heroWeek = currentWeek ?? (beforeStart ? 1 : forecast.weeks.length);
  const heroLabel = currentWeek ? "이번 주" : beforeStart ? "개강 첫 주" : "학기 마지막 주";
  const selectedWeek = picked ?? heroWeek;
  const selected = forecast.weeks[selectedWeek - 1];

  const myCerts = data.input?.userCertificates ?? [];
  const myCertIds = new Set(myCerts.map((u) => u.certificate_id));
  // 달력에 넣을 내 자격증 일정 (접수 시작·마감·시험일, 10/27)
  const certEvents = certificateEvents(data.certificates.filter((c) => myCertIds.has(c.id)));
  const deadline = upcomingDeadlines(myCerts, data.certificates, today, 365)[0];
  const semesterExam = [
    { label: "중간고사", week: profile.midterm_week },
    { label: "기말고사", week: profile.final_week },
  ].find((e): e is { label: string; week: number } => e.week !== null && e.week >= heroWeek);

  const select = (week: number) => {
    setPicked(week);
    // 휴대폰은 주차 상세가 한참 아래라 눌렀을 때 내려 줘요
    if (!isDesktop) requestAnimationFrame(() => document.getElementById("week-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const viewToggle = (
    <Button type="button" variant="outline" size="sm" onClick={() => setView(view === "calendar" ? "list" : "calendar")}>
      {view === "calendar" ? <List aria-hidden="true" /> : <CalendarDays aria-hidden="true" />}
      {view === "calendar" ? "목록으로 보기" : "달력으로 보기"}
    </Button>
  );

  const hero = (
    <WeatherHero
      key="hero"
      weeks={forecast.weeks}
      week={heroWeek}
      label={heroLabel}
      exam={examOf(heroWeek, profile.midterm_week, profile.final_week)}
    />
  );
  const busy = data.input ? <BusyExplain key="busy" input={data.input} fromWeek={currentWeek ?? 1} /> : null;
  const banner = <DeadlineBanner key="banner" deadlines={deadlines} semesterStart={profile.semester_start ?? ""} />;
  const outlook =
    view === "calendar" && profile.semester_start ? (
      <section key="outlook" aria-labelledby="calendar-title" className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="calendar-title" className="text-base font-semibold">
            날짜별 예보
          </h2>
          {viewToggle}
        </div>
        <ForecastCalendar
          forecast={forecast}
          input={data.input}
          semesterStart={profile.semester_start}
          midtermWeek={profile.midterm_week}
          finalWeek={profile.final_week}
          today={todayInKorea()}
          currentWeek={currentWeek}
          selectedWeek={selectedWeek}
          onSelectWeek={select}
          events={certEvents}
        />
      </section>
    ) : (
      <WeekOutlook
        key="outlook"
        weeks={forecast.weeks}
        availableHours={available}
        currentWeek={currentWeek}
        selectedWeek={selectedWeek}
        onSelect={select}
        midtermWeek={profile.midterm_week}
        finalWeek={profile.final_week}
        action={viewToggle}
      />
    );
  // 요일별 할 공부 (10/24 QA, 오늘 줄에서 바로 기록)
  const daily = (
    <section key="daily" className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <DailyBreakdown
        week={selectedWeek}
        days={data.input ? dailyForecast(data.input, selectedWeek) : null}
        today={today}
        logs={data.logs}
        categories={categories}
      />
    </section>
  );
  // 숫자(시간)는 여기서만: 고른 주의 계획별 시간 (FR-05-4)
  const detail = (
    <div key="detail" id="week-detail" className="scroll-mt-20">
      <WeekDetail
        week={selected}
        availableHours={available}
        midtermWeek={profile.midterm_week}
        finalWeek={profile.final_week}
        isCurrent={selectedWeek === currentWeek}
        categories={categories}
      />
    </div>
  );
  const tiles = (
    <ForecastTiles
      key="tiles"
      forecast={forecast}
      week={heroWeek}
      nextExam={nextCertificateExam(myCerts, data.certificates, today)}
      nextSemesterExam={semesterExam ?? null}
      nextDeadline={deadline ? { name: deadline.certificate.name, days: deadline.apply_dday } : null}
    />
  );
  const summary = <PlanSummary key="plans" plans={plans} categories={categories} />;
  // PC: 같은 주를 보여 주던 두 카드(요일별 할 공부·주차 상세)를 탭 하나로 (10/28 시안)
  const weekPanel = (
    <div key="week-panel" className="grid gap-2">
      <div role="tablist" aria-label={`${selectedWeek}주차 보기`} className="inline-flex justify-self-start rounded-lg bg-muted p-0.5">
        {(
          [
            ["daily", "요일별 할 공부"],
            ["detail", "계획별 시간"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={panel === value}
            onClick={() => setPanel(value)}
            className={cn(
              "h-8 rounded-md px-3 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring",
              panel === value ? "bg-card font-semibold text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {panel === "daily" ? daily : detail}
    </div>
  );

  if (empty) {
    return (
      <PageContainer>
        <EmptyHeadline />
        {banner}
        <EmptyActions />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {isDesktop ? (
        // 10/28 시안: 첫 줄 날씨 카드 + 정보 칸(2×2), 아래 16주 예보 | 이번 주(탭)·계획 — 두 칸 길이를 맞춤
        <div className="grid gap-4">
          <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-4">
            {hero}
            <ForecastTiles
              key="tiles"
              className="lg:grid-cols-2"
              forecast={forecast}
              week={heroWeek}
              nextExam={nextCertificateExam(myCerts, data.certificates, today)}
              nextSemesterExam={semesterExam ?? null}
              nextDeadline={deadline ? { name: deadline.certificate.name, days: deadline.apply_dday } : null}
            />
          </div>
          {busy}
          {banner}
          <div className="grid grid-cols-2 items-start gap-6">
            <div className="grid min-w-0 gap-4">{outlook}</div>
            <div className="grid min-w-0 gap-4">{[weekPanel, summary]}</div>
          </div>
        </div>
      ) : (
        <div className="grid min-w-0 gap-4">{[hero, busy, banner, outlook, daily, detail, tiles, summary]}</div>
      )}
    </PageContainer>
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
        <p className="border-t border-border/60 pt-2 text-sm text-muted-foreground">계획은 없고 자격증만 있어요.</p>
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
                {p.stopped_at ? "그만둠" : `${p.start_week}~${p.end_week}주, ${formatDuration(p.hours_per_week)}`}
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
