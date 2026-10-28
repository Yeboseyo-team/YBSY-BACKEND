import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TOTAL_WEEKS, type WeekForecast } from "../calc";
import { ForecastChart } from "./ForecastChart";

/** 한 번에 보여 줄 주 수 (10/26 피드백: 16주를 한꺼번에 보여 주지 말고 나눠서, 10/27: 4주씩 1~4·5~8·9~12·13~16 으로 끊기) */
export const WINDOW_WEEKS = 4;

type Props = {
  weeks: WeekForecast[];
  availableHours: number;
  currentWeek: number | null;
  selectedWeek: number;
  onSelect: (week: number) => void;
};

/** 이번 주가 두 번째 칸에 오도록 (지난주 1주 + 이번 주 + 앞으로 4주) */
const firstWeekAround = (week: number) => Math.floor((Math.min(Math.max(1, week), TOTAL_WEEKS) - 1) / WINDOW_WEEKS) * WINDOW_WEEKS + 1;

/**
 * 예보 막대그래프를 4주씩 끊어 보여 줘요 (10/26, 10/27 6주 → 4주). ◀ ▶ 로 넘기고, [학기 전체]로 16주를 한 번에 볼 수도 있어요.
 * 막대 계산·그리기는 ForecastChart 그대로예요.
 */
export function WindowedForecastChart({ weeks, availableHours, currentWeek, selectedWeek, onSelect }: Props) {
  // 10/28: PC·휴대폰 모두 학기 전체(16주)가 기본. [4주씩 보기]로 이번 주가 든 4주만
  const [whole, setWhole] = useState(true);
  const [first, setFirst] = useState(() => firstWeekAround(currentWeek ?? selectedWeek));
  const last = Math.min(TOTAL_WEEKS, first + WINDOW_WEEKS - 1);
  const shown = whole ? weeks : weeks.slice(first - 1, last);
  const move = (by: number) => setFirst((f) => Math.min(Math.max(1, f + by), TOTAL_WEEKS - WINDOW_WEEKS + 1));

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {whole ? (
          <p className="text-sm font-semibold">1~{TOTAL_WEEKS}주차 전체</p>
        ) : (
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon" aria-label="앞 주들 보기" disabled={first <= 1} onClick={() => move(-WINDOW_WEEKS)}>
              <ChevronLeft aria-hidden="true" />
            </Button>
            <p className="min-w-24 text-center text-sm font-semibold tabular-nums" aria-live="polite">
              {first}~{last}주차
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="뒤 주들 보기"
              disabled={last >= TOTAL_WEEKS}
              onClick={() => move(WINDOW_WEEKS)}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
            {currentWeek && (currentWeek < first || currentWeek > last) ? (
              <Button type="button" variant="outline" size="sm" onClick={() => setFirst(firstWeekAround(currentWeek))}>
                이번 주로
              </Button>
            ) : null}
          </div>
        )}
        <Button type="button" variant="ghost" size="sm" aria-pressed={whole} onClick={() => setWhole((w) => !w)}>
          {whole ? `${WINDOW_WEEKS}주씩 보기` : "학기 전체"}
        </Button>
      </div>

      <ForecastChart
        weeks={shown}
        availableHours={availableHours}
        currentWeek={currentWeek}
        selectedWeek={selectedWeek}
        onSelect={onSelect}
      />
    </div>
  );
}
