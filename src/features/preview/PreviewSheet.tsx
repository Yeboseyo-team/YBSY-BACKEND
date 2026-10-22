import { useEffect, useId, useMemo, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForecastData } from "@/features/forecast/api";
import type { Forecast, Weather } from "@/features/forecast/calc";
import { formatHours, WEATHER_ORDER, WEATHER_STYLE } from "@/features/forecast/weather";
import { cn } from "@/lib/utils";
import { peakHours, runPreview, type PreviewDraft, type PreviewResult } from "./preview";

/**
 * S-11 사전 검토 시트 (F-06) — 담당: 프론트 B (feature/frontend-jw)
 * 계획 등록·수정 화면(S-09)과 자격증 선택 화면(S-10)에서 열어 씁니다.
 * - '지금'과 '추가했을 때' 예보를 겹친 그래프로 (calc.ts 만 씀, 서버 호출 없음 — NFR-PERF-2)
 * - 변화 요약은 comparePreview 문장 그대로 (FR-06-3)
 * - [추가하기] → onConfirm (저장은 여는 쪽이 useCreatePlan / useAddCertificate 로), [취소] → onCancel, DB에 아무것도 안 씀
 */
export type PreviewSheetProps = {
  open: boolean;
  /** 시트 제목에 쓸 추가 대상 이름, 예: "운영체제", "정보처리기사 3회" */
  title: string;
  /** 더해 볼 계획·자격증. 없으면 그래프 없이 안내만 보여요. */
  draft?: PreviewDraft | null;
  onConfirm: () => void;
  onCancel: () => void;
  /** 기본 "추가하기". 수정 화면이면 "이대로 저장" 등 */
  confirmLabel?: string;
  isPending?: boolean;
};

