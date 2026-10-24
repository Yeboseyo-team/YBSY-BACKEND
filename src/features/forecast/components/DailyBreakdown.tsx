import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { WEEKDAY_LABELS, type DayForecast } from "../calc";
import { formatHours, WEATHER_STYLE } from "../weather";

type Props = {
  week: number;
  /** dailyForecast 결과. 요일별 가용 시간을 아직 안 정했으면 null */
  days: DayForecast[] | null;
};

const md = (date: string) => `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`;

/** 고른 주의 요일별 가용 시간과 부담 (10/24 QA). 예보 그래프 바로 아래에 둡니다. */
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

  const scale = Math.max(...days.map((d) => Math.max(d.hours, d.available)), 1);

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold">{week}주차 요일별 부담</h3>
        <p className="text-xs text-muted-foreground">막대 = 예상 시간, 선 = 그날 쓸 수 있는 시간</p>
      </div>
      <ol className="grid grid-cols-7 gap-1.5 sm:gap-2" aria-label={`${week}주차 요일별 예상 시간과 가용 시간`}>
        {days.map((day) => {
          const style = WEATHER_STYLE[day.level];
          const label = WEEKDAY_LABELS[day.weekday];
          const pct = day.ratio === null ? null : Math.round(day.ratio * 100);
          return (
            <li
              key={day.date}
              className="grid justify-items-center gap-1.5 rounded-lg bg-muted/40 px-1 py-2 text-center"
              aria-label={`${md(day.date)} ${label}요일: 예상 ${formatHours(day.hours)}시간, 가용 ${day.available}시간, ${style.label}`}
            >
              <span className={cn("text-xs font-semibold", day.weekday >= 5 && "text-primary")}>{label}</span>
              <span className="text-[11px] text-muted-foreground tabular-nums">{md(day.date)}</span>
              <span className="relative h-16 w-3 rounded-full bg-muted" aria-hidden="true">
                <span
                  className={cn("absolute inset-x-0 bottom-0 rounded-full", style.dot)}
                  style={{ height: `${Math.min(100, (day.hours / scale) * 100)}%` }}
                />
                <span
                  className="absolute -inset-x-1 h-0.5 bg-ink"
                  style={{ bottom: `${Math.min(100, (day.available / scale) * 100)}%` }}
                />
              </span>
              <span className="text-xs font-semibold tabular-nums">{formatHours(day.hours)}h</span>
              <span className="text-[11px] text-muted-foreground tabular-nums">/ {day.available}h</span>
              <span className={cn("rounded-full px-1.5 py-px text-[10px] font-semibold", style.badge)}>
                {pct === null ? style.label : `${pct}%`}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
