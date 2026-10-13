import { cn } from "@/lib/utils";

type Props = {
  /** 화면 읽기 프로그램이 읽을 요약. 예: "1~16주차, 중간고사 8주차, 기말고사 15주차" */
  label: string;
  weeks?: number;
  /** 칠할 기간 (계획 기간, 자격증 준비 기간) */
  range?: { start: number; end: number };
  /** 진하게 강조할 주 (시험 주간, 시험일) */
  marks?: number[];
  /** 이번 주 */
  current?: number;
  /** 칸 아래에 붙일 글자. 키는 주차 */
  captions?: Record<number, string>;
  size?: "sm" | "md";
  className?: string;
};

/** 16주를 칸으로 보여 주는 띠. 온보딩 미리보기, 계획 기간, 자격증 준비 기간에 씁니다. */
export function WeekRangeStrip({
  label,
  weeks = 16,
  range,
  marks = [],
  current,
  captions,
  size = "md",
  className,
}: Props) {
  const cells = Array.from({ length: weeks }, (_, i) => i + 1);
  const columns = { gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` };

  return (
    <figure className={cn("w-full", className)}>
      <div role="img" aria-label={label} className={cn("grid", size === "sm" ? "gap-0.5" : "gap-1")} style={columns}>
        {cells.map((week) => {
          const inRange = range ? week >= range.start && week <= range.end : false;
          const marked = marks.includes(week);
          return (
            <span
              key={week}
              className={cn(
                "block rounded-sm",
                size === "sm" ? "h-2" : "h-8 rounded-md",
                marked ? "bg-ink" : inRange ? "bg-primary" : "bg-muted",
                week === current && "ring-2 ring-ink ring-offset-1 ring-offset-card",
              )}
            />
          );
        })}
      </div>
      {captions ? (
        <figcaption aria-hidden="true" className="mt-2 grid text-xs font-semibold" style={columns}>
          {Object.entries(captions).map(([week, text]) => {
            const n = Number(week);
            return (
              <span
                key={week}
                className={cn("whitespace-nowrap", n > weeks / 2 ? "justify-self-end" : n > 1 && "justify-self-center")}
                style={{ gridColumnStart: n, gridRowStart: 1 }}
              >
                {text}
              </span>
            );
          })}
        </figcaption>
      ) : null}
    </figure>
  );
}
