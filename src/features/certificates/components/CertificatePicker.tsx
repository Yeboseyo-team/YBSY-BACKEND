import { useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { Check, ExternalLink, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { certificatePrepRange } from "@/features/forecast/calc";
import { useMoveCertificateLogs } from "@/features/forecast/logs";
import { PreviewSheet } from "@/features/preview/PreviewSheet";
import { cn } from "@/lib/utils";
import type { Certificate, UserCertificate } from "@/types/database";
import { toCertificateMessage, useAddCertificate, useRemoveMyCertificate } from "../api";
import { applyBadge, examLabel, prepSentence, validatePrep, withJosa } from "../display";
import { searchCertificates, type CertificateGroup, type CertificateRound } from "../search";
import { ApplyBadge } from "./ApplyBadge";
import { PrepInputs } from "./PrepInputs";
import { PrepTimeline } from "./PrepTimeline";

type Props = {
  certificates: Certificate[];
  mine: UserCertificate[];
  semesterStart: string;
  today: string;
  currentWeek: number | null;
  /** 처음 펼쳐 둘 자격증 이름 (내 자격증의 "다른 회차로 바꾸기") */
  initialName?: string;
  /** 저장 끝 → 내 자격증 목록으로 */
  onAdded: (message: string) => void;
};

/** 첫 번째로 고를 수 있는 회차 (없으면 null) */
const firstSelectable = (group: CertificateGroup | undefined) => group?.rounds.find((r) => r.selectable) ?? null;

/** 자격증 검색·회차 선택 (PcCertificate, F-04 + F-06 사전 검토) */
export function CertificatePicker({ certificates, mine, semesterStart, today, currentWeek, initialName, onAdded }: Props) {
  const [query, setQuery] = useState(initialName ?? "");
  const [selectedName, setSelectedName] = useState<string | null>(initialName ?? null);
  const groups = useMemo(() => searchCertificates(certificates, query, today), [certificates, query, today]);
  const allGroups = useMemo(() => searchCertificates(certificates, "", today), [certificates, today]);
  const group = allGroups.find((g) => g.name === selectedName);
  const detailRef = useRef<HTMLElement>(null);

  const select = (name: string) => {
    setSelectedName(name);
    // 휴대폰에서는 상세가 목록 아래에 있으므로 내려가 보여 줌
    requestAnimationFrame(() => detailRef.current?.focus({ preventScroll: true }));
    requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const mineIds = new Set(mine.map((m) => m.certificate_id));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
      {/* PC: 오른쪽 회차 상세가 길어도 검색 칸은 화면에 고정 */}
      <section aria-labelledby="cert-search-title" className="grid gap-3 rounded-xl border border-border bg-card p-4 lg:sticky lg:top-24">
        <h2 id="cert-search-title" className="sr-only">
          자격증 검색
        </h2>
        <Label htmlFor="cert-search">자격증 검색</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="cert-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="예: 정보처리, SQLD, 토익"
            className="h-11 pl-9"
            aria-describedby="cert-search-count"
          />
        </div>
        <p id="cert-search-count" role="status" className="text-[13px] text-muted-foreground">
          {groups.length ? `검색 결과 ${groups.length}개` : `"${query.trim()}"에 맞는 자격증이 없어요. 다른 이름으로 찾아보세요.`}
        </p>
        <ul className="grid max-h-[28rem] gap-1.5 overflow-y-auto">
          {groups.map((g) => {
            const next = firstSelectable(g);
            const picked = g.rounds.some((r) => mineIds.has(r.certificate.id));
            const active = g.name === selectedName;
            return (
              <li key={g.name}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => select(g.name)}
                  className={cn(
                    "grid w-full gap-1 rounded-lg border px-3 py-2.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                    active ? "border-2 border-ink bg-card" : "border-border hover:bg-accent",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium">{g.name}</span>
                    {picked ? (
                      <span className="inline-flex items-center gap-0.5 text-xs text-primary">
                        <Check className="size-3.5" aria-hidden="true" />
                        고름
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[13px] text-muted-foreground">
                    {next ? `${next.certificate.round} · ${applyBadge(next.certificate, next.status, today).label}` : "이번에 고를 수 있는 회차가 없어요"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        ref={detailRef}
        tabIndex={-1}
        aria-label={group ? `${group.name} 회차 선택` : "회차 선택"}
        className="scroll-mt-20 rounded-xl border border-border bg-card p-5 outline-none sm:p-6"
      >
        {group ? (
          <RoundDetail
            key={group.name}
            group={group}
            mine={mine}
            semesterStart={semesterStart}
            today={today}
            currentWeek={currentWeek}
            onAdded={onAdded}
          />
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">목록에서 자격증을 고르면 회차와 준비 기간이 여기에 나와요.</p>
        )}
      </section>
    </div>
  );
}

type DetailProps = Omit<Props, "certificates" | "initialName" | "mine"> & { group: CertificateGroup; mine: UserCertificate[] };

function RoundDetail({ group, mine, semesterStart, today, currentWeek, onAdded }: DetailProps) {
  const mineIds = new Set(mine.map((m) => m.certificate_id));
  /** 같은 자격증에서 이미 고른 회차 → 다른 회차를 추가하면 바꾸기 */
  const current = group.rounds.find((r) => mineIds.has(r.certificate.id)) ?? null;
  const initial = group.rounds.find((r) => r.selectable && !mineIds.has(r.certificate.id)) ?? null;

  const [roundId, setRoundId] = useState<string | null>(initial?.certificate.id ?? null);
  const round = group.rounds.find((r) => r.certificate.id === roundId) ?? null;
  const [prepWeeks, setPrepWeeks] = useState(initial?.certificate.prep_weeks ?? 6);
  const [studyHours, setStudyHours] = useState(initial?.certificate.default_study_hours ?? 8);
  const [previewOpen, setPreviewOpen] = useState(false);

  const add = useAddCertificate();
  const remove = useRemoveMyCertificate();
  const moveLogs = useMoveCertificateLogs();
  const invalid = Boolean(validatePrep(prepWeeks, studyHours));
  const pending = add.isPending || remove.isPending;
  const error = add.error ?? remove.error;

  const pickRound = (r: CertificateRound) => {
    setRoundId(r.certificate.id);
    setPrepWeeks(r.certificate.prep_weeks);
    setStudyHours(r.certificate.default_study_hours);
    add.reset();
  };

  const save = () => {
    if (!round || invalid || pending) return;
    const label = `${group.name} ${round.certificate.round}`;
    add.mutate(
      { certificate: round.certificate, prep_weeks: prepWeeks, study_hours: studyHours },
      {
        onSuccess: () => {
          if (current) {
            // 회차 바꾸기: 새 회차를 저장하고, 그동안의 기록을 새 회차로 옮긴 뒤(10/28) 예전 회차를 해제
            const releaseOld = () => remove.mutate(current.certificate.id, {
              onSuccess: () => onAdded(`${withJosa(label, "으로", "로")} 바꿨어요. 예보에 바로 반영돼요.`),
              onError: () =>
                onAdded(`${withJosa(label, "을", "를")} 추가했어요. 예전 회차(${current.certificate.round})는 내 자격증에서 직접 해제해 주세요.`),
            });
            // 기록 옮기기에 실패해도 회차는 바꿔요 (기록은 예전 회차에 그대로 남아 있어요)
            moveLogs.mutate({ from: current.certificate.id, to: round.certificate.id }, { onSettled: releaseOld });
          } else {
            onAdded(`${withJosa(label, "을", "를")} 추가했어요. 예보에 바로 반영돼요.`);
          }
        },
        // 저장 실패: 시트를 닫고 화면의 오류 문구로 알려 줌
        onError: () => setPreviewOpen(false),
      },
    );
  };

  const range = round ? certificatePrepRange(round.certificate.exam_date, Number.isInteger(prepWeeks) ? prepWeeks : 1, semesterStart) : null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-xl font-bold tracking-tight">{group.name}</h2>
        {round ? <ApplyBadge {...applyBadge(round.certificate, round.status, today)} /> : null}
      </div>

      {current ? (
        <FormAlert tone="info">
          지금 {withJosa(current.certificate.round, "을", "를")} 골라 두었어요. 다른 회차를 추가하면 그 회차로 바뀌어요.
        </FormAlert>
      ) : null}

      <fieldset className="grid gap-2">
        <legend className="mb-2 flex w-full flex-wrap items-center justify-between gap-2 text-sm font-medium">
          회차
          {group.rounds.filter((r) => r.selectable || mineIds.has(r.certificate.id)).length > 1 ? (
            <Link
              to={`/certificates?view=suggest&name=${encodeURIComponent(group.name)}`}
              className="text-[13px] font-medium text-primary hover:underline"
            >
              폭풍이 가장 적은 회차 보기
            </Link>
          ) : null}
        </legend>
        {group.rounds.map((r) => {
          const isMine = mineIds.has(r.certificate.id);
          const disabled = !r.selectable || isMine;
          const rRange = certificatePrepRange(r.certificate.exam_date, r.certificate.prep_weeks, semesterStart);
          return (
            <label
              key={r.certificate.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-3 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/40",
                r.certificate.id === roundId ? "border-2 border-ink" : "border-border",
                disabled ? "cursor-not-allowed bg-secondary/50 text-muted-foreground" : "cursor-pointer hover:bg-accent",
              )}
            >
              <input
                type="radio"
                name={`round-${group.name}`}
                value={r.certificate.id}
                checked={r.certificate.id === roundId}
                disabled={disabled}
                onChange={() => pickRound(r)}
                className="size-4 accent-primary"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{r.certificate.round}</span>
                <span className="block text-[13px]">
                  {isMine ? "지금 고른 회차" : r.selectable ? examLabel(r.certificate.exam_date, rRange, today) : "접수 마감됨 · 고를 수 없어요"}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      {round && range ? (
        <>
          <div className="grid gap-2">
            <p className="text-sm font-medium">이번 학기에서 차지하는 기간</p>
            <PrepTimeline range={range} currentWeek={currentWeek} />
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              {examLabel(round.certificate.exam_date, range, today)} · {prepSentence(range, Number.isNaN(studyHours) ? 0 : studyHours, currentWeek)}
            </p>
          </div>

          <PrepInputs
            idPrefix="add"
            prepWeeks={prepWeeks}
            studyHours={studyHours}
            onPrepWeeksChange={setPrepWeeks}
            onStudyHoursChange={setStudyHours}
          />

          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
            최종 일정은 시행 기관에서 확인하세요.
            {round.certificate.source_url ? (
              <a
                href={round.certificate.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                공고 보기 <ExternalLink className="size-3.5" aria-hidden="true" />
                <span className="sr-only">(새 창)</span>
              </a>
            ) : null}
          </p>

          {error ? <FormAlert>{toCertificateMessage(error)}</FormAlert> : null}

          <div className="grid gap-2">
            <Button
              type="button"
              size="lg"
              className="sm:justify-self-start"
              disabled={invalid || pending}
              onClick={() => {
                add.reset();
                remove.reset();
                setPreviewOpen(true);
              }}
            >
              {current ? "이 회차로 바꾸기" : "추가하기"}
            </Button>
            <p className="text-[13px] text-muted-foreground">누르면 먼저 예보가 어떻게 바뀌는지 보여 드려요. 확인한 뒤에 저장돼요.</p>
          </div>

          <PreviewSheet
            inline
            open={previewOpen}
            title={`${group.name} ${round.certificate.round}`}
            draft={
              invalid
                ? null
                : {
                    kind: "certificate",
                    certificate: round.certificate,
                    prep_weeks: prepWeeks,
                    study_hours: studyHours,
                    replaceCertificateId: current?.certificate.id,
                  }
            }
            confirmLabel={current ? "이 회차로 바꾸기" : "추가하기"}
            pending={pending}
            onCancel={() => setPreviewOpen(false)}
            onConfirm={save}
          />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          {current ? "다른 회차가 없거나 모두 접수가 끝났어요." : "이 자격증은 지금 접수할 수 있는 회차가 없어요. 다음 회차 공고를 기다려 주세요."}
        </p>
      )}
    </div>
  );
}
