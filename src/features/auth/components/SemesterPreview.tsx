import { TOTAL_WEEKS } from "@/features/forecast/calc";
import { toMonday } from "@/features/auth/onboarding";
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
  const monday = semesterStart && /^\d{4}-\d{2}-\d{2}$/.test(semesterStart) ? toMonday(semesterStart) : undefined;
  const captions: Record<number, string> = { 1: monday ? `1주 ${shortDate(monday)}` : "1주" };
  if (isWeek(midtermWeek)) captions[midtermWeek] = "중간";
  if (isWeek(finalWeek)) captions[finalWeek] = "기말";
  const isExam = (w: number) => w === midtermWeek || w === finalWeek;
  const [, m, d] = monday ? monday.split("-").map(Number) : [];

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
        {monday ? `${m}월 ${d}일(월)이 들어 있는 주가 1주차, ` : "개강일을 고르면 1주차가 정해져요. "}
        진한 칸은 시험 주간이에요. 시험 주간에는 수업 시간을 1.5배로 계산해요.
      </p>
    </section>
  );
}
