import type { Forecast } from "../calc";
import { formatDday } from "../calc";
import { nextWeekWith } from "../outlook";
import { summaryText } from "../weather";
import { cn } from "@/lib/utils";

type Props = {
  forecast: Forecast;
  /** 기준 주 (이번 주, 학기 밖이면 1주차) */
  week: number;
  /** 내 자격증 중 가장 가까운 시험 (없으면 null) */
  nextExam: { name: string; days: number } | null;
  /** 학기 시험 주간 중 다음 것 (없으면 null) */
  nextSemesterExam: { label: string; week: number } | null;
  /** 가장 가까운 접수 마감 (없으면 null) */
  nextDeadline: { name: string; days: number } | null;
  /** PC 첫 줄 오른쪽 2×2 처럼 칸 배치를 바꿀 때 (10/28 시안) */
  className?: string;
};

/** 날씨 앱의 "자외선·습도" 칸 자리 — 한눈에 보는 정보 4칸 (10/28). 휴대폰 2×2, PC 한 줄 */
export function ForecastTiles({ forecast, week, nextExam, nextSemesterExam, nextDeadline, className }: Props) {
  const current = forecast.weeks[week - 1];
  const clear = current?.level === "clear" ? week : nextWeekWith(forecast.weeks, week, "clear");

  const tiles = [
    { label: "이번 학기", value: summaryText(forecast.summary) },
    {
      label: "다가오는 시험",
      value: nextExam
        ? `${nextExam.name} ${formatDday(nextExam.days)}`
        : nextSemesterExam
          ? `${nextSemesterExam.label} · ${nextSemesterExam.week}주차`
          : "없어요",
    },
    { label: "접수 마감", value: nextDeadline ? `${nextDeadline.name} ${formatDday(nextDeadline.days)}` : "없어요" },
    { label: "다음 맑은 주", value: clear === null ? "남은 학기엔 없어요" : clear === week ? "이번 주" : `${clear}주차` },
  ];

  return (
    <dl className={cn("grid grid-cols-2 gap-2.5 lg:grid-cols-4", className)}>
      {tiles.map((t) => (
        <div key={t.label} className="grid content-center gap-1 rounded-2xl border border-border bg-card px-4 py-3">
          <dt className="text-xs text-muted-foreground">{t.label}</dt>
          <dd className="text-[15px] leading-snug font-semibold">{t.value}</dd>
        </div>
      ))}
    </dl>
  );
}
