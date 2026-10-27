import { useMemo } from "react";
import { Lightbulb } from "lucide-react";
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

/**
 * 왜 바쁜지 설명 (10/27) — 폭풍 주가 있을 때만 보여요.
 * "이대로는 N주를 소화하기 어려워요" + 가장 바쁜 주에 시간이 많이 드는 일과 그 까닭을 한 줄씩.
 */
export function BusyExplain({ input, fromWeek = 1, className }: Props) {
  const e = useMemo(() => explainBusy(input, fromWeek), [input, fromWeek]);
  if (!e) return null;
  const { stormWeeks, peak, available, why, reasons } = e;

  return (
    <section aria-labelledby="busy-title" className={cn("grid gap-3 rounded-2xl border border-storm/30 bg-storm/5 p-4 sm:p-5", className)}>
      <div className="grid gap-1">
        <h2 id="busy-title" className="flex items-center gap-1.5 text-base font-semibold">
          <Lightbulb aria-hidden="true" className="size-4 shrink-0 text-storm" />
          이대로는 {fromWeek > 1 ? "남은 학기 중 " : ""}
          {stormWeeks.length}주를 소화하기 어려워요
        </h2>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          가장 바쁜 <strong className="font-semibold text-foreground">{peak.week}주차</strong>는{" "}
          <strong className="font-semibold text-foreground">{formatDuration(peak.total_hours)}</strong>이 필요한데 쓸 수 있는 시간은 {formatDuration(available)}이에요.{" "}
          {why.join(" ")}
        </p>
      </div>

      <div className="grid gap-1.5">
        <h3 className="text-[13px] font-semibold">{peak.week}주차에 시간이 많이 드는 일</h3>
        <ul className="grid gap-2">
          {reasons.map((r) => (
            <li key={r.title} className="grid gap-0.5 rounded-xl border border-border bg-card px-3 py-2.5">
              <p className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium">{r.title}</span>
                <span className="shrink-0 font-semibold tabular-nums">{formatDuration(r.hours)}</span>
              </p>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{r.text}</p>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-muted-foreground">시간은 계획에 넣은 한 주 시간 기준이에요. 실제와 다르면 계획에서 고칠 수 있어요.</p>
    </section>
  );
}
