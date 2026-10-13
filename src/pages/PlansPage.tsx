import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { WeekRangeStrip } from "@/components/ui/week-range-strip";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/features/auth/auth-context";
import { useProfile } from "@/features/auth/api";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { toCertificateMessage, useMyCertificates, useRemoveMyCertificate } from "@/features/certificates/api";
import { toForecastCertificates } from "@/features/certificates/utils";
import { calculateForecast, certificatePrepRange, isSemesterReady } from "@/features/forecast/calc";
import { objectParticle } from "@/features/forecast/preview-text";
import { toPlanMessage, useDeletePlan, usePlans } from "@/features/plans/api";
import { MAX_PLANS } from "@/features/plans/schemas";
import { PLAN_TYPE_LABEL } from "@/features/plans/types";
import { cn } from "@/lib/utils";

type Row = {
  key: string;
  title: string;
  kind: "class" | "activity" | "project" | "certificate";
  range: { start: number; end: number } | null;
  hours: number;
  editTo: string;
  onDelete: () => void;
};

const KIND_LABEL = { ...PLAN_TYPE_LABEL, certificate: "자격증" };
const KIND_BADGE = {
  class: "bg-secondary text-secondary-foreground",
  activity: "bg-caution/15 text-foreground",
  project: "bg-clear/15 text-foreground",
  certificate: "bg-accent text-primary",
};

type Pending = { kind: "plan" | "certificate"; id: string; title: string; detail: string };

