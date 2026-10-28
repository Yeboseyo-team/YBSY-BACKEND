import { useEffect, useMemo, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useForecastData } from "@/features/forecast/api";
import { TOTAL_WEEKS, type Forecast, type Weather } from "@/features/forecast/calc";
import { formatDuration, formatHours, WEATHER_STYLE } from "@/features/forecast/weather";
import { useIsDesktop } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";
import { buildPreview, levelChanges, peakHours, previewHeadline, previewModeOf, type PreviewDraft } from "./preview";

/**
 * S-11 사전 검토 시트 (F-06) — 계획 등록 화면(S-09)과 자격증 선택 화면(S-10)에서 엽니다.
 * - 기존 예보와 '추가했을 때' 예보를 한 그래프에 겹쳐 보여주기 (늘어난 부분은 빗금, FR-06-2)
 * - 변화 요약 ("폭풍 1주 → 3주 (9, 10주차 추가)", FR-06-3)
 * - [추가하기] → onConfirm (저장은 여는 화면이 함), [취소]·Esc·바깥 누르기 → onCancel (아무것도 저장 안 함, FR-06-4)
 * 계산은 calc.ts 만 쓰고 서버는 부르지 않습니다 (NFR-PERF-2).
 */
export type PreviewSheetProps = {
  open: boolean;
  /** 시트 제목에 쓸 추가 대상 이름, 예: "운영체제", "정보처리기사 2026년 정기 3회" */
  title: string;
  /** 더해 볼 계획 또는 자격증 회차. 없으면(입력이 아직 올바르지 않으면) 그래프 없이 안내만 */
  draft: PreviewDraft | null;
  onConfirm: () => void;
  onCancel: () => void;
  /** 확인 버튼 글자 (기본 "추가하기") */
  confirmLabel?: string;
  /** 저장 중이면 버튼을 막고 "저장하는 중…" */
  pending?: boolean;
  /**
   * true 면 PC 화면(1024px~)에서 팝업 대신 이 자리(폼 옆 빈 칸)에 그대로 펼쳐요 (10/24 QA). 휴대폰은 지금처럼 아래에서 올라오는 시트.
   * 여는 화면이 폼 옆 칸에 이 컴포넌트를 두면 돼요.
   */
  inline?: boolean;
  /** inline 일 때 아직 안 열었으면 그 칸에 보여 줄 안내 (없으면 빈 칸) */
  placeholder?: string;
};

export function PreviewSheet(props: PreviewSheetProps) {
  const isDesktop = useIsDesktop();
  if (props.inline && isDesktop) return <PreviewPanel {...props} />;
  return <PreviewDialog {...props} />;
}

/** PC: 폼 옆에 붙는 사전 검토 칸 */
function PreviewPanel({ open, title, draft, onConfirm, onCancel, confirmLabel = "추가하기", pending = false, placeholder }: PreviewSheetProps) {
  if (!open) {
    return placeholder ? (
      <aside className="sticky top-24 grid min-h-64 place-items-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
        {placeholder}
      </aside>
    ) : null;
  }
  return (
    <aside aria-labelledby="preview-sheet-title" className="sticky top-24 rounded-2xl border border-border bg-card shadow-sm">
      <PreviewBody title={title} draft={draft} onConfirm={onConfirm} onCancel={onCancel} confirmLabel={confirmLabel} pending={pending} />
    </aside>
  );
}

/** 휴대폰(또는 inline 이 아닌 곳): 아래에서 올라오는 시트·가운데 팝업 */
function PreviewDialog({ open, title, draft, onConfirm, onCancel, confirmLabel = "추가하기", pending = false }: PreviewSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="preview-sheet-title"
      onCancel={(e) => {
        e.preventDefault(); // Esc: 닫기는 부모가 open 으로 정함
        if (!pending) onCancel();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onCancel(); // 바깥(배경) 누르기
      }}
      className={cn(
        "m-0 mt-auto w-full max-w-none rounded-t-2xl border-0 bg-card p-0 text-foreground backdrop:bg-black/40",
        "sm:m-auto sm:max-w-2xl sm:rounded-2xl",
      )}
    >
      {open ? (
        <PreviewBody
          title={title}
          draft={draft}
          onConfirm={onConfirm}
          onCancel={onCancel}
          confirmLabel={confirmLabel}
          pending={pending}
        />
      ) : null}
    </dialog>
  );
}

