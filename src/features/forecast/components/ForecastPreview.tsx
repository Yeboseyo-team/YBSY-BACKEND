import { useMemo } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { useProfile } from "@/features/auth/api";
import { usePlans } from "@/features/plans/api";
import type { PlanInput } from "@/features/plans/types";
import { useMyCertificates } from "@/features/certificates/api";
import type { CertificatePrepInput } from "@/features/certificates/types";
import { toForecastCertificates } from "@/features/certificates/utils";
import { cn } from "@/lib/utils";
import { calculateForecast, isSemesterReady, type Forecast, type Weather } from "../calc";
import { describePreview, peakHours } from "../preview-text";

type Props = {
  /** 저장 전 계획. 입력이 아직 올바르지 않으면 null */
  draft?: PlanInput | null;
  /** 수정 중인 계획 id. 있으면 그 계획을 draft로 바꿔 비교합니다. */
  editingId?: string;
  /** 저장 전 자격증 회차 (자격증 화면의 사전 검토) */
  draftCertificate?: CertificatePrepInput | null;
  className?: string;
};

const WEATHER: Record<Weather, { label: string; bar: string; hatch: string; tile: string; text: string }> = {
  clear: {
    label: "맑음",
    bar: "bg-clear",
    hatch: "bg-[repeating-linear-gradient(135deg,var(--color-clear)_0_3px,var(--color-card)_3px_6px)]",
    tile: "bg-clear/10",
    text: "text-clear",
  },
  cloudy: {
    label: "흐림",
    bar: "bg-caution",
    hatch: "bg-[repeating-linear-gradient(135deg,var(--color-caution)_0_3px,var(--color-card)_3px_6px)]",
    tile: "bg-caution/10",
    text: "text-caution",
  },
  storm: {
    label: "폭풍",
    bar: "bg-storm",
    hatch: "bg-[repeating-linear-gradient(135deg,var(--color-storm)_0_3px,var(--color-card)_3px_6px)]",
    tile: "bg-storm/10",
    text: "text-storm",
  },
};

/**
 * 사전 검토 (F-06). 저장하지 않은 계획·회차를 더했을 때 예보가 어떻게 바뀌는지 보여 줍니다.
 * 계산은 calc.ts만 쓰고 DB에는 아무것도 쓰지 않습니다 (NFR-PERF-2).
 */
export function ForecastPreview({ draft = null, editingId, draftCertificate = null, className }: Props) {
  const { user } = useAuth();
  const profile = useProfile(user?.id);
  const plans = usePlans();
  const mine = useMyCertificates();

  const result = useMemo(() => {
    if (!profile.data || !plans.data || !mine.data || !isSemesterReady(profile.data)) return null;
    const input = { profile: profile.data, plans: plans.data, ...toForecastCertificates(mine.data) };
    const before = calculateForecast(input);

    let afterPlans: PlanInput[] = plans.data;
    if (editingId) afterPlans = plans.data.map((p) => (p.id === editingId && draft ? draft : p));
    else if (draft) afterPlans = [...plans.data, draft];

    let afterMine = mine.data;
    if (draftCertificate) {
      const others = mine.data.filter((c) => c.certificate_id !== draftCertificate.certificate_id);
      afterMine = [...others, draftCertificate];
    }
    const after = calculateForecast({ ...input, plans: afterPlans, ...toForecastCertificates(afterMine) });
    return { before, after, available: profile.data.available_hours };
  }, [profile.data, plans.data, mine.data, draft, editingId, draftCertificate]);

  const label = draft?.title.trim() || (draftCertificate ? `${draftCertificate.certificate.name} 준비` : "이 계획");
  const hasDraft = Boolean(draft || draftCertificate);
  const mode = editingId ? "edit" : "add";

  return (
    <section aria-labelledby="forecast-preview-title" className={cn("rounded-xl border border-border bg-card p-6", className)}>
      <p className="text-xs font-semibold text-muted-foreground">사전 검토</p>
      {profile.isError || plans.isError || mine.isError ? (
        <p id="forecast-preview-title" className="mt-2 text-sm text-destructive">
          예보를 불러오지 못했어요. 새로고침한 뒤 다시 시도하세요.
        </p>
      ) : !result ? (
        <p id="forecast-preview-title" className="mt-2 text-sm text-muted-foreground">
          예보를 불러오는 중…
        </p>
      ) : (
        <PreviewBody
          before={result.before}
          after={result.after}
          available={result.available}
          label={label}
          mode={mode}
          hasDraft={hasDraft}
        />
      )}
    </section>
  );
}

