import { useEffect, useState, type ReactNode } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { AiHoursHelper } from "@/components/AiHoursHelper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { splitWeeklyHours, TOTAL_WEEKS, WEEKDAY_LABELS } from "@/features/forecast/calc";
import { cn } from "@/lib/utils";
import { onboardingSchema, semesterSchema, type OnboardingValues, type SemesterValues } from "../schemas";
import { DEFAULT_SEMESTER, HOURS_PRESETS } from "../semester";

const DEFAULT_WEEKLY = DEFAULT_SEMESTER.availableHours;
import { FormAlert } from "./FormAlert";
import { FormField } from "./FormField";
import { NativeSelect } from "./NativeSelect";

export type SemesterFormValues = SemesterValues & { agreePrivacy?: boolean };

type Props = {
  defaultValues: SemesterValues;
  /** true 면 개인정보 수집·이용 동의 체크박스(필수)를 함께 받습니다 — 온보딩 */
  requirePrivacy?: boolean;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  errorMessage?: string;
  onSubmit: (values: SemesterFormValues) => void;
  /** 입력이 바뀔 때마다 호출 (온보딩 미리보기용) */
  onValuesChange?: (values: Partial<SemesterFormValues>) => void;
  /** 저장 버튼 옆에 둘 버튼 (예: 설정 화면의 취소) */
  secondaryAction?: ReactNode;
  /** 폼 밖 버튼이 이 폼을 제출할 때 쓰는 id (온보딩의 말로 설정하기 카드) */
  id?: string;
  /** 온보딩: 쓸 수 있는 시간은 글로 쓰면 AI 가 정하는 게 기본, 칸은 [직접 고치기]를 눌러야 보여요 (10/27 온보딩 개편) */
  aiDailyHours?: boolean;
  /** 오른쪽 칸(PC)에 넣을 내용 — 온보딩의 수업·프로젝트·자격증 글 칸. 있으면 PC 에서 왼쪽(학기 설정)·오른쪽(글 칸·동의·버튼) 2칸 (10/27) */
  extra?: ReactNode;
  /** 왼쪽 칸 맨 아래(시험 주간 다음)에 넣을 내용 — 온보딩의 학기 미리보기 */
  afterExams?: ReactNode;
  className?: string;
};

const WEEK_OPTIONS = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);

const STUDY_STYLE_OPTIONS = [
  { value: "steady", label: "꾸준히 해요", hint: "매주 고르게 나눠 해요" },
  { value: "normal", label: "조금 몰아서", hint: "평소엔 조금 덜, 시험·마감 2주 전에 더" },
  { value: "cram", label: "벼락치기", hint: "평소엔 절반, 시험·마감 직전 2주에 몰아서" },
] as const;

