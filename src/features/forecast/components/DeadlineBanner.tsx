import { BellRing, ChevronRight } from "lucide-react";
import { formatDday, semesterWeekOf, type DeadlineAlert } from "../calc";

type Props = {
  deadlines: DeadlineAlert[];
  semesterStart: string;
};

/** 접수 마감 알림 배너 (F-07 화면 알림). 마감이 가까운 순서로, 없으면 아무것도 그리지 않아요. */
export function DeadlineBanner({ deadlines, semesterStart }: Props) {
  if (deadlines.length === 0) return null;

  return (
    <ul className="grid gap-2" aria-label="접수 마감 알림">
      {deadlines.map(({ certificate, apply_dday }) => {
        const examWeek = semesterWeekOf(certificate.exam_date, semesterStart);
        const examText = examWeek ? `시험은 ${examWeek}주차` : `시험 ${certificate.exam_date.slice(5).replace("-", "/")}`;
        const body = (
          <>
            <BellRing className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="grid min-w-0 flex-1 gap-0.5">
              <span className="text-[15px] font-semibold">
                {certificate.name} {certificate.round} 접수 마감 {formatDday(apply_dday)}
              </span>
              <span className="text-[13px] text-muted-foreground">
                {examText}
                {certificate.source_url ? " · 접수하러 가기" : ""}
              </span>
            </span>
          </>
        );
        const boxClass = "flex min-h-16 items-center gap-3 rounded-2xl bg-accent px-4 py-3 text-foreground sm:px-5";
        return (
          <li key={certificate.id}>
            {certificate.source_url ? (
              <a
                href={certificate.source_url}
                target="_blank"
                rel="noreferrer"
                className={`${boxClass} outline-none hover:bg-accent/70 focus-visible:ring-2 focus-visible:ring-ring`}
              >
                {body}
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </a>
            ) : (
              <div className={boxClass}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
