import { useEffect, type ReactNode } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { AiHoursHelper } from "@/components/AiHoursHelper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TOTAL_WEEKS } from "@/features/forecast/calc";
import { cn } from "@/lib/utils";
import { onboardingSchema, semesterSchema, type OnboardingValues, type SemesterValues } from "../schemas";
import { HOURS_PRESETS } from "../semester";
import { FormAlert } from "./FormAlert";
import { FormField } from "./FormField";
import { NativeSelect } from "./NativeSelect";
import { NumberStepper } from "./NumberStepper";

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
  className?: string;
};

const WEEK_OPTIONS = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);

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
  className,
}: Props) {
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
    <form noValidate onSubmit={handleSubmit(onSubmit)} className={cn("grid gap-7", className)}>
      {errorMessage ? <FormAlert>{errorMessage}</FormAlert> : null}

      <FormField id="semesterStart" label="개강일" error={errs.semesterStart?.message} hint="이 날이 들어 있는 주를 1주차로 계산해요.">
        <Input
          id="semesterStart"
          type="date"
          className="h-11"
          aria-invalid={errs.semesterStart ? true : undefined}
          aria-describedby={describe("semesterStart", true)}
          {...register("semesterStart")}
        />
      </FormField>

      <Controller
        control={control}
        name="availableHours"
        render={({ field }) => (
          <FormField
            id="availableHours"
            label="한 주에 쓸 수 있는 시간"
            error={errs.availableHours?.message}
            hint="수업, 과제, 활동, 자격증 공부를 모두 합친 시간이에요. 잠과 식사, 이동 시간은 빼고 생각해 보세요."
          >
            <div className="grid gap-3">
              <NumberStepper
                id="availableHours"
                value={field.value}
                onChange={field.onChange}
                min={1}
                max={168}
                unit="시간"
                invalid={Boolean(errs.availableHours)}
                describedBy={describe("availableHours", true)}
                className="justify-self-start"
              />
              <div role="group" aria-label="빠른 선택" className="grid grid-cols-3 gap-2">
                {HOURS_PRESETS.map((preset) => {
                  const selected = field.value === preset.hours;
                  return (
                    <button
                      key={preset.hours}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => field.onChange(preset.hours)}
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
              {/* F-08: 이번 학기 사정을 말하면 AI 가 가용 시간을 추천 (10/24) */}
              <AiHoursHelper
                openLabel="AI에게 이번 학기 얘기하고 추천받기"
                label="이번 학기 생활을 설명하면 AI가 한 주에 쓸 수 있는 시간을 추천해요"
                placeholder="예: 주 3일 카페 알바(하루 5시간), 통학 왕복 2시간이에요. 동아리 하나 하고 정보처리기사도 준비하려고요."
                toInput={(description) => ({ kind: "available", description })}
                onApply={field.onChange}
                appliedNote="위 칸에 채웠어요. 마음에 안 들면 직접 바꿔도 돼요."
              />
            </div>
          </FormField>
        )}
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
    </form>
  );
}
