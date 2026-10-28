import { useState } from "react";
import { Link } from "react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { typeTagOf } from "@/features/plans/colors";
import { cn } from "@/lib/utils";
import type { PlanCategory, StudyLogRow } from "@/types/database";
import { WEEKDAY_LABELS, type DayForecast, type DayItem } from "../calc";
import { formatDuration } from "../weather";
import { LogControl } from "./LogControl";

type Props = {
  week: number;
  /** dailyForecast 결과. 요일별 가용 시간을 아직 안 정했으면 null */
  days: DayForecast[] | null;
  /** 오늘 (한국 날짜). 오늘 줄에서 바로 기록해요 */
  today: string;
  logs: StudyLogRow[];
  categories?: Pick<PlanCategory, "id" | "name">[];
};

const shortMonthDay = (date: string) => `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`;

const logOf = (logs: StudyLogRow[], date: string, item: DayItem) =>
  logs.find((l) => l.date === date && ((item.plan_id && l.plan_id === item.plan_id) || (item.certificate_id && l.certificate_id === item.certificate_id)));

/**
 * 요일별 부담 = 그날 해야 할 공부 시간 (10/27 개편). 예보 그래프 바로 아래에 둡니다.
 * 바쁜지(맑음·흐림·폭풍)는 주 단위로만 보고, 여기서는 날마다 몇 시간 해야 하는지만 보여 줘요 (쓸 수 있는 시간 세로선은 뺐어요).
 * 오늘 줄에서 [오늘 한 만큼 기록]을 누르면 바로 기록하고, 더 하거나 덜 한 만큼 같은 계획의 남은 날이 다시 계산돼요.
 * 다른 날 줄을 누르면 그날 할 일 화면(/day/:date)으로 가요.
 */
export function DailyBreakdown({ week, days, today, logs, categories = [] }: Props) {
  const [open, setOpen] = useState(false);

  if (!days) {
    return (
      <div className="grid gap-1 rounded-xl border border-dashed border-border p-4 text-sm">
        <p className="font-semibold">요일별 할 공부</p>
        <p className="text-muted-foreground">
          요일마다 쓸 수 있는 시간을 정하면 날마다 몇 시간 해야 하는지 보여 드려요.{" "}
          <Link to="/settings" className="font-semibold text-primary underline underline-offset-[3px]">
            설정에서 정하기
          </Link>
        </p>
      </div>
    );
  }

  const scale = Math.max(...days.map((d) => d.hours), 1) * 1.05;
  const todayDay = days.find((d) => d.date === today);
  const loggable = todayDay?.items.filter((i) => i.plan_id || i.certificate_id) ?? [];

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold">{week}주차 요일별 할 공부</h3>
        <p className="text-xs text-muted-foreground">그날 해야 할 공부 시간이에요 · 누르면 그날 할 일</p>
      </div>
      <ol aria-label={`${week}주차 요일별 할 공부 시간`}>
        {days.map((day) => {
          const label = WEEKDAY_LABELS[day.weekday];
          const isToday = day.date === today;
          const done = day.items.some((i) => i.logged);
          return (
            <li key={day.date} className={cn("border-t border-border/60", isToday && "rounded-lg border-t-0 bg-primary/5")}>
              <Link
                to={`/day/${day.date}`}
                aria-label={`${shortMonthDay(day.date)} ${label}요일${isToday ? "(오늘)" : ""}: ${formatDuration(day.hours)} 해야 해요. 할 일 보기`}
                className="grid grid-cols-[5.5rem_minmax(0,1fr)_auto_1rem] items-center gap-3 rounded-md px-2 py-2.5 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="whitespace-nowrap">
                  <span className={cn("text-sm font-semibold", day.weekday >= 5 && "text-primary")}>{label}</span>{" "}
                  <span className="text-xs text-muted-foreground tabular-nums">{shortMonthDay(day.date)}</span>
                  {isToday ? <span className="ml-1 rounded bg-primary px-1 py-px text-[11px] font-semibold text-primary-foreground">오늘</span> : null}
                </span>
                <span className="relative h-3 rounded-full bg-muted" aria-hidden="true">
                  <span
                    className={cn("absolute inset-y-0 left-0 rounded-full", day.date < today ? "bg-muted-foreground/40" : "bg-primary")}
                    style={{ width: `${Math.min(100, (day.hours / scale) * 100)}%` }}
                  />
                </span>
                <span className="text-right text-[13px] font-semibold whitespace-nowrap tabular-nums">
                  {day.hours > 0 ? formatDuration(day.hours) : "쉬는 날"}
                  {done ? <span className="ml-1 text-xs font-normal text-primary">기록함</span> : null}
                </span>
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
              </Link>

              {/* 10/27: 오늘 줄에서 바로 기록 */}
              {isToday && loggable.length > 0 ? (
                <div className="px-2 pb-2.5">
                  <Button type="button" variant="outline" size="sm" className="h-9" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
                    {open ? "기록 닫기" : "오늘 한 만큼 기록"}
                    <ChevronDown aria-hidden="true" className={cn("transition-transform", open && "rotate-180")} />
                  </Button>
                  {open ? (
                    <ul className="mt-2 grid gap-1 rounded-lg bg-card p-3">
                      {loggable.map((item, i) => {
                        const tag = typeTagOf(item, categories);
                        return (
                          <li key={`${item.plan_id ?? item.certificate_id}-${i}`} className="grid gap-1.5 border-t border-border/60 py-2.5 first:border-t-0 first:pt-0">
                            <div className="flex items-baseline justify-between gap-3">
                              <span className="flex min-w-0 items-center gap-1.5">
                                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} aria-hidden="true" />
                                <span className="truncate text-sm font-medium">{item.title}</span>
                              </span>
                              <span className="shrink-0 text-sm font-semibold tabular-nums">{formatDuration(item.hours)}</span>
                            </div>
                            <LogControl key={`${item.plan_id ?? item.certificate_id}-${day.date}`} item={item} date={day.date} future={false} log={logOf(logs, day.date, item)} />
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
      <p className="text-xs text-muted-foreground">계획보다 더 하면 같은 계획의 남은 날 공부가 그만큼 줄고, 다 끝낸 계획은 예보에서 빠져요.</p>
    </div>
  );
}