/** 개강일·한 주 가용 시간·시험 주차 입력. 온보딩(FR-01-11)과 설정(FR-01-12)에서 같이 씁니다. */
export function SemesterForm({
  defaultValues,
  requirePrivacy = false,
  submitLabel,
  pendingLabel,
  isPending,
  errorMessage,
  onSubmit,
  onValuesChange,
  secondaryAction,
  id,
  aiDailyHours = false,
  extra,
  afterExams,
  className,
}: Props) {
  const [manualHours, setManualHours] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SemesterFormValues>({
    resolver: zodResolver(requirePrivacy ? onboardingSchema : semesterSchema) as Resolver<SemesterFormValues>,
    defaultValues: { ...defaultValues, agreePrivacy: false },
  });
  const errs = errors as Partial<Record<keyof OnboardingValues, { message?: string }>>;

  useEffect(() => {
    if (!onValuesChange) return;
    const sub = watch((values) => onValuesChange(values as Partial<SemesterFormValues>));
    return () => sub.unsubscribe();
  }, [watch, onValuesChange]);

  const describe = (name: keyof OnboardingValues, hasHint = false) =>
    errs[name] || hasHint ? `${name}-message` : undefined;

  return (
    <form
      id={id}
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className={cn("grid gap-7", extra ? "lg:grid-cols-2 lg:items-start lg:gap-x-12" : null, className)}
    >
      {errorMessage ? (
        <div className="lg:col-span-2">
          <FormAlert>{errorMessage}</FormAlert>
        </div>
      ) : null}

      {/* 왼쪽: 공부 스타일 → 개강일 → 쓸 수 있는 시간 → 시험 주간 */}
      <div className="grid content-start gap-7">

      {/* 10/26 피드백: 벼락치기하는 사람도 있으니 공부 스타일에 맞춰 예보. 맨 위에서 먼저 물어봐요 */}
      <Controller
        control={control}
        name="studyStyle"
        render={({ field }) => (
          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-medium">이번 학기, 벼락치기 할 건가요?</legend>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              고른 스타일대로 예보를 나눠 그려요. 한 학기 공부 시간 합계는 같아요.
            </p>
            <div role="radiogroup" aria-label="공부 스타일" className="grid gap-2 sm:grid-cols-3">
              {STUDY_STYLE_OPTIONS.map((option) => {
                const selected = field.value === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => field.onChange(option.value)}
                    className={cn(
                      "grid gap-0.5 rounded-lg border bg-card px-3 py-2.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                      selected ? "border-2 border-ink" : "border-input hover:bg-accent",
                    )}
                  >
                    <span className="text-sm font-semibold">{option.label}</span>
                    <span className="text-xs leading-snug text-muted-foreground">{option.hint}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}
      />

      <FormField id="semesterStart" label="개강일" error={errs.semesterStart?.message} hint="이 날부터 7일씩 1주차, 2주차로 세요.">
        <Input
          id="semesterStart"
          type="date"
          className="h-11"
          aria-invalid={errs.semesterStart ? true : undefined}
          aria-describedby={describe("semesterStart", true)}
          {...register("semesterStart")}
        />
      </FormField>

      {/* 요일별 가용 시간 (10/24 QA). 합계가 한 주 가용 시간 */}
      <Controller
        control={control}
        name="dailyHours"
        render={({ field }) => {
          const days = field.value ?? splitWeeklyHours(DEFAULT_WEEKLY);
          const total = days.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
          const setDay = (i: number, v: number) => field.onChange(days.map((d, j) => (j === i ? v : d)));
          if (aiDailyHours && !manualHours) {
            return (
              <fieldset className="grid gap-2">
                <legend className="mb-1 text-sm font-medium">요일별로 쓸 수 있는 시간</legend>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  이번 학기 생활을 쓰면 AI가 요일마다 정해 드려요. 안 쓰면 보통(한 주 {DEFAULT_WEEKLY}시간)으로 시작해요.
                </p>
                <AiHoursHelper
                  defaultOpen
                  askLabel="AI로 정하기"
                  openLabel="AI로 정하기"
                  label="알바·통학·쉬고 싶은 요일처럼 시간을 뺏는 일을 써 주세요"
                  placeholder="예: 화·목 저녁에 카페 알바 5시간, 통학 왕복 2시간이에요. 주말엔 좀 쉬고 싶어요."
                  toInput={(description) => ({ kind: "available", description })}
                  onApply={(estimate) =>
                    field.onChange(
                      estimate.daily_hours && estimate.daily_hours.length === 7 ? estimate.daily_hours : splitWeeklyHours(estimate.hours_per_week),
                    )
                  }
                  appliedNote="아래 요일별 시간에 넣었어요."
                />
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                  <span className="text-muted-foreground">{days.map((h, i) => `${WEEKDAY_LABELS[i]} ${h}`).join(" · ")}</span>
                  <span className="font-semibold">한 주 {total}시간</span>
                  <button type="button" className="font-semibold text-primary underline-offset-[3px] hover:underline" onClick={() => setManualHours(true)}>
                    직접 고치기
                  </button>
                </p>
                {errs.dailyHours ? <p className="text-[13px] text-destructive">{errs.dailyHours.message}</p> : null}
              </fieldset>
            );
          }
          return (
            <fieldset className="grid gap-3">
              <legend className="mb-1 text-sm font-medium">요일별로 쓸 수 있는 시간</legend>
              <p id="dailyHours-message" className={cn("text-[13px] leading-relaxed", errs.dailyHours ? "text-destructive" : "text-muted-foreground")}>
                {errs.dailyHours?.message ??
                  "수업 시간은 빼고, 과제·활동·자격증 공부에 쓸 수 있는 시간이에요. 잠·식사·이동·알바 시간도 빼고 생각해 보세요."}
              </p>
              <div className="grid grid-cols-7 gap-1.5">
                {WEEKDAY_LABELS.map((label, i) => (
                  <label key={label} className="grid justify-items-center gap-1">
                    <span className={cn("text-xs", i >= 5 ? "text-primary" : "text-muted-foreground")}>{label}</span>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={24}
                      step={1}
                      aria-label={`${label}요일 시간`}
                      aria-describedby="dailyHours-message"
                      value={Number.isFinite(days[i]) ? days[i] : ""}
                      onChange={(e) => setDay(i, e.target.value === "" ? 0 : Number(e.target.value))}
                      className="h-11 px-1 text-center tabular-nums"
                    />
                  </label>
                ))}
              </div>
              <p className="text-sm">
                한 주 합계 <span className="font-bold tabular-nums">{total}시간</span>
              </p>
              <div role="group" aria-label="빠른 선택" className="grid grid-cols-3 gap-2">
                {HOURS_PRESETS.map((preset) => {
                  const selected = total === preset.hours;
                  return (
                    <button
                      key={preset.hours}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => field.onChange(splitWeeklyHours(preset.hours))}
                      className={cn(
                        "h-11 rounded-md border bg-card px-1 text-[13px] whitespace-nowrap outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:text-sm",
                        selected ? "border-2 border-ink font-semibold" : "border-input text-muted-foreground hover:bg-accent",
                      )}
                    >
                      {preset.label} {preset.hours}
                    </button>
                  );
                })}
              </div>
              {/* F-08: 이번 학기 사정을 말하면 AI 가 요일별 가용 시간을 추천 (10/24) */}
              {aiDailyHours ? null : (
              <AiHoursHelper
                openLabel="AI에게 이번 학기 얘기하고 추천받기"
                label="이번 학기 생활을 설명하면 AI가 요일별로 쓸 수 있는 시간을 추천해요"
                placeholder="예: 화·목 저녁에 카페 알바(5시간), 통학 왕복 2시간이에요. 주말엔 쉬고 싶어요. 동아리 하나 하고 정보처리기사도 준비해요."
                toInput={(description) => ({ kind: "available", description })}
                onApply={(estimate) =>
                  field.onChange(
                    estimate.daily_hours && estimate.daily_hours.length === 7
                      ? estimate.daily_hours
                      : splitWeeklyHours(estimate.hours_per_week),
                  )
                }
                appliedNote="요일별 칸에 채웠어요. 마음에 안 들면 직접 바꿔도 돼요."
              />
              )}
            </fieldset>
          );
        }}
      />

      <fieldset className="grid gap-3">
        <legend className="mb-3 text-sm font-medium">시험 주간</legend>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["midtermWeek", "중간고사"],
              ["finalWeek", "기말고사"],
            ] as const
          ).map(([name, label]) => (
            <div key={name} className="grid gap-1.5">
              <Label htmlFor={name} className="text-[13px] font-normal text-muted-foreground">
                {label}
              </Label>
              <NativeSelect
                id={name}
                aria-invalid={errs[name] ? true : undefined}
                aria-describedby={describe(name)}
                {...register(name, { valueAsNumber: true })}
              >
                {WEEK_OPTIONS.map((w) => (
                  <option key={w} value={w}>
                    {w}주차
                  </option>
                ))}
              </NativeSelect>
            </div>
          ))}
        </div>
        {errs.midtermWeek ? (
          <p id="midtermWeek-message" className="text-[13px] text-destructive">
            {errs.midtermWeek.message}
          </p>
        ) : null}
        {errs.finalWeek ? (
          <p id="finalWeek-message" className="text-[13px] text-destructive">
            {errs.finalWeek.message}
          </p>
        ) : null}
      </fieldset>

      {afterExams}
      </div>

      {/* 오른쪽(온보딩): 수업·프로젝트·자격증 글 칸 → 동의 → 버튼 */}
      <div className="grid content-start gap-7">
      {extra}

      {requirePrivacy ? (
        <div className="grid gap-2 rounded-lg border border-border bg-background p-4">
          <div className="flex items-start gap-3">
            <input
              id="agreePrivacy"
              type="checkbox"
              className="mt-0.5 size-5 shrink-0 accent-primary"
              aria-invalid={errs.agreePrivacy ? true : undefined}
              aria-describedby="agreePrivacy-message"
              {...register("agreePrivacy")}
            />
            <div className="grid gap-1">
              <Label htmlFor="agreePrivacy" className="leading-snug">
                [필수] 개인정보 수집·이용에 동의해요
              </Label>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                Google 계정 이메일·이름과 입력한 학기 계획을 예보 제공에만 쓰고, 회원 탈퇴 시 삭제해요.{" "}
                <Link to="/privacy" target="_blank" rel="noreferrer" className="font-medium text-primary underline-offset-2 hover:underline">
                  내용 보기
                </Link>
              </p>
            </div>
          </div>
          {errs.agreePrivacy ? (
            <p id="agreePrivacy-message" className="text-[13px] text-destructive">
              {errs.agreePrivacy.message}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="lg" disabled={isPending} className="flex-1">
          {isPending ? pendingLabel : submitLabel}
        </Button>
        {secondaryAction}
      </div>
      </div>
    </form>
  );
}