/** 계획 목록 (PcPlanList, FR-02-4) */
export default function PlansPage() {
  const { user } = useAuth();
  const profile = useProfile(user?.id);
  const plans = usePlans();
  const mine = useMyCertificates();
  const deletePlan = useDeletePlan();
  const removeCert = useRemoveMyCertificate();
  const [pending, setPending] = useState<Pending | null>(null);

  const semesterStart = profile.data?.semester_start;

  const rows: Row[] = useMemo(() => {
    const planRows: Row[] = (plans.data ?? []).map((p) => ({
      key: p.id,
      title: p.title,
      kind: p.type,
      range: { start: p.start_week, end: p.end_week },
      hours: p.hours_per_week,
      editTo: `/plans/${p.id}`,
      onDelete: () =>
        setPending({
          kind: "plan",
          id: p.id,
          title: p.title,
          detail: `${p.start_week}~${p.end_week}주차에서 한 주 ${p.hours_per_week}시간이 빠져요. 삭제한 계획은 되돌릴 수 없어요.`,
        }),
    }));
    const certRows: Row[] = (mine.data ?? []).map((c) => {
      const range = semesterStart ? certificatePrepRange(c.certificate.exam_date, c.prep_weeks, semesterStart) : null;
      const title = `${c.certificate.name} 준비`;
      return {
        key: `cert-${c.certificate_id}`,
        title,
        kind: "certificate" as const,
        range: range && range.weeks.length > 0 ? { start: range.weeks[0], end: range.weeks[range.weeks.length - 1] } : null,
        hours: c.study_hours,
        editTo: `/certificates/add?id=${c.certificate_id}`,
        onDelete: () =>
          setPending({
            kind: "certificate",
            id: c.certificate_id,
            title,
            detail: `${c.certificate.round} 선택을 해제하면 준비 기간이 예보에서 빠져요.`,
          }),
      };
    });
    return [...planRows, ...certRows];
  }, [plans.data, mine.data, semesterStart]);

  const average = useMemo(() => {
    if (!profile.data || !plans.data || !mine.data || !isSemesterReady(profile.data)) return null;
    const forecast = calculateForecast({ profile: profile.data, plans: plans.data, ...toForecastCertificates(mine.data) });
    const sum = forecast.weeks.reduce((s, w) => s + w.total_hours, 0);
    return Math.round((sum / forecast.weeks.length) * 10) / 10;
  }, [profile.data, plans.data, mine.data]);

  const loading = plans.isPending || mine.isPending;
  const loadError = plans.error ?? mine.error;
  const actionError = deletePlan.error ? toPlanMessage(deletePlan.error) : removeCert.error ? toCertificateMessage(removeCert.error) : null;
  const full = (plans.data?.length ?? 0) >= MAX_PLANS;

  return (
    <PageContainer>
      <PageHeader
        title="계획"
        description={
          loading
            ? "계획을 불러오는 중…"
            : rows.length === 0
              ? "아직 넣은 계획이 없어요."
              : `계획 ${rows.length}개${average !== null ? `, 한 주 평균 ${average}시간이에요.` : ""}`
        }
        action={
          full ? (
            <p className="text-sm text-muted-foreground">계획은 {MAX_PLANS}개까지 넣을 수 있어요.</p>
          ) : (
            <Button asChild>
              <Link to="/plans/new">
                <Plus aria-hidden="true" />
                계획 추가
              </Link>
            </Button>
          )
        }
      />

      {loadError ? <FormAlert>계획을 불러오지 못했어요. 새로고침한 뒤 다시 시도하세요.</FormAlert> : null}
      {actionError ? <FormAlert>{actionError}</FormAlert> : null}

      {!loading && rows.length === 0 && !loadError ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="font-semibold">수업부터 넣어 보세요</p>
          <p className="mt-1 text-sm text-muted-foreground">과목과 학점만 넣으면 한 주 시간이 정해져요.</p>
          <Button asChild className="mt-5">
            <Link to="/plans/new">계획 추가</Link>
          </Button>
        </div>
      ) : null}

      {rows.length > 0 ? (
        <div className="relative overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[40rem] text-sm">
            <caption className="sr-only">내 계획과 자격증 준비 목록</caption>
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th scope="col" className="px-6 py-4 font-semibold">계획</th>
                <th scope="col" className="px-3 py-4 font-semibold">유형</th>
                <th scope="col" className="px-3 py-4 font-semibold">기간 (1~16주)</th>
                <th scope="col" className="px-3 py-4 text-right font-semibold">한 주</th>
                <th scope="col" className="px-6 py-4 text-right font-semibold">
                  <span className="sr-only">관리</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-border last:border-0">
                  <th scope="row" className="max-w-56 truncate px-6 py-3.5 text-left font-semibold">
                    {row.title}
                  </th>
                  <td className="px-3 py-3.5">
                    <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap", KIND_BADGE[row.kind])}>
                      {KIND_LABEL[row.kind]}
                    </span>
                  </td>
                  <td className="w-[45%] px-3 py-3.5">
                    <div className="flex items-center gap-3">
                      <WeekRangeStrip
                        size="sm"
                        className="flex-1"
                        range={row.range ?? undefined}
                        label={row.range ? `${row.range.start}~${row.range.end}주` : "이번 학기 범위 밖"}
                      />
                      <span className="w-16 shrink-0 text-xs text-muted-foreground tabular-nums">
                        {row.range ? `${row.range.start}~${row.range.end}주` : "학기 밖"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-right font-semibold tabular-nums whitespace-nowrap">{row.hours}시간</td>
                  <td className="px-6 py-3.5">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" aria-label={`${row.title} 수정`}>
                        <Link to={row.editTo}>
                          <Pencil aria-hidden="true" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`${row.title} 삭제`} onClick={row.onDelete}>
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {(mine.data?.length ?? 0) > 0 ? (
        <p className="text-[13px] text-muted-foreground">
          자격증 준비는 자격증 메뉴에서 고른 회차로 자동으로 들어와요. 기간과 공부 시간은 자격증 화면에서 바꿀 수 있어요.
        </p>
      ) : null}

      <ConfirmDialog
        open={pending !== null}
        destructive
        title={pending ? `${pending.title}${objectParticle(pending.title)} ${pending.kind === "plan" ? "삭제할까요?" : "목록에서 뺄까요?"}` : ""}
        description={pending?.detail}
        confirmLabel={pending?.kind === "plan" ? "삭제" : "선택 해제"}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending?.kind === "plan") deletePlan.mutate(pending.id);
          else if (pending) removeCert.mutate(pending.id);
          setPending(null);
        }}
      />
    </PageContainer>
  );
}
