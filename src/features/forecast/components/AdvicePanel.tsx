import { useMemo, useState } from "react";
import { ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { diagnose, suggest, type Advice } from "@/features/forecast/advice";
import type { ForecastInput, ForecastPlan } from "@/features/forecast/calc";
import { formatDuration } from "@/features/forecast/weather";
import { cn } from "@/lib/utils";

type Props = {
  input: ForecastInput;
  /** 이 주차부터 셈 (홈은 이번 주부터, 온보딩은 1주차부터) */
  fromWeek?: number;
  canChangePlan?: (plan: ForecastPlan) => boolean;
  /** [적용]을 눌렀을 때. 실패하면 오류를 던져 주세요 */
  onApply: (advice: Advice) => Promise<void> | void;
  className?: string;
};

/**
 * 학기 진단·해결 제안 (10/27) — 폭풍 주가 있을 때만 보여요.
 * "이대로는 N주를 소화하기 어려워요"와, 실제로 다시 계산해 본 해결책 최대 3개를 [적용] 버튼과 함께 보여 줘요.
 */
export function AdvicePanel({ input, fromWeek = 1, canChangePlan, onApply, className }: Props) {
  const diagnosis = useMemo(() => diagnose(input, fromWeek), [input, fromWeek]);
  const list = useMemo(() => suggest(input, { fromWeek, canChangePlan }), [input, fromWeek, canChangePlan]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { stormWeeks, peak, available } = diagnosis;
  if (stormWeeks.length === 0 || !peak) return null;

  const apply = async (advice: Advice) => {
    setBusy(advice.id);
    setError(null);
    try {
      await onApply(advice);
    } catch {
      setError("적용하지 못했어요. 잠시 뒤 다시 시도하세요.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section aria-labelledby="advice-title" className={cn("grid gap-3 rounded-2xl border border-storm/30 bg-storm/5 p-4 sm:p-5", className)}>
      <div className="grid gap-1">
        <h2 id="advice-title" className="flex items-center gap-1.5 text-base font-semibold">
          <Lightbulb aria-hidden="true" className="size-4 text-storm" />
          이대로는 {fromWeek > 1 ? "남은 학기 중 " : ""}
          {stormWeeks.length}주를 소화하기 어려워요
        </h2>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          가장 바쁜 <strong className="font-semibold text-foreground">{peak.week}주차</strong>는{" "}
          <strong className="font-semibold text-foreground">{formatDuration(peak.total_hours)}</strong>이 필요한데 쓸 수 있는 시간은 {formatDuration(available)}이에요.
        </p>
      </div>

      {list.length > 0 ? (
        <ul className="grid gap-2">
          {list.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-xl border border-border bg-card px-3 py-2.5">
              <div className="grid min-w-0 gap-0.5">
                <p className="text-sm font-medium">{a.title}</p>
                {/* 폭풍 주가 줄면 폭풍 주 수를, 그대로면 넘치는 시간을 비교해요 */}
                <p className="flex flex-wrap items-center gap-1 text-[13px] text-muted-foreground tabular-nums">
                  {a.stormAfter < a.stormBefore ? (
                    <>
                      폭풍 {a.stormBefore}주
                      <ArrowRight aria-label="에서" className="size-3.5" />
                      <span className={cn("font-semibold", a.stormAfter === 0 ? "text-clear" : "text-foreground")}>{a.stormAfter}주</span>
                    </>
                  ) : (
                    <>
                      넘치는 시간 {a.overBefore}시간
                      <ArrowRight aria-label="에서" className="size-3.5" />
                      <span className="font-semibold text-foreground">{a.overAfter}시간</span>
                      <span>(폭풍 주는 그대로)</span>
                    </>
                  )}
                </p>
              </div>
              <Button type="button" size="sm" variant="outline" disabled={busy !== null} onClick={() => void apply(a)}>
                {busy === a.id ? "적용하는 중…" : "적용"}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] text-muted-foreground">계산해 보니 하나만 바꿔서는 크게 나아지지 않아요. 계획 시간이나 쓸 수 있는 시간을 직접 조정해 보세요.</p>
      )}
      {error ? <p className="text-[13px] text-destructive">{error}</p> : null}
    </section>
  );
}
