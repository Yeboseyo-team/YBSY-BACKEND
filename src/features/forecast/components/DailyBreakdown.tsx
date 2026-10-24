import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { WEEKDAY_LABELS, type DayForecast } from "../calc";
import { formatDuration, WEATHER_STYLE } from "../weather";

type Props = {
  week: number;
  /** dailyForecast 결과. 요일별 가용 시간을 아직 안 정했으면 null */
  days: DayForecast[] | null;
};

const shortMonthDay = (date: string) => `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`;

/**
 * 고른 주의 요일별 가용 시간과 부담 (10/24 QA). 예보 그래프 바로 아래에 둡니다.
 * 요일을 세로로 나열하고 막대는 가로로 — 막대 = 예상 시간, 세로선 = 그날 쓸 수 있는 시간.
 * 줄을 누르면 그날 무엇에 몇 시간을 쓰는지 보는 화면(/day/:date)으로 가요.
 */
export function DailyBreakdown({ week, days }: Props) {
  if (!days) {
    return (
      <div className="grid gap-1 rounded-xl border border-dashed border-border p-4 text-sm">
        <p className="font-semibold">요일별 부담</p>
        <p className="text-muted-foreground">
          요일마다 쓸 수 있는 시간을 정하면 날마다 얼마나 바쁜지 보여 드려요.{" "}
          <Link to="/settings" className="font-semibold text-primary underline underline-offset-[3px]">
            설정에서 정하기
          </Link>
        </p>
      </div>
    );
  }

  const scale = Math.max(...days.map((d) => Math.max(d.hours, d.available)), 1) * 1.1;

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold">{week}주차 요일별 부담</h3>
        <p className="text-xs text-muted-foreground">막대 = 예상 시간 · 세로선 = 그날 쓸 수 있는 시간 · 누르면 할 일 보기</p>
      </div>
      <ol aria-label={`${week}주차 요일별 예상 시간과 가용 시간`}>
        {days.map((day) => {
          const style = WEATHER_STYLE[day.level];
          const label = WEEKDAY_LABELS[day.weekday];
          const pct = day.ratio === null ? null : Math.round(day.ratio * 100);
          return (
            <li key={day.date} className="border-t border-border/60">
              <Link
                to={`/day/${day.date}`}
                aria-label={`${shortMonthDay(day.date)} ${label}요일: 예상 ${formatDuration(day.hours)}, 가용 ${day.available}시간, ${style.label}. 할 일 보기`}
                className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-md px-1 py-2.5 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[5rem_minmax(0,1fr)_6rem_3.5rem_1rem]"
              >
                <span className="whitespace-nowrap">
                  <span className={cn("text-sm font-semibold", day.weekday >= 5 && "text-primary")}>{label}</span>{" "}
                  <span className="text-xs text-muted-foreground tabular-nums">{shortMonthDay(day.date)}</span>
                </span>

                <span className="relative h-3 rounded-full bg-muted" aria-hidden="true">
                  <span
                    className={cn("absolute inset-y-0 left-0 rounded-full", style.dot)}
                    style={{ width: `${Math.min(100, (day.hours / scale) * 100)}%` }}
                  />
                  <span className="absolute -inset-y-1 w-0.5 bg-ink" style={{ left: `${Math.min(100, (day.available / scale) * 100)}%` }} />
                </span>

                <span className="text-right text-[13px] whitespace-nowrap tabular-nums">
                  <span className="font-semibold">{formatDuration(day.hours)}</span>{" "}
                  <span className="text-muted-foreground">/ {day.available}시간</span>
                </span>

                <span className="hidden text-right sm:block">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", style.badge)}>
                    {pct === null ? style.label : `${pct}%`}
                  </span>
                </span>

                <ChevronRight className="hidden size-4 text-muted-foreground sm:block" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
