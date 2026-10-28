import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addDays, dailyForecast, TOTAL_WEEKS, WEEKDAY_LABELS, weekDates, weekdayIndex, weekOf, type DayForecast, type Forecast, type ForecastInput } from "../calc";
import { CERT_EVENT_LABEL, CERT_EVENT_SHORT, monthsBetween, type CertEvent, type CertEventKind } from "../calendar-events";
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
  /** 고른 자격증의 접수 시작·접수 마감·시험일 (10/27: 일반 캘린더처럼 칸에 표시) */
  events?: CertEvent[];
};

/** 자격증 일정 표시 색 — 시험은 자격증 색(보라), 접수 마감은 빨강, 접수 시작은 파랑 */
const EVENT_STYLE: Record<CertEventKind, { chip: string; dot: string }> = {
  exam: { chip: "bg-[#7c3aed] text-white", dot: "bg-[#7c3aed]" },
  apply_end: { chip: "bg-card text-storm ring-1 ring-storm/40", dot: "bg-storm" },
  apply_start: { chip: "bg-card text-primary ring-1 ring-primary/30", dot: "bg-primary" },
};

/** "2026-10" → 그 달 마지막 날 "2026-10-31" */
function lastDayOf(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
  return addDays(next, -1);
}

const monthOf = (date: string) => date.slice(0, 7);
const dayNumber = (date: string) => Number(date.slice(8, 10));

/**
 * 예보 달력 보기 (10/24 QA). 한 줄 = 학기 한 주(개강일 요일부터 7일). 칸 색 = 그날 단계, 숫자 = 그날 예상 시간.
 * 요일별 가용 시간을 아직 안 정했으면 그 주 단계 색으로만 칠하고 안내를 띄워요.
 * 날짜를 누르면 하루 할 일(/day/:date), 왼쪽 주차를 누르면 오른쪽 주차 상세가 그 주로 바뀌어요.
 */
