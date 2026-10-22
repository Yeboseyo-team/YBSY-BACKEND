import { cn } from "@/lib/utils";
import type { WeekForecast } from "../calc";
import { formatHours, WEATHER_STYLE } from "../weather";

type Props = {
  week: WeekForecast;
  availableHours: number;
  midtermWeek: number | null;
  finalWeek: number | null;
  isCurrent: boolean;
};

/** 고른 주의 구성 내역 (FR-05-4): 계획별 시간, 시험 가중치 적용 여부 */
export function WeekDetail({ week, availableHours, midtermWeek, finalWeek, isCurrent }: Props) {
  const style = WEATHER_STYLE[week.level];
  const scale = Math.max(week.total_hours, availableHours, 1);
  const examLabel = week.week === midtermWeek ? " 중간고사 주간" : week.week === finalWeek ? " 기말고사 주간" : "";

  return (
    <section aria-live="polite" className="grid gap-3 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold">
          {week.week}주차{examLabel}
          {isCurrent ? <span className="ml-2 text-xs font-medium text-muted-foreground">이번 주</span> : null}
        </h2>
        <span className={cn("text-[26px] font-bold tracking-tight tabular-nums", style.text)}>
          {formatHours(week.total_hours)}
          <span className="ml-0.5 text-sm font-medium">시간</span>
        </span>
      </div>

      <div className="relative h-2 rounded bg-muted" aria-hidden="true">
        <div className={cn("absolute inset-y-0 left-0 rounded", style.dot)} style={{ width: `${(week.total_hours / scale) * 100}%` }} />
        <div className="absolute -inset-y-[3px] w-0.5 bg-ink" style={{ left: `${(availableHours / scale) * 100}%` }} />
      </div>
      <p className="text-[13px] text-muted-foreground">
        <span className={cn("mr-2 rounded-full px-2 py-0.5 text-xs font-semibold", style.badge)}>{style.label}</span>
        가용 {availableHours}시간 대비 {Math.round(week.ratio * 100)}%
      </p>

      {week.items.length === 0 ? (
        <p className="border-t border-border/60 pt-3 text-sm text-muted-foreground">이 주에는 잡힌 계획이 없어요.</p>
      ) : (
        <ul className="text-sm">
          {week.items.map((item, i) => (
            <li key={`${item.source}-${item.title}-${i}`} className="flex justify-between gap-3 border-t border-border/60 py-2.5">
              <span className="min-w-0">
                {item.title}
                {item.weighted ? <span className="ml-1.5 text-xs text-[#9a5b00]">시험 ×1.5</span> : null}
              </span>
              <span className="shrink-0 font-semibold tabular-nums">{formatHours(item.hours)}시간</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
