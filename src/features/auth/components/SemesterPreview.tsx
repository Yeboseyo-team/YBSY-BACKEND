import { TOTAL_WEEKS, WEEKDAY_LABELS, weekdayIndex } from "@/features/forecast/calc";
import { cn } from "@/lib/utils";
import { shortDate } from "../semester";

type Props = {
  semesterStart?: string;
  midtermWeek?: number;
  finalWeek?: number;
  className?: string;
};

const WEEKS = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);
const isWeek = (w: number | undefined): w is number => Number.isInteger(w) && w! >= 1 && w! <= TOTAL_WEEKS;

/** 온보딩 미리보기: 1주차 날짜와 시험 주간을 16칸 위에 보여 줍니다. */
export function SemesterPreview({ semesterStart, midtermWeek, finalWeek, className }: Props) {
  // 10/24 QA: 개강일이 1주차 첫날 (월요일로 당기지 않음)
  const start = semesterStart && /^\d{4}-\d{2}-\d{2}$/.test(semesterStart) ? semesterStart : undefined;
  const captions: Record<number, string> = { 1: start ? `1주 ${shortDate(start)}` : "1주" };
  if (isWeek(midtermWeek)) captions[midtermWeek] = "중간";
  if (isWeek(finalWeek)) captions[finalWeek] = "기말";
  const isExam = (w: number) => w === midtermWeek || w === finalWeek;
  const [, m, d] = start ? start.split("-").map(Number) : [];
  const weekday = start ? WEEKDAY_LABELS[weekdayIndex(start)] : "";

  return (
    <section className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <h2 className="text-sm font-semibold">이렇게 학기를 나눠요</h2>
      <div
        className="mt-3 grid grid-cols-16 gap-[3px]"
        role="img"
        aria-label={`16주 학기. 중간고사 ${midtermWeek ?? "-"}주차, 기말고사 ${finalWeek ?? "-"}주차`}
      >
        {WEEKS.map((w) => (
          <span key={w} className={cn("h-7 rounded-[3px]", isExam(w) ? "bg-ink" : "bg-secondary")} />
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-16 gap-[3px] text-[11px] text-muted-foreground" aria-hidden="true">
        {WEEKS.map((w) => (
          <span key={w} className="overflow-visible whitespace-nowrap">
            {captions[w] ?? ""}
          </span>
        ))}
      </div>
      <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
        {start ? `${m}월 ${d}일(${weekday})부터 7일씩 1주차, 2주차로 세요. ` : "개강일을 고르면 1주차가 정해져요. "}
        진한 칸은 시험 주간이에요. 시험 주간에는 수업 시간을 1.5배로 계산해요.
      </p>
    </section>
  );
}
