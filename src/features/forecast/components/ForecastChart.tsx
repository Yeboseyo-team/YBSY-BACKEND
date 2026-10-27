import { useSyncExternalStore } from "react";
import { Bar, BarChart, Cell, LabelList, ReferenceLine, ResponsiveContainer, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { weekAchievement, type WeekForecast } from "../calc";
import { formatDuration, WEATHER_STYLE } from "../weather";

type Props = {
  weeks: WeekForecast[];
  /** 쓸 수 있는 시간 — 달성률 계산에 써요 */
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

/**
 * 주차 막대그래프 (S-08, F-05). 10/27 피드백: 막대 높이는 시간 대신 "그 주 계획을 몇 % 해낼 수 있는지"(달성률, 최대 100%).
 * 색은 지금처럼 맑음·흐림·폭풍이라, 100% 인 주끼리도 여유(맑음)·꽉 참(흐림)이 구분돼요. 시간은 아래 주 상세에서 보여요.
 */
export function ForecastChart({ weeks, availableHours, currentWeek, selectedWeek, onSelect }: Props) {
  // 휴대폰 폭에서 16주를 다 그릴 때는 막대 위 숫자를 빼서 겹치지 않게. 4주씩 볼 때는 자리가 넉넉해서 보여 줘요 (10/26 UI 점검)
  const wide = useSyncExternalStore(subscribe, () => window.matchMedia(WIDE_QUERY).matches);
  // 할 일이 없는 주는 막대 없이 (100% 로 꽉 채우면 계획이 있는 것처럼 보여요)
  const data = weeks.map((w) => ({ ...w, rate: w.total_hours > 0 ? Math.round(weekAchievement(w, availableHours) * 100) : null }));

  return (
    <div className="grid gap-2">
      <div className="h-[240px] sm:h-[300px]" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 0, bottom: 0, left: 0 }} barCategoryGap="18%" accessibilityLayer={false}>
            <YAxis hide domain={[0, 100]} />
            <Bar
              dataKey="rate"
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
              {wide || weeks.length <= 8 ? (
                <LabelList
                  dataKey="rate"
                  position="top"
                  formatter={(value: unknown) => (typeof value === "number" ? `${value}%` : "")}
                  className="fill-muted-foreground text-xs tabular-nums"
                />
              ) : null}
            </Bar>
            {/* 100% = 그 주 계획을 다 할 수 있음 */}
            <ReferenceLine y={100} className="[&_line]:stroke-ink/40" strokeDasharray="5 4" strokeWidth={1} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 주차 버튼: 키보드·화면 낭독기·휴대폰 탭으로도 주를 고를 수 있게 */}
      <div className="grid" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }} role="group" aria-label="주차 선택">
        {weeks.map((w) => {
          const isCurrent = w.week === currentWeek;
          const isSelected = w.week === selectedWeek;
          return (
            <button
              key={w.week}
              type="button"
              onClick={() => onSelect(w.week)}
              aria-pressed={isSelected}
              aria-label={`${w.week}주차 ${WEATHER_STYLE[w.level].label} 달성률 ${Math.round(weekAchievement(w, availableHours) * 100)}% (필요 ${formatDuration(w.total_hours)})${isCurrent ? ", 이번 주" : ""}`}
              className={cn(
                // 칸 너비를 다 써서 누르기 쉽게 (10/26 UI 점검: 휴대폰에서 폭 11px 이었음)
                "mx-auto flex h-9 w-full max-w-16 min-w-0 items-center justify-center rounded-full px-0.5 text-xs tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-2",
                isCurrent ? "bg-ink font-bold text-white" : "text-muted-foreground hover:bg-muted",
                isSelected && !isCurrent && "bg-muted font-bold text-foreground",
              )}
            >
              {w.week}
              {/* 16주를 다 그릴 때는 칸이 좁아 "주"를 빼요 (온보딩 2단계 오른쪽 칸에서 겹쳤음) */}
              <span className={weeks.length > 8 ? "hidden" : "hidden sm:inline"}>주</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
