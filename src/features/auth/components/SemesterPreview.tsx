import { WeekRangeStrip } from "@/components/ui/week-range-strip";
import { mondayOf, SEMESTER_WEEKS, shortDate } from "../semester";

type Props = {
  semesterStart?: string;
  midtermWeek?: number;
  finalWeek?: number;
};

/** 온보딩 왼쪽 미리보기: 1주차 날짜와 시험 주간을 16칸 위에 보여 줍니다. */
export function SemesterPreview({ semesterStart, midtermWeek, finalWeek }: Props) {
  const monday = semesterStart && /^\d{4}-\d{2}-\d{2}$/.test(semesterStart) ? mondayOf(semesterStart) : undefined;
  const isWeek = (w: number | undefined): w is number => Number.isInteger(w) && w! >= 1 && w! <= SEMESTER_WEEKS;
  const marks = [midtermWeek, finalWeek].filter(isWeek);

  const captions: Record<number, string> = { 1: monday ? `1주 ${shortDate(monday)}` : "1주" };
  if (isWeek(midtermWeek)) captions[midtermWeek] = "중간";
  if (isWeek(finalWeek)) captions[finalWeek] = "기말";

  const [, m, d] = monday ? monday.split("-").map(Number) : [];

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold">이렇게 학기를 나눠요</h2>
      <WeekRangeStrip
        className="mt-3"
        marks={marks}
        captions={captions}
        label={`16주 학기. 중간고사 ${midtermWeek ?? "-"}주차, 기말고사 ${finalWeek ?? "-"}주차`}
      />
      <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
        {monday ? `${m}월 ${d}일(월)이 들어 있는 주가 1주차, ` : "개강일을 고르면 1주차가 정해져요. "}
        진한 칸은 시험 주간이에요. 시험 주간에는 수업 시간을 1.5배로 계산해요.
      </p>
    </section>
  );
}