function PreviewBody({
  before,
  after,
  available,
  label,
  mode,
  hasDraft,
}: {
  before: Forecast;
  after: Forecast;
  available: number;
  label: string;
  mode: "add" | "edit";
  hasDraft: boolean;
}) {
  const text = hasDraft
    ? describePreview(before, after, label, mode)
    : { title: "입력하면 여기서 예보가 바로 바뀌어요", detail: "지금은 저장된 계획 기준 예보예요. 입력이 올바르면 추가분이 빗금으로 보여요." };

  const max = Math.max(peakHours(before), peakHours(after), available) * 1.12 || 1;
  const pct = (h: number) => `${(h / max) * 100}%`;
  const delta = (b: number, a: number) => (a === b ? `${a}주 그대로` : `${b}주 → ${a}주`);
  const peakB = peakHours(before);
  const peakA = peakHours(after);

  return (
    <>
      <h2 id="forecast-preview-title" className="mt-1 text-xl font-bold tracking-tight text-balance sm:text-2xl" aria-live="polite">
        {text.title}
      </h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{text.detail}</p>

      <div className="relative mt-6 overflow-x-auto">
        <div className="min-w-[30rem]">
          <div
            role="img"
            aria-label={`주차별 예상 시간. ${after.weeks.map((w) => `${w.week}주 ${w.total_hours}시간 ${WEATHER[w.level].label}`).join(", ")}`}
            className="relative h-56"
          >
            <div className="absolute inset-0 grid grid-cols-16 items-end gap-1.5">
              {after.weeks.map((w, i) => {
                const b = before.weeks[i].total_hours;
                const a = w.total_hours;
                const style = WEATHER[w.level];
                return (
                  <div key={w.week} className="relative flex h-full flex-col justify-end">
                    {b > a ? (
                      <div className="absolute inset-x-0 rounded-t-sm border border-dashed border-muted-foreground/60" style={{ bottom: 0, height: pct(b) }} />
                    ) : null}
                    {a > b ? <div className={cn("rounded-t-sm border border-b-0", style.hatch, "border-current", style.text)} style={{ height: pct(a - b) }} /> : null}
                    <div className={cn(style.bar, a <= b && "rounded-t-sm")} style={{ height: pct(Math.min(a, b)) }} />
                  </div>
                );
              })}
            </div>
            <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-foreground/70" style={{ bottom: pct(available) }} />
          </div>
          <div className="mt-2 grid grid-cols-16 gap-1.5 text-center text-xs text-muted-foreground" aria-hidden="true">
            {after.weeks.map((w) => (
              <span key={w.week} className={cn(w.level === "storm" && "font-bold text-storm")}>
                {w.week}
              </span>
            ))}
          </div>
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <li className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-caution" aria-hidden="true" />
          지금 계획
        </li>
        {hasDraft ? (
          <li className="inline-flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-sm border border-caution", WEATHER.cloudy.hatch)} aria-hidden="true" />
            {mode === "add" ? `${label} 추가분` : "바뀐 시간"}
          </li>
        ) : null}
        <li className="inline-flex items-center gap-1.5">
          <span className="w-4 border-t border-dashed border-foreground/70" aria-hidden="true" />
          가용 {available}시간
        </li>
      </ul>

      <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(["storm", "cloudy", "clear"] as const).map((level) => (
          <div key={level} className={cn("rounded-lg px-4 py-3", WEATHER[level].tile)}>
            <dt className={cn("text-xs font-semibold", WEATHER[level].text)}>{WEATHER[level].label}</dt>
            <dd className="mt-1 text-lg font-bold tabular-nums">{delta(before.summary[level], after.summary[level])}</dd>
          </div>
        ))}
        <div className="rounded-lg bg-secondary px-4 py-3">
          <dt className="text-xs font-semibold text-muted-foreground">가장 바쁜 주</dt>
          <dd className="mt-1 text-lg font-bold tabular-nums">{peakB === peakA ? `${peakA}시간` : `${peakB} → ${peakA}시간`}</dd>
        </div>
      </dl>
    </>
  );
}
