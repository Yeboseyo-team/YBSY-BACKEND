import { useMemo } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadError } from "@/components/LoadError";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { useForecastData } from "@/features/forecast/api";
import { recommendRounds, type RoundRecommendation } from "@/features/forecast/calc";
import { cn } from "@/lib/utils";
import { toCertificateMessage, useAddCertificate, useRemoveMyCertificate } from "../api";
import { applyBadge, examLabel, prepWeeksLabel, withJosa } from "../display";
import { ApplyBadge } from "./ApplyBadge";
import { PrepTimeline } from "./PrepTimeline";

type Props = {
  /** 추천할 자격증 이름 (예: "정보처리기사") */
  name: string;
  /** 회차를 바꾼 뒤 → 내 자격증 목록으로 */
  onChanged: (message: string) => void;
};

/** 시험 회차 추천 (PcRoundSuggest, F-09, FR-09-1) — 계산은 calc.ts 의 recommendRounds 결과만 씁니다 */
export function RoundSuggest({ name, onChanged }: Props) {
  const data = useForecastData();
  const recs = useMemo(
    () => (data.input ? recommendRounds({ ...data.input, certificates: data.certificates, name, today: data.today }) : []),
    [data.input, data.certificates, name, data.today],
  );

  if (data.status === "loading") {
    return (
      <div className="grid gap-4 lg:grid-cols-2" aria-busy="true" aria-label="회차 추천을 계산하는 중">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }
  if (data.status === "error" || !data.input) {
    return <LoadError what="회차 추천" retrying={false} onRetry={data.refetch} />;
  }

  const current = recs.find((r) => r.is_current) ?? null;
  const currentMine = data.userCertificates.find((uc) => uc.certificate_id === current?.certificate.id);
  const best = recs[0];

  if (recs.length === 0 || (recs.length === 1 && current)) {
    return (
      <section className="grid justify-items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
        <p className="font-semibold">비교할 다른 회차가 없어요</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {withJosa(name, "은", "는")} 지금 고를 수 있는 다른 회차가 없어요. 다음 회차 공고가 올라오면 다시 비교해 보세요.
        </p>
        <Button asChild variant="outline" className="mt-2">
          <Link to="/certificates">내 자격증으로</Link>
        </Button>
      </section>
    );
  }

  return (
    <div className="grid gap-6">
      {current && !best.is_current && best.storm_weeks < current.storm_weeks ? (
        <FormAlert tone="info">
          {best.certificate.round} 회차로 미루면 폭풍 {current.storm_weeks}주 → {best.storm_weeks}주로 줄어요.
        </FormAlert>
      ) : current?.storm_weeks === best.storm_weeks ? (
        <FormAlert tone="info">지금 고른 회차가 이미 폭풍이 가장 적은 회차예요.</FormAlert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        {recs.map((rec, i) => (
          <RoundCard
            key={rec.certificate.id}
            rec={rec}
            recommended={i === 0 && !rec.is_current}
            current={current}
            currentWeek={data.currentWeek}
            today={data.today}
            prepWeeks={currentMine?.prep_weeks}
            studyHours={currentMine?.study_hours}
            onChanged={onChanged}
          />
        ))}
      </div>

      <p className="text-[13px] text-muted-foreground">
        접수 기간이 끝난 회차는 추천하지 않아요. 지금 고른 회차의 준비 기간·공부 시간으로 똑같이 비교했어요. 최종 일정은 시행 기관에서 확인하세요.
      </p>
    </div>
  );
}

type CardProps = {
  rec: RoundRecommendation;
  recommended: boolean;
  current: RoundRecommendation | null;
  currentWeek: number | null;
  today: string;
  /** 지금 고른 회차의 준비 기간·공부 시간 (없으면 회차 기본값) */
  prepWeeks?: number;
  studyHours?: number;
  onChanged: (message: string) => void;
};

function RoundCard({ rec, recommended, current, currentWeek, today, prepWeeks, studyHours, onChanged }: CardProps) {
  const { certificate, prep_range: range, storm_weeks, is_current } = rec;
  const add = useAddCertificate();
  const remove = useRemoveMyCertificate();
  const pending = add.isPending || remove.isPending;
  const error = add.error ?? remove.error;
  const label = `${certificate.name} ${certificate.round}`;
  const titleId = `round-${certificate.id}`;

  const choose = () => {
    if (pending) return;
    add.mutate(
      {
        certificate,
        prep_weeks: prepWeeks ?? certificate.prep_weeks,
        study_hours: studyHours ?? certificate.default_study_hours,
      },
      {
        onSuccess: () => {
          if (!current) {
            onChanged(`${withJosa(label, "을", "를")} 추가했어요. 예보에 바로 반영돼요.`);
            return;
          }
          // 회차 바꾸기: 새 회차를 저장한 뒤 예전 회차를 해제
          remove.mutate(current.certificate.id, {
            onSuccess: () => onChanged(`${withJosa(label, "으로", "로")} 바꿨어요. 예보에 바로 반영돼요.`),
            onError: () =>
              onChanged(`${withJosa(label, "을", "를")} 추가했어요. 예전 회차(${current.certificate.round})는 내 자격증에서 직접 해제해 주세요.`),
          });
        },
      },
    );
  };

  const explanation =
    range.coverage === "out"
      ? "이번 학기 범위 밖이라 이번 학기 부담이 없어요. 대신 준비 기간이 다음 학기로 넘어가요."
      : range.coverage === "partial"
        ? `준비 기간 중 ${prepWeeksLabel(range)}만 이번 학기에 걸쳐요.`
        : `${prepWeeksLabel(range)} 동안 준비하고 ${examLabel(certificate.exam_date, range, today)}에 시험을 봐요.`;

  return (
    <article
      aria-labelledby={titleId}
      className={cn("grid content-start gap-4 rounded-xl bg-card p-5 sm:p-6", recommended ? "border-2 border-ink" : "border border-border")}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 id={titleId} className="text-lg font-semibold">
            {certificate.round}
            {is_current ? <span className="ml-1.5 text-sm font-normal text-muted-foreground">(현재 선택)</span> : null}
          </h2>
          <p className="text-sm text-muted-foreground">
            {examLabel(certificate.exam_date, range, today)} · 준비 {prepWeeksLabel(range)}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {recommended ? (
            <span className="inline-flex h-6 items-center rounded-full bg-ink px-2.5 text-xs font-bold text-white">추천</span>
          ) : null}
          <ApplyBadge {...applyBadge(certificate, rec.status, today)} />
        </div>
      </div>

      <div className={cn("rounded-lg px-4 py-3", storm_weeks > 0 ? "bg-storm/10" : "bg-secondary")}>
        <p className={cn("text-[13px] font-semibold", storm_weeks > 0 ? "text-storm" : "text-muted-foreground")}>폭풍</p>
        <p className="mt-0.5 text-lg font-bold">이 회차로 준비하면 폭풍 {storm_weeks}주</p>
      </div>

      <PrepTimeline range={range} currentWeek={currentWeek} />
      <p className={range.coverage === "out" ? "text-sm font-medium" : "text-[13px] text-muted-foreground"}>{explanation}</p>

      {error ? <FormAlert>{toCertificateMessage(error)}</FormAlert> : null}

      {is_current ? (
        <Button asChild size="lg" variant="outline">
          <Link to="/certificates">지금 회차 유지</Link>
        </Button>
      ) : (
        <Button type="button" size="lg" variant={recommended ? "default" : "outline"} disabled={pending} onClick={choose}>
          {pending ? "저장하는 중…" : current ? "이 회차로 바꾸기" : "이 회차 고르기"}
        </Button>
      )}
    </article>
  );
}
