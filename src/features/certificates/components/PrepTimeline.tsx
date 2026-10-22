import { TOTAL_WEEKS, type CertificatePrepRange } from "@/features/forecast/calc";
import { cn } from "@/lib/utils";
import { prepWeeksLabel } from "../display";

const WEEKS = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);

type Props = {
  range: CertificatePrepRange;
  /** 오늘이 몇 주차인지 (학기 밖이면 null) */
  currentWeek: number | null;
  className?: string;
};

/** 16주 위에 준비 기간(연한 칸)·시험 주(진한 칸)·이번 주를 표시 (FR-04-3, FR-04-6) */
export function PrepTimeline({ range, currentWeek, className }: Props) {
  const prep = new Set(range.weeks);
  const examInSemester = range.exam_week >= 1 && range.exam_week <= TOTAL_WEEKS;
  const label =
    range.coverage === "out"
      ? "이번 학기 16주에는 준비 기간이 없어요."
      : `16주 중 준비 기간 ${prepWeeksLabel(range)}${examInSemester ? `, 시험 ${range.exam_week}주차` : ""}`;

  return (
    <div className={className}>
      <div role="img" aria-label={label} className="grid grid-cols-16 gap-[3px]">
        {WEEKS.map((w) => (
          <span
            key={w}
            className={cn(
              "h-6 rounded-[3px]",
              w === range.exam_week ? "bg-ink" : prep.has(w) ? "bg-primary/45" : "bg-secondary",
              w === currentWeek && "ring-2 ring-primary ring-offset-1 ring-offset-card",
            )}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground" aria-hidden="true">
        <span>1주</span>
        <span>{TOTAL_WEEKS}주</span>
      </div>
      <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-muted-foreground" aria-hidden="true">
        {range.weeks.length ? (
          <li className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-primary/45" />
            준비 기간
          </li>
        ) : null}
        {examInSemester ? (
          <li className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-ink" />
            시험 {range.exam_week}주차
          </li>
        ) : null}
        {currentWeek ? (
          <li className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm ring-2 ring-primary" />
            이번 주({currentWeek}주차)
          </li>
        ) : null}
      </ul>
    </div>
  );
}