function PreviewBody({ title, draft, onConfirm, onCancel, confirmLabel, pending }: Omit<PreviewSheetProps, "open" | "inline" | "placeholder">) {
  const data = useForecastData();
  const mode = previewModeOf(draft);

  const result = useMemo(() => (data.input && draft ? buildPreview(data.input, draft) : null), [data.input, draft]);

  return (
    <div className="grid max-h-[90dvh] gap-5 overflow-y-auto p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">사전 검토 · {title}</p>
          <h2 id="preview-sheet-title" className="mt-1 text-xl font-bold tracking-tight">
            {result ? previewHeadline(title, result, mode) : title}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">아직 저장되지 않았어요. [{confirmLabel}]를 눌러야 저장돼요.</p>
        </div>
        <Button type="button" variant="ghost" size="icon" aria-label="닫기" onClick={onCancel} disabled={pending}>
          <X aria-hidden="true" />
        </Button>
      </div>

      {data.status === "loading" ? (
        <div className="grid gap-3" aria-busy="true" aria-label="예보를 계산하는 중">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      ) : data.status === "error" ? (
        <div role="alert" className="grid gap-3 rounded-xl border border-storm/30 bg-storm/5 p-4 text-sm">
          예보를 불러오지 못했어요. 그래도 추가할 수는 있어요.
          <Button type="button" variant="outline" className="justify-self-start" onClick={data.refetch}>
            다시 불러오기
          </Button>
        </div>
      ) : !result || !data.profile ? (
        <p className="text-sm text-muted-foreground">입력한 값을 확인해 주세요. 올바르게 입력하면 바뀌는 예보가 여기에 나와요.</p>
      ) : (
        <>
          <p className="text-[15px] leading-relaxed" role="status">
            <span className="font-semibold">{result.diff.message}</span>
            {result.diff.new_storm_weeks.length > 0 ? (
              <span className="text-muted-foreground"> — {result.diff.new_storm_weeks.join(", ")}주차가 새로 폭풍이 돼요.</span>
            ) : null}
          </p>

          <OverlayChart
            before={result.before}
            after={result.after}
            availableHours={data.profile.available_hours ?? 0}
            newStormWeeks={result.diff.new_storm_weeks}
            draftLabel={title}
          />

          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {levelChanges(result).map((c) => (
              <ChangeTile key={c.level} level={c.level} before={c.before} after={c.after} unit="주" />
            ))}
            <ChangeTile label="가장 바쁜 주" before={peakHours(result.before)} after={peakHours(result.after)} unit="시간" />
          </dl>
        </>
      )}

      <div className="grid grid-cols-2 gap-2 border-t border-border pt-4 sm:flex sm:justify-end">
        <Button type="button" variant="outline" size="lg" onClick={onCancel} disabled={pending}>
          취소
        </Button>
        <Button type="button" size="lg" onClick={onConfirm} disabled={pending || !draft}>
          {pending ? "저장하는 중…" : confirmLabel}
        </Button>
      </div>
    </div>
  );
}

function ChangeTile({
  level,
  label,
  before,
  after,
  unit,
}: {
  level?: Weather;
  label?: string;
  before: number;
  after: number;
  unit: string;
}) {
  const changed = before !== after;
  // 시간은 "4시간 30분"처럼, 주 수는 "3주"처럼
  const show = (n: number) => (unit === "시간" ? formatDuration(n) : `${formatHours(n)}${unit}`);
  return (
    <div className={cn("rounded-xl px-3.5 py-3", level ? WEATHER_STYLE[level].badge : "bg-secondary")}>
      <dt className="text-[13px] font-semibold">{label ?? WEATHER_STYLE[level!].label}</dt>
      <dd className="mt-1 text-base font-bold text-foreground tabular-nums">
        {changed ? (
          <>
            <span className="font-medium text-muted-foreground">{show(before)}</span> → {show(after)}
          </>
        ) : (
          <>
            {show(after)} <span className="text-xs font-normal text-muted-foreground">그대로</span>
          </>
        )}
      </dd>
    </div>
  );
}

