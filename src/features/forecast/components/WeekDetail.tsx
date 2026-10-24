import { cn } from "@/lib/utils";
import { typeTagOf } from "@/features/plans/colors";
import { PRIORITY_LABEL } from "@/features/plans/defaults";
import type { PlanCategory } from "@/types/database";
import { trimSuggestions, type WeekForecast } from "../calc";
import { formatDuration, WEATHER_STYLE } from "../weather";

type Props = {
  week: WeekForecast;
  availableHours: number;
  midtermWeek: number | null;
  finalWeek: number | null;
  isCurrent: boolean;
  /** 내 유형 (색·이름 구분용, 10/24 QA) */
  categories?: PlanCategory[];
};

/** 고른 주의 구성 내역 (FR-05-4): 계획별 시간, 시험 가중치 적용 여부 */
export function WeekDetail({ week, availableHours, midtermWeek, finalWeek, isCurrent, categories = [] }: Props) {
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
          {formatDuration(week.total_hours)}
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
          {week.items.map((item, i) => {
            const tag = typeTagOf(item, categories);
            return (
            <li key={`${item.source}-${item.title}-${i}`} className="flex justify-between gap-3 border-t border-border/60 py-2.5">
              <span className="flex min-w-0 flex-wrap items-center gap-x-1.5">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} aria-hidden="true" />
                {item.title}
                <span className="text-xs font-semibold" style={{ color: tag.color }}>
                  {tag.label}
                </span>
                {item.weighted ? <span className="ml-1.5 text-xs text-[#9a5b00]">시험 ×1.5</span> : null}
                {item.priority && item.priority !== "normal" ? (
                  <span className="ml-1.5 text-xs text-muted-foreground">{PRIORITY_LABEL[item.priority]}</span>
                ) : null}
              </span>
              <span className="shrink-0 font-semibold tabular-nums">{formatDuration(item.hours)}</span>
            </li>
            );
          })}
        </ul>
      )}

      {week.level === "storm" ? <TrimAdvice week={week} /> : null}
    </section>
  );
}

/** 폭풍 주: 우선순위 낮은 계획부터 줄여 보라고 안내 (10/24 QA) */
function TrimAdvice({ week }: { week: WeekForecast }) {
  const candidates = trimSuggestions(week).slice(0, 3);
  if (candidates.length === 0) return null;
  return (
    <div className="rounded-lg bg-storm/5 p-3 text-[13px] leading-relaxed">
      <p className="font-semibold">이번 주는 이 계획부터 줄여 보세요</p>
      <ul className="mt-1 text-muted-foreground">
        {candidates.map((item, i) => (
          <li key={`${item.title}-${i}`}>
            {item.title} · {formatDuration(item.hours)}
            {item.priority === "low" ? " (우선순위 낮음)" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