export function PreviewSheet({ open, title, draft = null, onConfirm, onCancel, confirmLabel = "추가하기", isPending = false }: PreviewSheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const data = useForecastData();
  // 여는 쪽이 매번 새 함수를 넘겨도 초점 처리가 다시 돌지 않게
  const cancelRef = useRef(onCancel);
  useEffect(() => {
    cancelRef.current = onCancel;
  });

  const result = useMemo<PreviewResult | null>(
    () => (open && draft && data.input ? runPreview(data.input, draft) : null),
    [open, draft, data.input],
  );

  // 열리면 시트로 초점을 옮기고, Esc 로 닫고, 뒤 화면 스크롤을 막아요. 닫히면 원래 버튼으로 초점을 돌려요.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelRef.current();
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-ink/40 sm:place-items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="grid max-h-[92dvh] w-full max-w-2xl gap-5 overflow-y-auto rounded-t-3xl bg-card p-5 outline-none sm:rounded-3xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="grid min-w-0 gap-1.5">
            <span className="text-[13px] font-semibold text-muted-foreground">사전 검토 · {title}</span>
            <h2 id={titleId} className="text-xl leading-snug font-bold tracking-tight sm:text-2xl">
              {result ? headline(result) : "추가했을 때의 예보를 계산할 수 없어요"}
            </h2>
            {result ? (
              <p className="text-[15px] text-muted-foreground" aria-live="polite">
                {result.diff.message}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="닫기"
            className="-mt-1 -mr-1 grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {result ? (
          <>
            <OverlayChart
              before={result.before}
              after={result.after}
              available={data.profile?.available_hours ?? 0}
              newStormWeeks={result.diff.new_storm_weeks}
              title={title}
            />
            <CompareTiles before={result.before} after={result.after} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {data.status === "loading" ? "예보를 불러오는 중이에요." : "입력을 확인한 뒤 다시 열어 주세요."}
          </p>
        )}

        <p className="text-[13px] text-muted-foreground">추가하기를 누르기 전에는 저장되지 않아요.</p>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" size="lg" onClick={onCancel}>
            취소
          </Button>
          <Button type="button" size="lg" className="bg-ink hover:bg-ink/90" disabled={isPending} onClick={onConfirm}>
            {isPending ? "저장하는 중…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function headline({ before, after, diff }: PreviewResult): string {
  if (diff.new_storm_weeks.length > 0) return `폭풍이 ${diff.new_storm_weeks.length}주 늘어나요`;
  if (diff.storm_after < diff.storm_before) return "폭풍이 줄어들어요";
  if (after.summary.cloudy > before.summary.cloudy) return "흐린 주가 늘어나요";
  if (after.summary.clear < before.summary.clear) return "맑은 주가 줄어들어요";
  return "예보가 크게 바뀌지 않아요";
}

const HATCH: Record<Weather, string> = {
  clear: "bg-[repeating-linear-gradient(135deg,var(--color-clear)_0_3px,var(--color-card)_3px_6px)] shadow-[inset_0_0_0_1px_var(--color-clear)]",
  cloudy: "bg-[repeating-linear-gradient(135deg,var(--color-caution)_0_3px,var(--color-card)_3px_6px)] shadow-[inset_0_0_0_1px_var(--color-caution)]",
  storm: "bg-[repeating-linear-gradient(135deg,var(--color-storm)_0_3px,var(--color-card)_3px_6px)] shadow-[inset_0_0_0_1px_var(--color-storm)]",
};

/** 지금(꽉 찬 막대) 위에 늘어난 만큼(빗금)을 겹쳐 그려요. 줄어든 주는 예전 높이를 점선 테두리로. */
function OverlayChart({
  before,
  after,
  available,
  newStormWeeks,
  title,
}: {
  before: Forecast;
  after: Forecast;
  available: number;
  newStormWeeks: number[];
  title: string;
}) {
  const max = Math.max(available, peakHours(before), peakHours(after), 1) * 1.08;
  const pct = (h: number) => `${(h / max) * 100}%`;
  const level = after.weeks.map((w) => w.level);
  const shownLevel: Weather = level.includes("storm") ? "storm" : level.includes("cloudy") ? "cloudy" : "clear";

  return (
    <figure className="grid gap-2">
      <div className="relative h-[200px] sm:h-[240px]" aria-hidden="true">
        <div className="absolute inset-0 grid grid-cols-16 items-end gap-1 sm:gap-1.5">
          {after.weeks.map((w, i) => {
            const was = before.weeks[i].total_hours;
            const now = w.total_hours;
            const base = Math.min(was, now);
            const style = WEATHER_STYLE[w.level];
            return (
              <div key={w.week} className="relative flex h-full flex-col justify-end">
                {was > now ? (
                  <div className="absolute inset-x-0 bottom-0 rounded-t-[5px] border border-dashed border-muted-foreground/60" style={{ height: pct(was) }} />
                ) : null}
                {now > was ? <div className={cn("rounded-t-[5px]", HATCH[w.level])} style={{ height: pct(now - was) }} /> : null}
                <div className={cn("rounded-b-[2px]", style.dot, now <= was && "rounded-t-[5px]")} style={{ height: pct(base) }} />
              </div>
            );
          })}
        </div>
        <div className="absolute inset-x-0 border-t-[1.5px] border-dashed border-ink" style={{ bottom: pct(available) }} />
      </div>
      <div className="grid grid-cols-16 gap-1 sm:gap-1.5" aria-hidden="true">
        {after.weeks.map((w) => (
          <span
            key={w.week}
            className={cn(
              "text-center text-[11px] tabular-nums sm:text-xs",
              newStormWeeks.includes(w.week) ? "font-bold text-[#a82e27]" : "text-muted-foreground",
            )}
          >
            {w.week}
          </span>
        ))}
      </div>
      <figcaption className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("size-3 rounded-[3px]", WEATHER_STYLE[shownLevel].dot)} aria-hidden="true" />
          지금 계획
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("size-3 rounded-[3px]", HATCH[shownLevel])} aria-hidden="true" />
          {title} 추가분
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 border-t-[1.5px] border-dashed border-ink" aria-hidden="true" />
          가용 {available}시간
        </span>
      </figcaption>
    </figure>
  );
}

const TILE: Record<Weather, string> = {
  storm: "bg-storm/10 text-[#a82e27]",
  cloudy: "bg-caution/15 text-[#8a5200]",
  clear: "bg-clear/10 text-[#1f6e4a]",
};

function CompareTiles({ before, after }: { before: Forecast; after: Forecast }) {
  return (
    <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {WEATHER_ORDER.map((level) => (
        <div key={level} className={cn("rounded-2xl p-3.5", TILE[level])}>
          <dt className="text-[13px] font-semibold">{WEATHER_STYLE[level].label}</dt>
          <dd className="mt-1 text-lg font-bold text-foreground tabular-nums">
            {before.summary[level]}주 → {after.summary[level]}주
          </dd>
        </div>
      ))}
      <div className="rounded-2xl bg-muted p-3.5">
        <dt className="text-[13px] font-semibold text-muted-foreground">가장 바쁜 주</dt>
        <dd className="mt-1 text-lg font-bold tabular-nums">
          {formatHours(peakHours(before))} → {formatHours(peakHours(after))}시간
        </dd>
      </div>
    </dl>
  );
}
