import { useState } from "react";
import { Link } from "react-router";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { applyStatus, certificatePrepRange } from "@/features/forecast/calc";
import type { Certificate, UserCertificate } from "@/types/database";
import { toCertificateMessage, useRemoveMyCertificate, useUpdateMyCertificate } from "../api";
import { applyBadge, examLabel, prepSentence, prepWeeksLabel, validatePrep } from "../display";
import { ApplyBadge } from "./ApplyBadge";
import { PrepInputs } from "./PrepInputs";
import { PrepTimeline } from "./PrepTimeline";

type Props = {
  mine: UserCertificate;
  certificate: Certificate;
  semesterStart: string;
  today: string;
  currentWeek: number | null;
};

/** 내가 고른 회차 한 장 (PcMyCertificates): 일정·준비 기간·시간 바꾸기·선택 해제 */
export function MyCertificateCard({ mine, certificate, semesterStart, today, currentWeek }: Props) {
  const [mode, setMode] = useState<"view" | "edit" | "confirm-remove">("view");
  const [prepWeeks, setPrepWeeks] = useState(mine.prep_weeks);
  const [studyHours, setStudyHours] = useState(mine.study_hours);
  const update = useUpdateMyCertificate();
  const remove = useRemoveMyCertificate();

  const shownPrep = mode === "edit" ? prepWeeks : mine.prep_weeks;
  const shownStudy = mode === "edit" ? studyHours : mine.study_hours;
  const range = certificatePrepRange(certificate.exam_date, Number.isInteger(shownPrep) ? shownPrep : 1, semesterStart);
  const badge = applyBadge(certificate, applyStatus(certificate, today), today);
  const titleId = `my-cert-${certificate.id}`;
  const error = update.error ?? remove.error;

  const startEdit = () => {
    update.reset();
    setPrepWeeks(mine.prep_weeks);
    setStudyHours(mine.study_hours);
    setMode("edit");
  };

  return (
    <article aria-labelledby={titleId} className="grid content-start gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 id={titleId} className="text-lg font-semibold">
            {certificate.name}
          </h3>
          <p className="text-sm text-muted-foreground">{certificate.round}</p>
        </div>
        <ApplyBadge {...badge} />
      </div>

      <dl className="grid grid-cols-3 gap-3 text-sm">
        <div className="grid gap-0.5">
          <dt className="text-muted-foreground">시험</dt>
          <dd className="font-medium">{examLabel(certificate.exam_date, range, today).replace(/^시험 /, "")}</dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-muted-foreground">준비 기간</dt>
          <dd className="font-medium">{prepWeeksLabel(range)}</dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-muted-foreground">한 주 공부</dt>
          <dd className="font-medium">{Number.isNaN(shownStudy) ? "-" : shownStudy}시간</dd>
        </div>
      </dl>

      <PrepTimeline range={range} currentWeek={currentWeek} />
      <p className={range.coverage === "out" ? "text-sm font-medium" : "text-[13px] text-muted-foreground"}>
        {prepSentence(range, shownStudy, currentWeek)}
      </p>

      {error ? <FormAlert>{toCertificateMessage(error)}</FormAlert> : null}

      {mode === "edit" ? (
        <form
          noValidate
          className="grid gap-4 rounded-lg border border-border bg-background p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (validatePrep(prepWeeks, studyHours)) return;
            update.mutate(
              { certificate_id: mine.certificate_id, prep_weeks: prepWeeks, study_hours: studyHours },
              { onSuccess: () => setMode("view") },
            );
          }}
        >
          <PrepInputs
            idPrefix={`edit-${certificate.id}`}
            prepWeeks={prepWeeks}
            studyHours={studyHours}
            onPrepWeeksChange={setPrepWeeks}
            onStudyHoursChange={setStudyHours}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={update.isPending || Boolean(validatePrep(prepWeeks, studyHours))}>
              {update.isPending ? "저장하는 중…" : "저장"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setMode("view")} disabled={update.isPending}>
              취소
            </Button>
            <Button asChild variant="ghost" className="ml-auto">
              <Link to={`/certificates?view=add&name=${encodeURIComponent(certificate.name)}`}>다른 회차로 바꾸기</Link>
            </Button>
          </div>
        </form>
      ) : mode === "confirm-remove" ? (
        <div role="alertdialog" aria-labelledby={`${titleId}-remove`} className="grid gap-3 rounded-lg border border-storm/30 bg-storm/5 p-4">
          <p id={`${titleId}-remove`} className="text-sm">
            {certificate.name} {certificate.round} 선택을 해제할까요? 준비 시간이 예보에서 바로 빠져요.
          </p>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => remove.mutate(certificate.id, { onError: () => setMode("view") })}
            >
              {remove.isPending ? "해제하는 중…" : "선택 해제"}
            </Button>
            <Button variant="outline" onClick={() => setMode("view")} disabled={remove.isPending}>
              취소
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={startEdit}>
            회차·시간 바꾸기
          </Button>
          <Button
            variant="ghost"
            className="text-storm hover:text-storm"
            onClick={() => {
              remove.reset();
              setMode("confirm-remove");
            }}
          >
            선택 해제
          </Button>
          {certificate.source_url ? (
            <a
              href={certificate.source_url}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              공고 보기 <ExternalLink className="size-3.5" aria-hidden="true" />
              <span className="sr-only">(새 창)</span>
            </a>
          ) : null}
        </div>
      )}
    </article>
  );
}
