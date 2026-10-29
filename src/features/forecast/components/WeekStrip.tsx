import { useState } from "react";
import { Link } from "react-router";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { typeTagOf } from "@/features/plans/colors";
import { cn } from "@/lib/utils";
import type { PlanCategory, StudyLogRow } from "@/types/database";
import { WEEKDAY_LABELS, type DayForecast, type DayItem } from "../calc";
import { formatDuration } from "../weather";
import { LogControl } from "./LogControl";

type Props = {
  week: number;
  /** dailyForecast 결과. 요일별 쓸 수 있는 시간을 아직 안 정했으면 null */
  days: DayForecast[] | null;
  today: string;
  logs: StudyLogRow[];
  categories?: Pick<PlanCategory, "id" | "name">[];
};

const shortMonthDay = (date: string) => `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`;

const logOf = (logs: StudyLogRow[], date: string, item: DayItem) =>
  logs.find((l) => l.date === date && ((item.plan_id && l.plan_id === item.plan_id) || (item.certificate_id && l.certificate_id === item.certificate_id)));

/**
 * PC 요일별 할 공부 (10/29 시안) — 한 주 7일을 한 박스에 가로로. 칸마다 그날 해야 할 공부 시간과 막대,
 * 누르면 그날 할 일(/day/:date). 오늘 칸 아래 [오늘 한 만큼 기록]으로 바로 기록해요 (휴대폰은 DailyBreakdown 세로 목록).
 */
export function WeekStrip({ week, days, today, logs, categories = [] }: Props) {
  const [open, setOpen] = useState(false);

  if (!days) {
    return (
      <section className="grid gap-1 rounded-2xl border border-dashed border-border bg-card p-5 text-sm">
        <p className="font-semibold">{week}주차 요일별 할 공부</p>
        <p className="text-muted-foreground">
          요일마다 쓸 수 있는 시간을 정하면 날마다 몇 시간 해야 하는지 보여 드려요.{" "}
          <Link to="/settings" className="font-semibold text-primary underline underline-offset-[3px]">
            설정에서 정하기
          </Link>
        </p>
      </section>
    );
  }

  const scale = Math.max(...days.map((d) => d.hours), 1);
  const todayDay = days.find((d) => d.date === today);
  const loggable = todayDay?.items.filter((i) => i.plan_id || i.certificate_id) ?? [];
  const total = days.reduce((s, d) => s + d.hours, 0);

  return (
    <section aria-labelledby="week-strip-title" className="grid gap-3 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="week-strip-title" className="text-base font-semibold">
          {week}주차 요일별 할 공부 <span className="text-sm font-normal text-muted-foreground">· 한 주 {formatDuration(total)}</span>
        </h2>
        <p className="text-xs text-muted-foreground">그날 해야 할 공부 시간이에요 · 누르면 그날 할 일</p>
      </div>

      <ol aria-label={`${week}주차 요일별 할 공부 시간`} className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const label = WEEKDAY_LABELS[day.weekday];
          const isToday = day.date === today;
          const past = day.date < today;
          const done = day.items.some((i) => i.logged);
          return (
            <li key={day.date}>
              <Link
                to={`/day/${day.date}`}
                aria-label={`${shortMonthDay(day.date)} ${label}요일${isToday ? "(오늘)" : ""}: ${formatDuration(day.hours)} 해야 해요. 할 일 보기`}
                className={cn(
                  "grid h-full gap-2 rounded-xl border p-3 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring",
                  isToday ? "border-primary bg-primary/5" : "border-border",
                  past && !isToday && "opacity-60",
                )}
              >
                <span className="flex items-baseline justify-between gap-1">
                  <span className={cn("text-sm font-semibold", day.weekday >= 5 && "text-primary")}>{label}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{shortMonthDay(day.date)}</span>
                </span>
                {/* 세로 막대: 그 주에서 가장 많은 날 = 가득 */}
                <span className="relative h-16 rounded-lg bg-muted" aria-hidden="true">
                  <span
                    className={cn("absolute inset-x-0 bottom-0 rounded-lg", past ? "bg-muted-foreground/40" : "bg-primary")}
                    style={{ height: `${Math.min(100, (day.hours / scale) * 100)}%` }}
                  />
                </span>
                <span className="text-center text-[13px] leading-tight font-semibold tabular-nums">
                  {day.hours > 0 ? formatDuration(day.hours) : "쉬는 날"}
                </span>
                <span className="h-4 text-center text-[11px] leading-4">
                  {isToday ? (
                    <span className="rounded bg-primary px-1.5 py-px font-semibold text-primary-foreground">오늘</span>
                  ) : done ? (
                    <span className="text-primary">기록함</span>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      {/* 오늘 한 만큼 바로 기록 */}
      {loggable.length > 0 && todayDay ? (
        <div className="grid gap-2">
          <Button type="button" variant="outline" size="sm" className="h-9 justify-self-start" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? "기록 닫기" : "오늘 한 만큼 기록"}
            <ChevronDown aria-hidden="true" className={cn("transition-transform", open && "rotate-180")} />
          </Button>
          {open ? (
            <ul className="grid gap-x-6 gap-y-1 rounded-lg bg-muted/40 p-3 sm:grid-cols-2">
              {loggable.map((item, i) => {
                const tag = typeTagOf(item, categories);
                return (
                  <li key={`${item.plan_id ?? item.certificate_id}-${i}`} className="grid gap-1.5 py-2">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} aria-hidden="true" />
                        <span className="truncate text-sm font-medium">{item.title}</span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums">{formatDuration(item.hours)}</span>
                    </div>
                    <LogControl key={`${item.plan_id ?? item.certificate_id}-${todayDay.date}`} item={item} date={todayDay.date} future={false} log={logOf(logs, todayDay.date, item)} />
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
