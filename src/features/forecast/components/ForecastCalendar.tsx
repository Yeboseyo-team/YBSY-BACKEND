import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { dailyForecast, TOTAL_WEEKS, WEEKDAY_LABELS, weekDates, weekdayIndex, type DayForecast, type Forecast, type ForecastInput } from "../calc";
import { formatDuration, WEATHER_STYLE } from "../weather";

type Props = {
  forecast: Forecast;
  /** 요일별 예보 계산용 (useForecastData 의 input) */
  input: ForecastInput | null;
  semesterStart: string;
  midtermWeek: number;
  finalWeek: number;
  today: string;
  selectedWeek: number;
  /** 이번 주 (주차 칸에 "이번" 표시) */
  currentWeek: number | null;
  /** 주차 칸을 누르면 오른쪽 주차 상세가 그 주로 바뀌어요 (가 버전, 10/24) */
  onSelectWeek: (week: number) => void;
};

const monthOf = (date: string) => date.slice(0, 7);
const dayNumber = (date: string) => Number(date.slice(8, 10));

/**
 * 예보 달력 보기 (10/24 QA). 한 줄 = 학기 한 주(개강일 요일부터 7일). 칸 색 = 그날 단계, 숫자 = 그날 예상 시간.
 * 요일별 가용 시간을 아직 안 정했으면 그 주 단계 색으로만 칠하고 안내를 띄워요.
 * 날짜를 누르면 하루 할 일(/day/:date), 왼쪽 주차를 누르면 오른쪽 주차 상세가 그 주로 바뀌어요.
 */
