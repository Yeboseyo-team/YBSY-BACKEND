import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { useIsDesktop } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";
import type { WeekForecast } from "../calc";
import { examOf, WEATHER_ICON, WEATHER_SHORT } from "../outlook";
import { WEATHER_STYLE } from "../weather";

type Props = {
  weeks: WeekForecast[];
  availableHours: number;
  currentWeek: number | null;
  selectedWeek: number;
  onSelect: (week: number) => void;
  midtermWeek: number | null;
  finalWeek: number | null;
  /** 제목 줄 오른쪽 (달력으로 보기 버튼) */
  action?: ReactNode;
};

/** 휴대폰에서 한 장에 보여 줄 주 수 */
const PER_PAGE = 4;

/**
 * 16주 예보 (10/28) — 날씨 앱의 "10일 예보" 목록.
 * 한 줄: 주차 · 날씨 아이콘 · 날씨 이름 · 숫자 없는 막대(점선 = 쓸 수 있는 시간, 넘으면 폭풍) · 시험 배지.
 * PC 는 16주를 한 번에, 휴대폰은 4주씩 옆으로 넘겨요(이번 주가 있는 장부터). 줄을 누르면 그 주 상세가 바뀌어요.
 */
export function WeekOutlook({ weeks, availableHours, currentWeek, selectedWeek, onSelect, midtermWeek, finalWeek, action }: Props) {
  const isDesktop = useIsDesktop();
  const max = Math.max(availableHours * 1.4, ...weeks.map((w) => w.total_hours), 1);
  const pages = Math.ceil(weeks.length / PER_PAGE);

  const row = (w: WeekForecast) => {
    const Icon = WEATHER_ICON[w.level];
    const style = WEATHER_STYLE[w.level];
    const exam = examOf(w.week, midtermWeek, finalWeek);
    const isCurrent = w.week === currentWeek;
    const isSelected = w.week === selectedWeek;
    return (
      <li key={w.week}>
        <button
          type="button"
          onClick={() => onSelect(w.week)}
          aria-pressed={isSelected}
          aria-label={`${w.week}주차${isCurrent ? "(이번 주)" : ""} ${style.label}, ${WEATHER_SHORT[w.level]}${exam ? `, ${exam}` : ""}`}
          className={cn(
            "grid h-11 w-full grid-cols-[3.5rem_1.25rem_2.25rem_minmax(0,1fr)_4.75rem] lg:h-9 items-center gap-2 rounded-lg px-2 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isCurrent ? "bg-accent" : "hover:bg-muted/60",
            isSelected && "ring-2 ring-ink/70 ring-inset",
            currentWeek !== null && w.week < currentWeek && !isSelected && "opacity-55",
          )}
        >
          <span className={cn("tabular-nums", isCurrent && "font-semibold")}>{isCurrent ? "이번 주" : `${w.week}주차`}</span>
          <Icon className={cn("size-5", style.text)} aria-hidden="true" />
          <span className={cn("font-semibold", style.text)}>{style.label}</span>
          <span className="relative h-1.5 rounded-full bg-muted" aria-hidden="true">
            <span className={cn("absolute inset-y-0 left-0 rounded-full", style.dot)} style={{ width: `${(w.total_hours / max) * 100}%` }} />
            <span className="absolute -inset-y-1 border-l-[1.5px] border-dashed border-ink" style={{ left: `${(availableHours / max) * 100}%` }} />
          </span>
          {exam ? (
            <span className="inline-flex h-5 items-center gap-1 justify-self-end rounded-full bg-[#efedfd] px-2 text-xs font-medium whitespace-nowrap text-[#4a3db0]">
              <Pencil className="size-3" aria-hidden="true" />
              {exam}
            </span>
          ) : (
            <span />
          )}
        </button>
      </li>
    );
  };

  return (
    <section aria-labelledby="outlook-title" className="grid gap-2 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="outlook-title" className="text-base font-semibold">
          16주 예보
        </h2>
        {action}
      </div>

      {isDesktop ? (
        <ol aria-label="1~16주차 예보" className="grid gap-0.5">
          {weeks.map(row)}
        </ol>
      ) : (
        <PagedWeeks weeks={weeks} pages={pages} startPage={Math.floor(((currentWeek ?? 1) - 1) / PER_PAGE)} row={row} />
      )}

    </section>
  );
}

/** 휴대폰: 4주씩 한 장, 손가락으로 넘기거나 ‹ › 버튼 */
function PagedWeeks({
  weeks,
  pages,
  startPage,
  row,
}: {
  weeks: WeekForecast[];
  pages: number;
  startPage: number;
  row: (w: WeekForecast) => ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(startPage);

  // 처음 열 때 이번 주가 있는 장으로 (애니메이션 없이)
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = startPage * el.clientWidth;
  }, [startPage]);

  const go = (next: number) => {
    const el = scroller.current;
    const target = Math.max(0, Math.min(pages - 1, next));
    el?.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
  };
  const from = page * PER_PAGE + 1;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium tabular-nums" aria-live="polite">
          {from}~{Math.min(from + PER_PAGE - 1, weeks.length)}주차
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="이전 4주"
            disabled={page === 0}
            onClick={() => go(page - 1)}
            className="grid size-8 place-items-center rounded-lg border border-border outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="다음 4주"
            disabled={page === pages - 1}
            onClick={() => go(page + 1)}
            className="grid size-8 place-items-center rounded-lg border border-border outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        onScroll={(e) => setPage(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {Array.from({ length: pages }, (_, p) => (
          <ol key={p} aria-label={`${p * PER_PAGE + 1}~${p * PER_PAGE + PER_PAGE}주차 예보`} className="grid w-full shrink-0 snap-start gap-0.5">
            {weeks.slice(p * PER_PAGE, p * PER_PAGE + PER_PAGE).map(row)}
          </ol>
        ))}
      </div>

      <div className="flex justify-center gap-1.5" aria-hidden="true">
        {Array.from({ length: pages }, (_, p) => (
          <span key={p} className={cn("h-1.5 rounded-full transition-all", p === page ? "w-4 bg-ink" : "w-1.5 bg-border")} />
        ))}
      </div>
    </div>
  );
}
