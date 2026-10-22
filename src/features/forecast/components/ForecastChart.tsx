import { useSyncExternalStore } from "react";
import { Bar, BarChart, Cell, LabelList, ReferenceLine, ResponsiveContainer, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import type { WeekForecast } from "../calc";
import { formatHours, WEATHER_STYLE } from "../weather";

type Props = {
  weeks: WeekForecast[];
  /** 가용 시간 → 점선 (FR-05-1) */
  availableHours: number;
  /** 이번 주 (FR-05-5) */
  currentWeek: number | null;
  selectedWeek: number;
  onSelect: (week: number) => void;
};

const WIDE_QUERY = "(min-width: 640px)";
const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(WIDE_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

/** 16주 막대그래프 (S-08, F-05). 막대나 아래 주차 버튼을 누르면 그 주가 선택돼요 (FR-05-4). */
export function ForecastChart({ weeks, availableHours, currentWeek, selectedWeek, onSelect }: Props) {
  // 휴대폰 폭에서는 막대 위 숫자를 빼서 겹치지 않게 (숫자는 주차 상세에서 보여요)
  const wide = useSyncExternalStore(subscribe, () => window.matchMedia(WIDE_QUERY).matches);
  const maxHours = Math.max(availableHours, ...weeks.map((w) => w.total_hours));

  return (
    <div className="grid gap-2">
      <div className="h-[240px] sm:h-[300px]" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeks} margin={{ top: 20, right: 0, bottom: 0, left: 0 }} barCategoryGap="18%" accessibilityLayer={false}>
            <YAxis hide domain={[0, Math.ceil(maxHours * 1.08)]} />
            <Bar
              dataKey="total_hours"
              radius={[6, 6, 2, 2]}
              isAnimationActive={false}
              cursor="pointer"
              onClick={(_, index) => onSelect(weeks[index].week)}
            >
              {weeks.map((w) => (
                <Cell
                  key={w.week}
                  className={cn(
                    WEATHER_STYLE[w.level].fill,
                    w.week === selectedWeek ? "stroke-ink" : "stroke-transparent",
                  )}
                  strokeWidth={2}
                />
              ))}
              {wide ? (
                <LabelList
                  dataKey="total_hours"
                  position="top"
                  formatter={(value: unknown) => (typeof value === "number" && value > 0 ? formatHours(value) : "")}
                  className="fill-muted-foreground text-xs tabular-nums"
                />
              ) : null}
            </Bar>
            <ReferenceLine y={availableHours} className="[&_line]:stroke-ink" strokeDasharray="5 4" strokeWidth={1.5} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 주차 버튼: 키보드·화면 낭독기·휴대폰 탭으로도 주를 고를 수 있게 */}
      <div className="grid grid-cols-16" role="group" aria-label="주차 선택">
        {weeks.map((w) => {
          const isCurrent = w.week === currentWeek;
          const isSelected = w.week === selectedWeek;
          return (
            <button
              key={w.week}
              type="button"
              onClick={() => onSelect(w.week)}
              aria-pressed={isSelected}
              aria-label={`${w.week}주차 ${WEATHER_STYLE[w.level].label} ${formatHours(w.total_hours)}시간${isCurrent ? ", 이번 주" : ""}`}
              className={cn(
                "mx-auto flex h-7 min-w-0 items-center justify-center rounded-full px-0.5 text-[11px] tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-2 sm:text-xs",
                isCurrent ? "bg-ink font-bold text-white" : "text-muted-foreground hover:bg-muted",
                isSelected && !isCurrent && "bg-muted font-bold text-foreground",
              )}
            >
              {w.week}
              <span className="hidden sm:inline">주</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
