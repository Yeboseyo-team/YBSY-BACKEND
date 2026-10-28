import { useId, useMemo, useState } from "react";
import { ChevronDown, Lightbulb } from "lucide-react";
import { explainBusy } from "@/features/forecast/explain";
import type { ForecastInput } from "@/features/forecast/calc";
import { formatDuration } from "@/features/forecast/weather";
import { cn } from "@/lib/utils";

type Props = {
  input: ForecastInput;
  /** 이 주차부터 셈 (홈은 이번 주부터, 온보딩은 1주차부터) */
  fromWeek?: number;
  className?: string;
};

const OPEN_KEY = "hakgi:busy-explain-open";

/** 접었다 폈다 한 상태 (이 브라우저에만 기억, 못 읽으면 펼친 채로) */
function readOpen(): boolean {
  try {
    return localStorage.getItem(OPEN_KEY) !== "closed";
  } catch {
    return true;
  }
}

/**
 * 왜 바쁜지 설명 (10/27) — 폭풍 주가 있을 때만 보여요.
 * 제목 줄 "이대로는 N주를 소화하기 어려워요"를 누르면 접고 펼 수 있어요.
 * 펼치면 가장 바쁜 주에 시간이 많이 드는 일마다 "보통 이 정도는 해야 해요(기준)"와 "지금은 이렇게 잡혀 있어요"를 보여 줘요.
 */
export function BusyExplain({ input, fromWeek = 1, className }: Props) {
  const e = useMemo(() => explainBusy(input, fromWeek), [input, fromWeek]);
  const [open, setOpenState] = useState(readOpen);
  const bodyId = useId();
  if (!e) return null;
  const { stormWeeks, peak, available, why, reasons } = e;

  const setOpen = (next: boolean) => {
    setOpenState(next);
    try {
      localStorage.setItem(OPEN_KEY, next ? "open" : "closed");
    } catch {
      // 기억 못 해도 이번 화면에서는 그대로
    }
  };

  return (
    <section aria-labelledby={`${bodyId}-title`} className={cn("grid rounded-2xl border border-storm/30 bg-storm/5", className)}>
      <h2 id={`${bodyId}-title`} className="text-base font-semibold">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-1.5 rounded-2xl p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-5"
        >
          <Lightbulb aria-hidden="true" className="size-4 shrink-0 text-storm" />
          <span className="min-w-0 flex-1">
            이대로는 {fromWeek > 1 ? "남은 학기 중 " : ""}
            {stormWeeks.length}주를 소화하기 어려워요
          </span>
          <span className="shrink-0 text-xs font-normal text-muted-foreground">{open ? "접기" : "왜 바쁜지 보기"}</span>
          <ChevronDown aria-hidden="true" className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
      </h2>

      {open ? (
        <div id={bodyId} className="grid gap-3 px-4 pb-4 sm:px-5 sm:pb-5">
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            가장 바쁜 <strong className="font-semibold text-foreground">{peak.week}주차</strong>는{" "}
            <strong className="font-semibold text-foreground">{formatDuration(peak.total_hours)}</strong>이 필요한데 쓸 수 있는 시간은 {formatDuration(available)}이에요.{" "}
            {why.join(" ")}
          </p>

          <div className="grid gap-1.5">
            <h3 className="text-[13px] font-semibold">{peak.week}주차에 시간이 많이 드는 일</h3>
            <ul className="grid gap-2">
              {reasons.map((r) => (
                <li key={r.title} className="grid gap-1 rounded-xl border border-border bg-card px-3 py-2.5">
                  <p className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium">{r.title}</span>
                    <span className="shrink-0 font-semibold tabular-nums">{formatDuration(r.hours)}</span>
                  </p>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">{r.text}</p>
                  <p className="flex gap-1.5 text-[13px] leading-relaxed">
                    <span className="h-fit shrink-0 rounded bg-muted px-1.5 text-xs font-semibold text-foreground">지금</span>
                    <span className="text-foreground/80">{r.now}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">기준은 서비스 기본값(수업 학점×1.5시간, 프로젝트 6시간, 활동 4시간)이에요. 내 계획 시간은 계획에서 고칠 수 있어요.</p>
        </div>
      ) : null}
    </section>
  );
}
