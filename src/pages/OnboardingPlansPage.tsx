import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { CalendarRange, Plus, X } from "lucide-react";
import { FullScreenSpinner } from "@/components/FullScreenSpinner";
import { LoadError } from "@/components/LoadError";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/auth-context";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { NativeSelect } from "@/features/auth/components/NativeSelect";
import { clearOnboardingDraft, loadOnboardingDraft, ONBOARDING_PLANS_PATH, saveOnboardingDraft } from "@/features/auth/onboarding-draft";
import { useUpdateProfile } from "@/features/auth/profile-api";
import { toCertificateMessage, useAddCertificate, useCreateOwnCertificate } from "@/features/certificates/api";
import { useForecastData } from "@/features/forecast/api";
import type { Advice } from "@/features/forecast/advice";
import { addDays, calculateForecast, TOTAL_WEEKS, weekDates, type ForecastInput, type ForecastPlan } from "@/features/forecast/calc";
import { AdvicePanel } from "@/features/forecast/components/AdvicePanel";
import { WindowedForecastChart } from "@/features/forecast/components/WindowedForecastChart";
import { formatDuration, WEATHER_STYLE } from "@/features/forecast/weather";
import type { DraftCertificate, DraftPlan } from "@/features/plans/ai";
import { toPlanMessage, useCreatePlans, type PlanInput } from "@/features/plans/api";
import { WeekdayPicker } from "@/features/plans/components/WeekdayPicker";
import { CREDITS_RANGE, MAX_PLANS, PLAN_TYPE_LABEL } from "@/features/plans/defaults";
import { cn } from "@/lib/utils";

type PlanRow = DraftPlan & { key: string };
type CertRow = DraftCertificate & { key: string };

const WEEK_OPTIONS = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);
const PREP_OPTIONS = Array.from({ length: 16 }, (_, i) => i + 1);
const TYPES = ["class", "activity", "project"] as const;
const WEATHER_ORDER = ["storm", "cloudy", "clear"] as const;

let seq = 0;
const nextKey = () => `draft-${++seq}`;
const blankPlan = (): PlanRow => ({ key: nextKey(), title: "", type: "class", credits: 3, hours_per_week: 4.5, start_week: 1, end_week: TOTAL_WEEKS, no_exam: false, study_days: [] });
/** 저장소에 넣을 때는 화면용 key 를 빼요 */
function withoutKey<T extends { key: string }>(row: T): Omit<T, "key"> {
  const { key, ...rest } = row;
  void key;
  return rest;
}
/** 해결 제안에서 줄이거나 빼자고 해도 되는 계획 — 아직 저장 안 한 초안만 (이미 저장한 계획은 [계획] 화면에서) */
const isDraftPlan = (p: ForecastPlan) => p.id?.startsWith("draft-") ?? false;
const blankCert = (): CertRow => ({ key: nextKey(), name: "", certificate_id: null, exam_date: null, prep_weeks: 6, study_hours: 8 });

/** 저장할 수 있는 값인지. 문제가 있으면 안내 문장 */
function planProblem(p: PlanRow): string | null {
  if (!p.title.trim()) return "이름을 써 주세요.";
  if (!(p.hours_per_week >= 0.5 && p.hours_per_week <= 60 && Number.isInteger(p.hours_per_week * 2))) return "한 주 시간은 0.5~60시간(30분 단위)이에요.";
  if (p.type === "class" && !(Number.isInteger(p.credits) && p.credits! >= CREDITS_RANGE.min && p.credits! <= CREDITS_RANGE.max))
    return `학점은 ${CREDITS_RANGE.min}~${CREDITS_RANGE.max}이에요.`;
  if (p.start_week > p.end_week) return "끝나는 주차가 시작보다 앞이에요.";
  return null;
}
function certProblem(c: CertRow, today: string): string | null {
  if (c.certificate_id) return null;
  if (!c.name.trim()) return "자격증 이름을 써 주세요.";
  if (!c.exam_date) return "시험일을 넣어 주세요.";
  if (c.exam_date <= today) return "시험일은 오늘 뒤로 넣어 주세요.";
  return null;
}

/**
 * 온보딩 2단계 — 예상 예보 확인·수정 (경로 /start/plans, 10/27 온보딩 개편)
 * 1단계 글로 AI 가 만든 계획·자격증 초안을 사전 검토처럼 예보 그래프로 보여 주고, 고치고·빼고·더한 뒤 [이대로 예보 시작]에 저장해요.
 */