export function ForecastCalendar({ forecast, input, semesterStart, midtermWeek, finalWeek, today, currentWeek, selectedWeek, onSelectWeek, events = [] }: Props) {
  // 학기 16주의 요일별 예보 (요일별 시간이 없으면 null)
  const daily = useMemo(() => Array.from({ length: TOTAL_WEEKS }, (_, i) => (input ? dailyForecast(input, i + 1) : null)), [input]);
  // 학기 달 + 자격증 일정이 있는 달까지 (10/27: 학기 뒤 1월 시험도 볼 수 있게, 사이 달은 빠짐없이)
  const months = useMemo(() => {
    const all = [monthOf(semesterStart), monthOf(addDays(semesterStart, TOTAL_WEEKS * 7 - 1)), ...events.map((e) => monthOf(e.date))].sort();
    return monthsBetween(all[0], all[all.length - 1]);
  }, [semesterStart, events]);
  const [month, setMonth] = useState(() => (months.includes(monthOf(today)) ? monthOf(today) : months[0]));
  const index = months.indexOf(month);
  // 그 달을 덮는 줄 (학기 주 단위, 개강일 요일부터 7일). 학기 밖 주는 날씨 없이 날짜·일정만
  const firstWeek = weekOf(`${month}-01`, semesterStart);
  const rows = Array.from({ length: weekOf(lastDayOf(month), semesterStart) - firstWeek + 1 }, (_, i) => {
    const week = firstWeek + i;
    const inSemester = week >= 1 && week <= TOTAL_WEEKS;
    return { week, inSemester, dates: weekDates(week, semesterStart), days: inSemester ? daily[week - 1] : null };
  });
  const hasDaily = daily.some((d) => d !== null);
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CertEvent[]>();
    for (const e of events) map.set(e.date, [...(map.get(e.date) ?? []), e]);
    return map;
  }, [events]);
  const monthEvents = events.filter((e) => monthOf(e.date) === month);
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

        {rows.map(({ week, inSemester, dates, days }) => {
          const weekForecast = inSemester ? forecast.weeks[week - 1] : null;
          const exam = week === midtermWeek ? "중간" : week === finalWeek ? "기말" : null;
          const selected = week === selectedWeek;
          return (
            <div role="row" key={week} className="grid grid-cols-[2.25rem_repeat(7,minmax(0,1fr))] gap-1 sm:grid-cols-[2.75rem_repeat(7,minmax(0,1fr))]">
              {!inSemester ? (
                <span role="rowheader" aria-label="학기 밖" className="grid content-center justify-items-center text-xs text-muted-foreground">
                  -
                </span>
              ) : (
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
              )}
              {dates.map((date, i) => (
                <DayCell
                  key={date}
                  date={date}
                  day={days?.[i] ?? null}
                  weekLevel={weekForecast?.level ?? null}
                  events={eventsByDate.get(date) ?? []}
                  dim={monthOf(date) !== month}
                  isToday={date === today}
                  selectedWeek={selected}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* 이달 자격증 일정 목록 (휴대폰은 칸이 좁아 이름 대신 점만 보여서 여기서 다 보여요) */}
      {monthEvents.length > 0 ? (
        <section aria-label={`${mon}월 자격증 일정`} className="grid gap-1.5 rounded-lg border border-border p-3">
          <h4 className="text-[13px] font-semibold">{mon}월 자격증 일정</h4>
          <ul className="grid gap-1 text-[13px]">
            {monthEvents.map((e) => (
              <li key={`${e.date}-${e.kind}-${e.name}-${e.round}`} className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-muted-foreground tabular-nums">
                  {Number(e.date.slice(5, 7))}/{dayNumber(e.date)}
                </span>
                <span className={cn("size-2 shrink-0 rounded-full", EVENT_STYLE[e.kind].dot)} aria-hidden="true" />
                <span className="min-w-0 truncate">
                  <span className="font-medium">{e.name}</span> {e.round} {CERT_EVENT_LABEL[e.kind]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{hasDaily ? "칸 숫자 = 그날 예상 시간 · " : ""}날짜를 누르면 하루 할 일 · 주차를 누르면 그 주 내역</span>
        {events.length > 0
          ? (["exam", "apply_end", "apply_start"] as const).map((k) => (
              <span key={k} className="inline-flex items-center gap-1">
                <span className={cn("size-2 rounded-full", EVENT_STYLE[k].dot)} aria-hidden="true" />
                {CERT_EVENT_LABEL[k]}
              </span>
            ))
          : null}
      </p>
    </div>
  );
}

function DayCell({
  date,
  day,
  weekLevel,
  events,
  dim,
  isToday,
  selectedWeek,
}: {
  date: string;
  day: DayForecast | null;
  /** 학기 밖이면 null (날씨 없이 날짜·일정만) */
  weekLevel: DayForecast["level"] | null;
  events: CertEvent[];
  dim: boolean;
  isToday: boolean;
  selectedWeek: boolean;
}) {
  // 맑음·흐림·폭풍은 주 단위로만 (10/27) — 날짜 칸은 그 주 색, 숫자는 그날 할 공부 시간
  const style = weekLevel ? WEATHER_STYLE[weekLevel] : null;
  const [, m, d] = date.split("-").map(Number);
  const label = [
    `${m}월 ${d}일`,
    style ? `그 주 ${style.label}` : "학기 밖",
    day ? `할 공부 ${formatDuration(day.hours)}` : null,
    ...events.map((e) => `${e.name} ${CERT_EVENT_LABEL[e.kind]}`),
    "하루 할 일 보기",
  ]
    .filter(Boolean)
    .join(", ");
  return (
    <Link
      role="gridcell"
      to={`/day/${date}`}
      aria-label={label}
      className={cn(
        "flex min-h-16 flex-col justify-between rounded-md px-1.5 py-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring sm:min-h-24 sm:px-2 sm:py-2",
        style ? style.badge : "bg-muted/40 text-foreground",
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
      {events.length > 0 ? (
        <>
          {/* PC: "SQLD 시험" 같은 일정 칸, 휴대폰: 색 점 (이름은 달력 아래 목록에) */}
          <span className="hidden min-w-0 gap-0.5 sm:grid">
            {events.slice(0, 2).map((e) => (
              <span key={`${e.kind}-${e.name}-${e.round}`} className={cn("truncate rounded px-1 text-[10px] leading-4 font-semibold", EVENT_STYLE[e.kind].chip)}>
                {CERT_EVENT_SHORT[e.kind]} {e.name}
              </span>
            ))}
            {events.length > 2 ? <span className="text-[10px] leading-3 text-muted-foreground">+{events.length - 2}</span> : null}
          </span>
          <span className="flex gap-0.5 sm:hidden" aria-hidden="true">
            {events.slice(0, 3).map((e) => (
              <span key={`${e.kind}-${e.name}-${e.round}`} className={cn("size-1.5 rounded-full", EVENT_STYLE[e.kind].dot)} />
            ))}
          </span>
        </>
      ) : null}
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