const HATCH: Record<Weather, string> = {
  clear: "bg-[repeating-linear-gradient(135deg,var(--color-clear)_0_3px,var(--color-card)_3px_6px)]",
  cloudy: "bg-[repeating-linear-gradient(135deg,var(--color-caution)_0_3px,var(--color-card)_3px_6px)]",
  storm: "bg-[repeating-linear-gradient(135deg,var(--color-storm)_0_3px,var(--color-card)_3px_6px)]",
};
const SOLID: Record<Weather, string> = { clear: "bg-clear", cloudy: "bg-caution", storm: "bg-storm" };

/** 지금 예보(진한 막대) 위에 늘어난 부분(빗금)을 겹친 16주 그래프 (FR-06-2). 줄어든 부분은 점선 테두리 */
function OverlayChart({
  before,
  after,
  availableHours,
  newStormWeeks,
  draftLabel,
}: {
  before: Forecast;
  after: Forecast;
  availableHours: number;
  newStormWeeks: number[];
  draftLabel: string;
}) {
  const max = Math.max(availableHours, peakHours(before), peakHours(after)) * 1.1 || 1;
  const pct = (h: number) => `${(h / max) * 100}%`;
  const newStorm = new Set(newStormWeeks);
  const grew = after.weeks.some((w, i) => w.total_hours > before.weeks[i].total_hours);
  const shrank = after.weeks.some((w, i) => w.total_hours < before.weeks[i].total_hours);
  const summary = after.weeks
    .map((w, i) => {
      const b = before.weeks[i].total_hours;
      return b === w.total_hours ? null : `${w.week}주차 ${formatDuration(b)}→${formatDuration(w.total_hours)} ${WEATHER_STYLE[w.level].label}`;
    })
    .filter(Boolean)
    .join(", ");

  return (
    <figure className="grid gap-2">
      <div
        role="img"
        aria-label={summary ? `바뀌는 주: ${summary}. 쓸 수 있는 시간 ${formatDuration(availableHours)}` : "바뀌는 주가 없어요"}
        className="relative h-44 sm:h-52"
      >
        <div className="absolute inset-0 grid grid-cols-16 items-end gap-[3px] sm:gap-1.5">
          {after.weeks.map((w, i) => {
            const b = before.weeks[i].total_hours;
            const a = w.total_hours;
            return (
              <div key={w.week} className="relative flex h-full flex-col justify-end">
                {b > a ? (
                  <div className="rounded-t-[3px] border border-dashed border-muted-foreground/60" style={{ height: pct(b - a) }} />
                ) : null}
                {a > b ? <div className={cn("rounded-t-[3px]", HATCH[w.level])} style={{ height: pct(a - b) }} /> : null}
                <div
                  className={cn("rounded-b-[2px]", SOLID[w.level], a <= b && "rounded-t-[3px]")}
                  style={{ height: pct(Math.min(a, b)) }}
                />
              </div>
            );
          })}
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 border-t-[1.5px] border-dashed border-ink"
          style={{ bottom: pct(availableHours) }}
        />
      </div>
      <div className="grid grid-cols-16 gap-[3px] text-center text-[11px] tabular-nums sm:gap-1.5 sm:text-xs" aria-hidden="true">
        {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((week) => (
          <span
            key={week}
            className={cn(
              newStorm.has(week) ? "font-bold text-storm" : "text-muted-foreground",
              // 휴대폰 폭에서는 짝수 주 번호를 숨겨 겹치지 않게 (새 폭풍 주는 항상 보임)
              week % 2 === 0 && !newStorm.has(week) && "invisible sm:visible",
            )}
          >
            {week}
          </span>
        ))}
      </div>
      <figcaption className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="flex" aria-hidden="true">
            <span className="size-2.5 rounded-l-sm bg-clear" />
            <span className="size-2.5 bg-caution" />
            <span className="size-2.5 rounded-r-sm bg-storm" />
          </span>
          지금 예보
        </span>
        {grew ? (
          <span className="inline-flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-sm", HATCH.storm)} aria-hidden="true" />
            {draftLabel} 추가분
          </span>
        ) : null}
        {shrank ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm border border-dashed border-muted-foreground" aria-hidden="true" />
            줄어드는 시간
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 border-t-[1.5px] border-dashed border-ink" aria-hidden="true" />
          쓸 수 있는 시간({formatDuration(availableHours)})
        </span>
        <span>색은 추가한 뒤의 날씨예요</span>
      </figcaption>
    </figure>
  );
}
