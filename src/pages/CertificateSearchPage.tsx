import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WeekRangeStrip } from "@/components/ui/week-range-strip";
import { NumberStepper } from "@/components/form/NumberStepper";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/features/auth/auth-context";
import { useProfile } from "@/features/auth/api";
import { FormAlert } from "@/features/auth/components/FormAlert";
import {
  toCertificateMessage,
  useAddCertificate,
  useCertificates,
  useMyCertificates,
  useUpdateMyCertificate,
} from "@/features/certificates/api";
import type { CertificatePrepInput } from "@/features/certificates/types";
import { dDay, daysUntil, groupByName, isApplyClosed, nextOpenRound, todayIso } from "@/features/certificates/utils";
import { certificatePrepRange, TOTAL_WEEKS, weekOf } from "@/features/forecast/calc";
import { ForecastPreview } from "@/features/forecast/components/ForecastPreview";
import { cn } from "@/lib/utils";
import type { Certificate } from "@/types/database";

/** 자격증 검색과 회차 선택 (PcCertificate, FR-04-1~5) */
export default function CertificateSearchPage() {
  const [params, setParams] = useSearchParams();
  const editId = params.get("id"); // 계획 목록의 "수정"으로 들어오면 고른 회차 id
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const { user } = useAuth();
  const profile = useProfile(user?.id);
  const search = useCertificates(debounced);
  const mine = useMyCertificates();
  const today = todayIso();

  const groups = useMemo(() => groupByName(search.data ?? []), [search.data]);
  const editing = mine.data?.find((m) => m.certificate_id === editId);
  const [selectedName, setSelectedName] = useState<string | null>(editing?.certificate.name ?? null);

  // 수정으로 들어왔으면 그 자격증을, 아니면 첫 검색 결과를 고릅니다
  useEffect(() => {
    if (editing && !selectedName) setSelectedName(editing.certificate.name);
  }, [editing, selectedName]);
  const selected = groups.find((g) => g.name === selectedName) ?? groups[0];

  return (
    <PageContainer>
      <PageHeader title="자격증" description="회차를 고르면 접수·시험 일정과 준비 기간이 예보에 들어가요." />

      <div className="grid items-start gap-6 lg:grid-cols-[18.75rem_minmax(0,1fr)] [&>*]:min-w-0">
        <div className="grid gap-3">
          <label className="relative block">
            <span className="sr-only">자격증 검색</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              value={query}
              placeholder="자격증 이름 검색 (예: 정보처리)"
              className="h-12 pl-10"
              onChange={(e) => {
                setQuery(e.target.value);
                setParams((p) => (e.target.value ? (p.set("q", e.target.value), p) : (p.delete("q"), p)), { replace: true });
              }}
            />
          </label>
          <p className="text-[13px] text-muted-foreground" aria-live="polite">
            {search.isError
              ? "자격증 목록을 불러오지 못했어요. 새로고침한 뒤 다시 시도하세요."
              : search.isPending
                ? "찾는 중…"
                : groups.length === 0
                  ? `"${debounced}"에 맞는 자격증이 없어요. 이름을 줄여서 검색해 보세요.`
                  : `검색 결과 ${groups.length}개`}
          </p>
          <ul className="grid gap-2">
            {groups.map((g) => {
              const open = nextOpenRound(g.rounds, today);
              const isSelected = g.name === selected?.name;
              return (
                <li key={g.name}>
                  <button
                    type="button"
                    aria-current={isSelected ? "true" : undefined}
                    onClick={() => setSelectedName(g.name)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                      isSelected ? "border-2 border-ink" : "border-border hover:bg-accent",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{g.name}</span>
                      <span className="block text-[13px] text-muted-foreground">회차 {g.rounds.length}개</span>
                    </span>
                    {open ? (
                      <span className={cn("text-xs font-semibold whitespace-nowrap", daysUntil(open.apply_end, today) <= 7 ? "text-storm" : "text-muted-foreground")}>
                        마감 {dDay(open.apply_end, today)}
                      </span>
                    ) : (
                      <span className="text-xs whitespace-nowrap text-muted-foreground">접수 마감</span>
                    )}
                    {!isSelected ? <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {selected && profile.data?.semester_start ? (
          <RoundPicker
            key={selected.name}
            name={selected.name}
            rounds={selected.rounds}
            semesterStart={profile.data.semester_start}
            today={today}
            mine={mine.data ?? []}
            preferredId={editId}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            {profile.isPending || search.isPending ? "불러오는 중…" : "왼쪽에서 자격증을 고르세요."}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function RoundPicker({
  name,
  rounds,
  semesterStart,
  today,
  mine,
  preferredId,
}: {
  name: string;
  rounds: Certificate[];
  semesterStart: string;
  today: string;
  mine: CertificatePrepInput[];
  preferredId: string | null;
}) {
  const chosen = mine.find((m) => m.certificate.name === name); // 이 자격증에서 이미 고른 회차
  const initial =
    rounds.find((r) => r.id === preferredId) ?? rounds.find((r) => r.id === chosen?.certificate_id) ?? nextOpenRound(rounds, today) ?? rounds[0];
  const [roundId, setRoundId] = useState(initial.id);
  const round = rounds.find((r) => r.id === roundId) ?? initial;
  const saved = mine.find((m) => m.certificate_id === round.id);

  const [prepWeeks, setPrepWeeks] = useState(saved?.prep_weeks ?? round.prep_weeks);
  const [studyHours, setStudyHours] = useState(saved?.study_hours ?? round.default_study_hours);
  const [showPreview, setShowPreview] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const add = useAddCertificate();
  const update = useUpdateMyCertificate();
  const mutation = saved ? update : add;

  const selectRound = (r: Certificate) => {
    setRoundId(r.id);
    const s = mine.find((m) => m.certificate_id === r.id);
    setPrepWeeks(s?.prep_weeks ?? r.prep_weeks);
    setStudyHours(s?.study_hours ?? r.default_study_hours);
    setDone(null);
  };

  const closed = isApplyClosed(round, today);
  // 입력란을 비운 동안(NaN)에는 직전 기본값으로 계산하고 저장은 막습니다
  const valuesValid = Number.isInteger(prepWeeks) && Number.isInteger(studyHours);
  const weeks = Number.isInteger(prepWeeks) ? prepWeeks : round.prep_weeks;
  const hours = Number.isInteger(studyHours) ? studyHours : round.default_study_hours;
  const range = certificatePrepRange(round.exam_date, weeks, semesterStart);
  const currentWeek = weekOf(today, semesterStart);
  const examInSemester = range.exam_week >= 1 && range.exam_week <= TOTAL_WEEKS;
  const shown = range.weeks.length > 0 ? { start: range.weeks[0], end: range.weeks[range.weeks.length - 1] } : undefined;

  const captions: Record<number, string> = { 1: "1주", [TOTAL_WEEKS]: `${TOTAL_WEEKS}주` };
  if (currentWeek >= 1 && currentWeek <= TOTAL_WEEKS) captions[currentWeek] = "이번 주";
  if (examInSemester) captions[range.exam_week] = "시험";

  const sentence =
    range.coverage === "out"
      ? "시험과 준비 기간이 모두 이번 학기 밖이라 이번 학기 예보에는 들어가지 않아요."
      : `${shown!.start}주차${shown!.start === currentWeek ? "(이번 주)" : ""}부터 ${
          examInSemester ? `${range.exam_week}주차 시험까지` : `${shown!.end}주차까지`
        } ${range.weeks.length}주 동안 한 주 ${hours}시간씩 예보에 더해져요.${
          range.coverage === "partial" ? " 학기 밖 기간은 이번 학기 예보에서 빠져요." : ""
        }`;

  const draft: CertificatePrepInput = { certificate_id: round.id, prep_weeks: weeks, study_hours: hours, certificate: round };
  const replaceId = chosen && chosen.certificate_id !== round.id ? chosen.certificate_id : undefined;
  const submitLabel = saved ? "변경 저장" : replaceId ? "이 회차로 바꾸기" : "추가하기";

  const submit = () => {
    const values = { certificateId: round.id, prepWeeks, studyHours };
    const onSuccess = () => setDone(saved ? "변경한 내용을 예보에 반영했어요." : "예보에 추가했어요.");
    if (saved) update.mutate(values, { onSuccess });
    else add.mutate({ ...values, replaceId }, { onSuccess });
  };

  return (
    <section aria-labelledby="round-title" className="grid gap-6 rounded-xl border border-border bg-card p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="round-title" className="text-2xl font-bold tracking-tight">
            {name}
          </h2>
          {chosen ? <p className="mt-1 text-sm text-muted-foreground">지금 고른 회차: {chosen.certificate.round}</p> : null}
        </div>
        {!closed ? (
          <span className="rounded-full bg-storm/10 px-3 py-1 text-[13px] font-semibold text-storm">
            접수 마감 {dDay(round.apply_end, today)}
          </span>
        ) : null}
      </div>

      <fieldset className="grid gap-2.5">
        <legend className="mb-2.5 text-sm font-semibold">회차</legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {rounds.map((r) => {
            const rClosed = isApplyClosed(r, today);
            const examWeek = weekOf(r.exam_date, semesterStart);
            const checked = r.id === round.id;
            return (
              <label
                key={r.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-4 py-3 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/40",
                  rClosed ? "cursor-not-allowed border-border bg-muted/50 text-muted-foreground" : "cursor-pointer",
                  checked && !rClosed ? "border-primary bg-accent" : !rClosed && "border-border hover:bg-accent/60",
                )}
              >
                <input
                  type="radio"
                  name="round"
                  value={r.id}
                  checked={checked}
                  disabled={rClosed}
                  onChange={() => selectRound(r)}
                  className="size-4 accent-primary"
                />
                <span className="min-w-0 flex-1">
                  <span className={cn("block", !rClosed && "font-semibold")}>{r.round}</span>
                  {!rClosed ? (
                    <span className="block text-[13px] text-muted-foreground">
                      {examWeek >= 1 && examWeek <= TOTAL_WEEKS ? `시험 ${examWeek}주차` : "이번 학기 밖 시험"}, {dDay(r.exam_date, today)}
                    </span>
                  ) : null}
                </span>
                {rClosed ? <span className="text-xs whitespace-nowrap">접수 마감됨</span> : null}
              </label>
            );
          })}
        </div>
      </fieldset>

      {closed ? (
        <FormAlert>이 회차는 접수가 끝났어요. 다른 회차를 고르세요.</FormAlert>
      ) : (
        <>
          <div className="grid gap-3">
            <h3 className="text-sm font-semibold">이번 학기에서 차지하는 기간</h3>
            <WeekRangeStrip
              range={shown}
              marks={examInSemester ? [range.exam_week] : []}
              current={currentWeek}
              captions={captions}
              label={sentence}
            />
            <p className="text-sm text-muted-foreground">{sentence}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-background px-4 py-3">
              <label htmlFor="prep-weeks" className="text-sm text-muted-foreground">
                준비 기간
              </label>
              <NumberStepper id="prep-weeks" value={prepWeeks} onChange={(v) => setPrepWeeks(clampInt(v, 1, 16))} min={1} max={16} unit="주" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-background px-4 py-3">
              <label htmlFor="study-hours" className="text-sm text-muted-foreground">
                한 주 공부 시간
              </label>
              <NumberStepper id="study-hours" value={studyHours} onChange={(v) => setStudyHours(clampInt(v, 1, 40))} min={1} max={40} unit="시간" />
            </div>
          </div>

          {!valuesValid ? (
            <p className="text-[13px] text-destructive">준비 기간(1~16주)과 한 주 공부 시간(1~40시간)을 숫자로 입력하세요.</p>
          ) : null}
          {mutation.error ? <FormAlert>{toCertificateMessage(mutation.error)}</FormAlert> : null}
          {done ? (
            <FormAlert tone="info">
              {done}{" "}
              <Link to="/" className="font-semibold underline underline-offset-2">
                예보 보기
              </Link>
            </FormAlert>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
            <p className="mr-auto text-[13px] text-muted-foreground">
              최종 일정은 시행 기관에서 확인하세요.{" "}
              {round.source_url ? (
                <a href={round.source_url} target="_blank" rel="noreferrer" className="font-semibold text-primary underline underline-offset-2">
                  공고 보기<span className="sr-only"> (새 창)</span>
                </a>
              ) : null}
            </p>
            <Button variant="outline" size="lg" aria-expanded={showPreview} onClick={() => setShowPreview((v) => !v)}>
              {showPreview ? "사전 검토 닫기" : "사전 검토"}
            </Button>
            <Button size="lg" disabled={mutation.isPending || !valuesValid} onClick={submit}>
              {mutation.isPending ? "저장하는 중…" : submitLabel}
            </Button>
          </div>

          {showPreview ? <ForecastPreview draftCertificate={draft} className="border-dashed" /> : null}
        </>
      )}
    </section>
  );
}

/** 직접 입력한 값을 범위 안 정수로 (빈칸이면 NaN 그대로 두어 다시 입력할 수 있게) */
function clampInt(v: number, min: number, max: number) {
  return Number.isNaN(v) ? v : Math.min(max, Math.max(min, Math.round(v)));
}