export default function OnboardingPlansPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const data = useForecastData();
  const createPlans = useCreatePlans();
  const addCertificate = useAddCertificate();
  const createOwn = useCreateOwnCertificate();
  const updateProfile = useUpdateProfile();
  const [handoff] = useState(() => loadOnboardingDraft(user?.id));
  const [plans, setPlans] = useState<PlanRow[]>(() => (handoff?.plans ?? []).map((p) => ({ ...p, key: nextKey() })));
  const [certs, setCerts] = useState<CertRow[]>(() => (handoff?.certificates ?? []).map((c) => ({ ...c, key: nextKey() })));
  const [picked, setPicked] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const finished = useRef(false);

  // 고친 내용을 바로 저장해 둬요 — [시간표로 수업 추가]에 갔다 오거나 새로고침해도 그대로 (10/27)
  useEffect(() => {
    if (finished.current) return;
    saveOnboardingDraft(user?.id, {
      plans: plans.map(withoutKey),
      certificates: certs.map(withoutKey),
      reason: handoff?.reason ?? null,
      error: handoff?.error ?? null,
    });
  }, [plans, certs, handoff, user?.id]);

  const semesterStart = data.profile?.semester_start ?? null;
  const catalogById = useMemo(() => new Map(data.certificates.map((c) => [c.id, c])), [data.certificates]);

  // 초안을 넣었을 때의 예보 입력 (이미 저장한 계획·자격증도 함께). 초안 계획 id 는 화면 key — 해결 제안이 줄을 가리킬 때 써요
  const previewInput = useMemo(() => {
    if (!data.input || !semesterStart) return null;
    const draftPlans = plans
      .filter((p) => !planProblem(p))
      .map((p) => ({
        id: p.key,
        title: p.title.trim(),
        type: p.type,
        start_week: p.start_week,
        end_week: p.end_week,
        hours_per_week: p.hours_per_week,
        start_date: weekDates(p.start_week, semesterStart)[0],
        end_date: weekDates(p.end_week, semesterStart)[6],
        priority: "normal",
        category_id: null,
        no_exam: p.type === "class" && p.no_exam,
        study_days: p.study_days ?? [],
      }));
    const usable = certs.filter((c) => !certProblem(c, data.today) && (c.certificate_id ? catalogById.has(c.certificate_id) : true));
    const input: ForecastInput = {
      ...data.input,
      plans: [...data.input.plans, ...draftPlans],
      userCertificates: [
        ...data.input.userCertificates,
        ...usable.map((c) => ({ certificate_id: c.certificate_id ?? c.key, prep_weeks: c.prep_weeks, study_hours: c.study_hours })),
      ],
      certificates: [
        ...data.input.certificates,
        ...usable.filter((c) => !c.certificate_id).map((c) => ({ id: c.key, name: c.name.trim(), exam_date: c.exam_date! })),
      ],
    };
    return input;
  }, [data.input, data.today, semesterStart, plans, certs, catalogById]);
  const forecast = useMemo(() => (previewInput ? calculateForecast(previewInput) : null), [previewInput]);

  if (data.status === "loading") return <FullScreenSpinner />;
  if (data.status === "error") {
    return (
      <main className="mx-auto grid min-h-dvh max-w-md content-center px-4">
        <LoadError what="예보" onRetry={data.refetch} retrying={false} />
      </main>
    );
  }

  const updatePlan = (key: string, patch: Partial<PlanRow>) => setPlans((all) => all.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  const updateCert = (key: string, patch: Partial<CertRow>) => setCerts((all) => all.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  const problems = [
    ...plans.map((p) => planProblem(p) && `${p.title.trim() || "이름 없는 계획"}: ${planProblem(p)}`),
    ...certs.map((c) => certProblem(c, data.today) && `${c.name.trim() || "이름 없는 자격증"}: ${certProblem(c, data.today)}`),
  ].filter(Boolean) as string[];
  /** 해결 제안 [적용] — 초안 줄은 화면에서 바로, 공부 스타일·쓸 수 있는 시간은 설정에 저장 */
  const applyAdvice = async (advice: Advice) => {
    const act = advice.action;
    if (act.type === "plan_hours") updatePlan(act.planKey, { hours_per_week: act.hours });
    else if (act.type === "remove_plan") setPlans((all) => all.filter((p) => p.key !== act.planKey));
    else if (act.type === "style") await updateProfile.mutateAsync({ study_style: act.style });
    else await updateProfile.mutateAsync({ daily_hours: act.daily_hours });
  };
  const tooMany = data.plans.length + plans.length > MAX_PLANS;
  const selectedWeek = picked ?? data.currentWeek ?? 1;

  /** 저장: 계획 → 고른 회차 → 직접 추가 자격증 순서. 저장된 줄은 목록에서 빼서 다시 눌러도 두 번 들어가지 않아요 */
  const save = async () => {
    if (!semesterStart || problems.length > 0 || tooMany) return;
    setSaving(true);
    setSaveError(null);
    let step: "plans" | "certificates" = "plans";
    try {
      if (plans.length > 0) {
        const inputs: PlanInput[] = plans.map((p) => ({
          title: p.title.trim().slice(0, 30),
          type: p.type,
          credits: p.type === "class" ? p.credits : null,
          load_level: "custom",
          start_week: p.start_week,
          end_week: p.end_week,
          hours_per_week: p.hours_per_week,
          start_date: weekDates(p.start_week, semesterStart)[0],
          end_date: weekDates(p.end_week, semesterStart)[6],
          priority: "normal",
          category_id: null,
          no_exam: p.type === "class" && p.no_exam,
          study_days: p.study_days?.length ? p.study_days : null,
        }));
        await createPlans.mutateAsync(inputs);
        setPlans([]);
      }
      step = "certificates";
      for (const c of certs) {
        const catalog = c.certificate_id ? catalogById.get(c.certificate_id) : undefined;
        if (catalog) {
          await addCertificate.mutateAsync({ certificate: catalog, prep_weeks: c.prep_weeks, study_hours: c.study_hours });
        } else {
          const exam = c.exam_date!;
          const applyEnd = addDays(exam, -1) < data.today ? data.today : addDays(exam, -1);
          await createOwn.mutateAsync({
            name: c.name.trim().slice(0, 30),
            round: `${Number(exam.slice(5, 7))}월 ${Number(exam.slice(8, 10))}일 시험`,
            apply_start: data.today,
            apply_end: applyEnd,
            exam_date: exam,
            prep_weeks: c.prep_weeks,
            study_hours: c.study_hours,
            source_url: null,
          });
        }
        setCerts((all) => all.filter((x) => x.key !== c.key));
      }
      finished.current = true;
      clearOnboardingDraft(user?.id);
      navigate("/", { replace: true });
    } catch (error) {
      setSaveError(step === "plans" ? toPlanMessage(error) : toCertificateMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 pt-6 sm:px-10">
        <Logo className="text-lg font-extrabold tracking-tight" />
        <span className="text-sm text-muted-foreground tabular-nums">2 / 2 단계</span>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-10 lg:py-12">
        <div>
          <h1 className="text-3xl leading-tight font-bold tracking-tight text-balance lg:text-4xl">이렇게 예보돼요</h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            AI가 정한 계획으로 만든 예상 예보예요. 아래에서 시간·기간을 고치거나 빼고 더하면 그래프가 바로 바뀌어요. 마음에 들면 [이대로 예보 시작]을 누르세요.
          </p>
          {handoff?.reason ? <p className="mt-2 max-w-2xl text-[13px] text-muted-foreground">AI: {handoff.reason}</p> : null}
        </div>

        {handoff?.error ? <FormAlert>AI가 초안을 만들지 못했어요. {handoff.error} 아래에서 직접 넣어 주세요.</FormAlert> : null}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
          {/* 예상 예보 (휴대폰은 위, PC 는 오른쪽에 고정). 진단·제안까지 화면보다 길어지면 카드 안에서 스크롤 — 끝까지 안 내려도 다 보여요 */}
          <section
            aria-labelledby="preview-title"
            className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:p-6 lg:sticky lg:top-6 lg:order-2 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:overscroll-contain"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="preview-title" className="text-base font-semibold">
                예상 예보
              </h2>
              {forecast ? (
                <p className="text-[13px] text-muted-foreground">
                  {WEATHER_ORDER.map((l) => `${WEATHER_STYLE[l].label} ${forecast.summary[l]}주`).join(" · ")}
                </p>
              ) : null}
            </div>
            {forecast ? (
              <>
                <WindowedForecastChart
                  weeks={forecast.weeks}
                  availableHours={data.profile?.available_hours ?? 0}
                  currentWeek={data.currentWeek}
                  selectedWeek={selectedWeek}
                  onSelect={setPicked}
                />
                <p className="text-[13px] text-muted-foreground">
                  {selectedWeek}주차 {formatDuration(forecast.weeks[selectedWeek - 1].total_hours)} · 쓸 수 있는 시간 {data.profile?.available_hours ?? 0}시간
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">계획을 넣으면 예보가 그려져요.</p>
            )}
            {previewInput ? <AdvicePanel input={previewInput} canChangePlan={isDraftPlan} onApply={applyAdvice} className="mt-1" /> : null}
          </section>

          <div className="grid gap-5 lg:order-1">
            <section aria-labelledby="draft-plans" className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="draft-plans" className="text-base font-semibold">
                  계획 <span className="text-muted-foreground tabular-nums">{plans.length}개</span>
                </h2>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/plans/import?next=${encodeURIComponent(ONBOARDING_PLANS_PATH)}`}>
                    <CalendarRange aria-hidden="true" />
                    시간표로 수업 추가
                  </Link>
                </Button>
              </div>
              {data.plans.length > 0 ? (
                <p className="text-[13px] text-muted-foreground">이미 넣은 계획 {data.plans.length}개도 예보에 들어가 있어요.</p>
              ) : null}
              {plans.length === 0 ? <p className="text-sm text-muted-foreground">아직 없어요. 아래 [계획 추가]로 넣어 보세요.</p> : null}
              <ul className="grid gap-2">
                {plans.map((p) => (
                  <li key={p.key} className={cn("grid gap-2 rounded-xl border p-3", planProblem(p) ? "border-destructive/50" : "border-border")}>
                    <div className="flex items-center gap-2">
                      <Input
                        value={p.title}
                        maxLength={30}
                        aria-label="계획 이름"
                        placeholder="예: 운영체제"
                        onChange={(e) => updatePlan(p.key, { title: e.target.value })}
                        className="h-10"
                      />
                      <Button type="button" variant="ghost" size="icon" aria-label={`${p.title || "계획"} 빼기`} onClick={() => setPlans((all) => all.filter((x) => x.key !== p.key))}>
                        <X aria-hidden="true" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px]">
                      <NativeSelect
                        aria-label="유형"
                        value={p.type}
                        onChange={(e) => {
                          const type = e.target.value as PlanRow["type"];
                          updatePlan(p.key, { type, credits: type === "class" ? (p.credits ?? 3) : null, no_exam: type === "class" && p.no_exam });
                        }}
                        className="h-9 w-24"
                      >
                        {TYPES.map((t) => (
                          <option key={t} value={t}>
                            {PLAN_TYPE_LABEL[t]}
                          </option>
                        ))}
                      </NativeSelect>
                      {p.type === "class" ? (
                        <label className="flex items-center gap-1">
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={CREDITS_RANGE.min}
                            max={CREDITS_RANGE.max}
                            aria-label="학점"
                            value={p.credits ?? ""}
                            onChange={(e) => updatePlan(p.key, { credits: e.target.value === "" ? null : Number(e.target.value) })}
                            className="h-9 w-16 text-center"
                          />
                          학점
                        </label>
                      ) : null}
                      <label className="flex items-center gap-1">
                        한 주
                        <Input
                          type="number"
                          inputMode="decimal"
                          min={0.5}
                          max={60}
                          step={0.5}
                          aria-label="한 주 시간"
                          value={Number.isFinite(p.hours_per_week) ? p.hours_per_week : ""}
                          onChange={(e) => updatePlan(p.key, { hours_per_week: Number(e.target.value) })}
                          className="h-9 w-20 text-center"
                        />
                        시간
                      </label>
                      <span className="flex items-center gap-1">
                        <NativeSelect aria-label="시작 주차" value={p.start_week} onChange={(e) => updatePlan(p.key, { start_week: Number(e.target.value) })} className="h-9 w-20">
                          {WEEK_OPTIONS.map((w) => (
                            <option key={w} value={w}>
                              {w}주
                            </option>
                          ))}
                        </NativeSelect>
                        ~
                        <NativeSelect aria-label="끝 주차" value={p.end_week} onChange={(e) => updatePlan(p.key, { end_week: Number(e.target.value) })} className="h-9 w-20">
                          {WEEK_OPTIONS.map((w) => (
                            <option key={w} value={w}>
                              {w}주
                            </option>
                          ))}
                        </NativeSelect>
                      </span>
                      {p.type === "class" ? (
                        <label className="flex items-center gap-1.5">
                          <input type="checkbox" className="size-4 accent-primary" checked={p.no_exam} onChange={(e) => updatePlan(p.key, { no_exam: e.target.checked })} />
                          시험 없음
                        </label>
                      ) : null}
                    </div>
                    {/* 10/27 개인화: 주로 공부·과제를 하는 요일 */}
                    <div className="grid gap-1 text-[13px]">
                      <span className="text-muted-foreground">주로 하는 요일</span>
                      <WeekdayPicker compact value={p.study_days ?? []} onChange={(study_days) => updatePlan(p.key, { study_days })} />
                    </div>
                    {planProblem(p) ? <p className="text-[13px] text-destructive">{planProblem(p)}</p> : null}
                  </li>
                ))}
              </ul>
              <Button type="button" variant="outline" className="justify-self-start" onClick={() => setPlans((all) => [...all, blankPlan()])}>
                <Plus aria-hidden="true" />
                계획 추가
              </Button>
            </section>

            <section aria-labelledby="draft-certs" className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:p-6">
              <h2 id="draft-certs" className="text-base font-semibold">
                자격증 <span className="text-muted-foreground tabular-nums">{certs.length}개</span>
              </h2>
              {certs.length === 0 ? <p className="text-sm text-muted-foreground">준비할 자격증이 있으면 넣어 주세요.</p> : null}
              <ul className="grid gap-2">
                {certs.map((c) => {
                  const catalog = c.certificate_id ? catalogById.get(c.certificate_id) : undefined;
                  const problem = certProblem(c, data.today);
                  return (
                    <li key={c.key} className={cn("grid gap-2 rounded-xl border p-3", problem ? "border-destructive/50" : "border-border")}>
                      <div className="flex items-center gap-2">
                        {catalog ? (
                          <p className="min-w-0 flex-1 text-sm">
                            <span className="font-semibold">{catalog.name}</span> {catalog.round}
                            <span className="block text-xs text-muted-foreground">
                              시험 {catalog.exam_date} · 접수 마감 {catalog.apply_end}
                            </span>
                          </p>
                        ) : (
                          <Input
                            value={c.name}
                            maxLength={30}
                            aria-label="자격증 이름"
                            placeholder="예: TOEIC"
                            onChange={(e) => updateCert(c.key, { name: e.target.value })}
                            className="h-10"
                          />
                        )}
                        <Button type="button" variant="ghost" size="icon" aria-label={`${c.name || "자격증"} 빼기`} onClick={() => setCerts((all) => all.filter((x) => x.key !== c.key))}>
                          <X aria-hidden="true" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px]">
                        {!catalog ? (
                          <label className="flex items-center gap-1">
                            시험일
                            <Input type="date" value={c.exam_date ?? ""} onChange={(e) => updateCert(c.key, { exam_date: e.target.value || null })} className="h-9 w-40" />
                          </label>
                        ) : null}
                        <label className="flex items-center gap-1">
                          준비
                          <NativeSelect aria-label="준비 기간" value={c.prep_weeks} onChange={(e) => updateCert(c.key, { prep_weeks: Number(e.target.value) })} className="h-9 w-20">
                            {PREP_OPTIONS.map((w) => (
                              <option key={w} value={w}>
                                {w}주
                              </option>
                            ))}
                          </NativeSelect>
                        </label>
                        <label className="flex items-center gap-1">
                          한 주
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={40}
                            aria-label="한 주 공부 시간"
                            value={c.study_hours}
                            onChange={(e) => updateCert(c.key, { study_hours: Math.min(40, Math.max(1, Math.round(Number(e.target.value) || 1))) })}
                            className="h-9 w-16 text-center"
                          />
                          시간
                        </label>
                        {!catalog ? <span className="text-xs text-muted-foreground">목록에 없어서 직접 추가한 자격증으로 넣어요</span> : null}
                      </div>
                      {problem ? <p className="text-[13px] text-destructive">{problem}</p> : null}
                    </li>
                  );
                })}
              </ul>
              <Button type="button" variant="outline" className="justify-self-start" onClick={() => setCerts((all) => [...all, blankCert()])}>
                <Plus aria-hidden="true" />
                자격증 추가
              </Button>
            </section>

            <div className="grid gap-2">
              {tooMany ? <FormAlert>계획은 {MAX_PLANS}개까지예요. 몇 개를 빼 주세요.</FormAlert> : null}
              {problems.length > 0 ? <FormAlert>빨간 칸을 고쳐 주세요. ({problems[0]})</FormAlert> : null}
              {saveError ? <FormAlert>{saveError}</FormAlert> : null}
              <Button size="lg" className="bg-ink hover:bg-ink/90" disabled={saving || problems.length > 0 || tooMany || !semesterStart} onClick={() => void save()}>
                {saving ? "저장하는 중…" : "이대로 예보 시작"}
              </Button>
              <p className="text-xs text-muted-foreground">계획·자격증은 나중에 [계획]·[자격증] 화면에서도 고칠 수 있어요.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