export function ForecastCalendar({ forecast, input, semesterStart, midtermWeek, finalWeek, today, currentWeek, selectedWeek, onSelectWeek }: Props) {
  // 학기 16주의 날짜와 요일별 예보 (요일별 시간이 없으면 days 는 null)
  const weeks = useMemo(
    () =>
      Array.from({ length: TOTAL_WEEKS }, (_, i) => {
        const week = i + 1;
        return { week, dates: weekDates(week, semesterStart), days: input ? dailyForecast(input, week) : null };
      }),
    [input, semesterStart],
  );
  const months = useMemo(() => [...new Set(weeks.flatMap((w) => w.dates.map(monthOf)))], [weeks]);
  const [month, setMonth] = useState(() => (months.includes(monthOf(today)) ? monthOf(today) : months[0]));
  const index = months.indexOf(month);
  const rows = weeks.filter((w) => w.dates.some((d) => monthOf(d) === month));
  const hasDaily = weeks.some((w) => w.days !== null);
  const [year, mon] = month.split("-").map(Number);
  // 한 줄의 첫 요일 = 개강일 요일 (월요일 개강이면 월~일)
  const headers = weekDates(1, semesterStart).map((d) => weekdayIndex(d));

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="이전 달"
          disabled={index <= 0}
          onClick={() => setMonth(months[index - 1])}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <h3 className="text-base font-semibold tabular-nums" aria-live="polite">
          {year}년 {mon}월
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="다음 달"
          disabled={index >= months.length - 1}
          onClick={() => setMonth(months[index + 1])}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>

      {!hasDaily ? (
        <p className="rounded-lg bg-muted/60 px-3 py-2 text-[13px] text-muted-foreground">
          지금은 주 단위 날씨로 칠했어요. 요일마다 쓸 수 있는 시간을 정하면 날마다 보여 드려요.{" "}
          <Link to="/settings" className="font-semibold text-primary underline underline-offset-[3px]">
            설정에서 정하기
          </Link>
        </p>
      ) : null}

      <div role="grid" aria-label={`${year}년 ${mon}월 예보 달력`} className="grid gap-1.5">
        <div role="row" className="grid grid-cols-[2.25rem_repeat(7,minmax(0,1fr))] gap-1 sm:grid-cols-[2.75rem_repeat(7,minmax(0,1fr))]">
          <span role="columnheader" className="text-center text-xs text-muted-foreground">
            주차
          </span>
          {headers.map((w) => (
            <span role="columnheader" key={w} className={cn("text-center text-xs", w >= 5 ? "text-primary" : "text-muted-foreground")}>
              {WEEKDAY_LABELS[w]}
            </span>
          ))}
        </div>

        {rows.map(({ week, dates, days }) => {
          const weekForecast = forecast.weeks[week - 1];
          const exam = week === midtermWeek ? "중간" : week === finalWeek ? "기말" : null;
          const selected = week === selectedWeek;
          return (
            <div role="row" key={week} className="grid grid-cols-[2.25rem_repeat(7,minmax(0,1fr))] gap-1 sm:grid-cols-[2.75rem_repeat(7,minmax(0,1fr))]">
              <button
                type="button"
                role="rowheader"
                aria-pressed={selected}
                aria-label={`${week}주차${exam ? ` ${exam}고사` : ""} 상세 보기`}
                onClick={() => onSelectWeek(week)}
                className={cn(
                  "grid content-center justify-items-center rounded-md text-xs leading-tight outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected ? "bg-primary/10 font-semibold text-primary" : "hover:bg-muted",
                )}
              >
                <span className={cn(!selected && "font-semibold text-foreground")}>{week}주</span>
                {exam ? <span className="text-[10px] text-storm">{exam}</span> : null}
                {week === currentWeek ? <span className="text-[10px] text-muted-foreground">이번</span> : null}
              </button>
              {dates.map((date, i) => (
                <DayCell
                  key={date}
                  date={date}
                  day={days?.[i] ?? null}
                  weekLevel={weekForecast.level}
                  dim={monthOf(date) !== month}
                  isToday={date === today}
                  selectedWeek={selected}
                />
              ))}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        {hasDaily ? "칸 숫자 = 그날 예상 시간 · " : ""}날짜를 누르면 하루 할 일 · 주차를 누르면 그 주 내역
      </p>
    </div>
  );
}

function DayCell({
  date,
  day,
  weekLevel,
  dim,
  isToday,
  selectedWeek,
}: {
  date: string;
  day: DayForecast | null;
  weekLevel: DayForecast["level"];
  dim: boolean;
  isToday: boolean;
  selectedWeek: boolean;
}) {
  // 맑음·흐림·폭풍은 주 단위로만 (10/27) — 날짜 칸은 그 주 색, 숫자는 그날 할 공부 시간
  const style = WEATHER_STYLE[weekLevel];
  const [, m, d] = date.split("-").map(Number);
  const label = day
    ? `${m}월 ${d}일, 그 주 ${style.label}, 할 공부 ${formatDuration(day.hours)}. 하루 할 일 보기`
    : `${m}월 ${d}일, 그 주 ${style.label}. 하루 할 일 보기`;
  return (
    <Link
      role="gridcell"
      to={`/day/${date}`}
      aria-label={label}
      className={cn(
        "flex min-h-16 flex-col justify-between rounded-md px-1.5 py-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring sm:min-h-24 sm:px-2 sm:py-2",
        style.badge,
        "hover:brightness-95",
        dim && "opacity-40",
        selectedWeek && "ring-1 ring-primary/50",
        isToday && "ring-2 ring-ink",
      )}
    >
      <span className="text-xs font-semibold tabular-nums sm:text-sm">
        {dayNumber(date)}
        {isToday ? <span className="ml-1 hidden text-[10px] font-medium sm:inline">오늘</span> : null}
      </span>
      {day ? (
        <>
          <span className="hidden text-right text-xs leading-tight font-medium tabular-nums sm:block">{formatDuration(day.hours)}</span>
          {/* 휴대폰은 칸이 좁아 시간 단위로 반올림 */}
          <span className="text-right text-[10px] leading-tight font-medium tabular-nums sm:hidden">{Math.round(day.hours)}시간</span>
        </>
      ) : null}
    </Link>
  );
}
