import { cn } from "@/lib/utils";

/**
 * 로그인 화면 왼쪽에 보이는 "예시 학기" 예보 막대.
 * 실제 서비스의 부담 예보(F-05)와 같은 판정 기준을 씁니다.
 *   가용 시간 대비 80% 미만 맑음 / 80~100% 흐림 / 100% 초과 폭풍
 */
const AVAILABLE = 50;
const SCALE_MAX = 66;
const SAMPLE_WEEKS = [24, 28, 31, 35, 38, 42, 45, 61, 41, 36, 39, 43, 48, 55, 64, 30];

function level(hours: number) {
  const ratio = hours / AVAILABLE;
  if (ratio > 1) return "storm";
  if (ratio >= 0.8) return "caution";
  return "clear";
}

const barColor = {
  clear: "bg-clear",
  caution: "bg-caution",
  storm: "bg-storm",
} as const;

export function ForecastStrip({ className }: { className?: string }) {
  const lineBottom = `${(AVAILABLE / SCALE_MAX) * 100}%`;

  return (
    <figure className={cn("w-full", className)}>
      <div className="relative h-24 sm:h-44" aria-hidden="true">
        <div className="absolute inset-0 flex items-end gap-[3px] sm:gap-1">
          {SAMPLE_WEEKS.map((h, i) => (
            <div
              key={i}
              className={cn("forecast-bar flex-1 rounded-t-[3px]", barColor[level(h)])}
              style={{ height: `${(h / SCALE_MAX) * 100}%`, animationDelay: `${i * 35}ms` }}
            />
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-white/70"
          style={{ bottom: lineBottom }}
        />
        <span
          className="absolute left-0 -translate-y-full pb-1 text-[11px] text-white/70"
          style={{ bottom: lineBottom }}
        >
          가용 {AVAILABLE}시간
        </span>
      </div>
      <figcaption className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/75">
        <span className="sr-only">예시 학기 16주 중 8주차와 14·15주차가 가용 시간을 넘는 폭풍 주간입니다.</span>
        <Legend className="bg-clear" label="맑음, 여유" />
        <Legend className="bg-caution" label="흐림, 주의" />
        <Legend className="bg-storm" label="폭풍, 과부하" />
        <span className="ml-auto text-white/60" aria-hidden="true">
          예시 학기
        </span>
      </figcaption>
    </figure>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden="true">
      <span className={cn("size-2.5 rounded-sm", className)} />
      {label}
    </span>
  );
}
