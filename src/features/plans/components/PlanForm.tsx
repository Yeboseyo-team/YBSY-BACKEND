import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FormField } from "@/components/form/FormField";
import { NativeSelect } from "@/components/form/NativeSelect";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { SEMESTER_WEEKS } from "@/features/auth/semester";
import type { PlanLoadLevel, PlanType } from "@/types/database";
import { DEFAULT_CREDITS, defaultHours } from "../defaults";
import { planSchema, type PlanFormValues } from "../schemas";
import { LOAD_LEVEL_LABEL, PLAN_TYPE_LABEL, type PlanInput } from "../types";

type Props = {
  defaultValues?: PlanInput;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  errorMessage?: string;
  onSubmit: (values: PlanInput) => void;
  onCancel: () => void;
  /** 입력이 바뀔 때마다 올바른 값이면 PlanInput, 아니면 null (사전 검토용) */
  onDraftChange?: (draft: PlanInput | null) => void;
};

const NEW_PLAN: PlanInput = {
  title: "",
  type: "class",
  credits: DEFAULT_CREDITS,
  load_level: "normal",
  start_week: 1,
  end_week: SEMESTER_WEEKS,
  hours_per_week: defaultHours("class", "normal", DEFAULT_CREDITS)!,
};

const WEEKS = Array.from({ length: SEMESTER_WEEKS }, (_, i) => i + 1);
const LEVELS = ["low", "normal", "high"] as const;

/** 계획 추가·수정 폼 (FR-02-1, F-03, FR-03-3) */
export function PlanForm({
  defaultValues = NEW_PLAN,
  submitLabel,
  pendingLabel,
  isPending,
  errorMessage,
  onSubmit,
  onCancel,
  onDraftChange,
}: Props) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PlanFormValues, unknown, PlanInput>({ resolver: zodResolver(planSchema), defaultValues });

  const values = useWatch({ control });
  const type = (values.type ?? "class") as PlanType;
  const loadLevel = (values.load_level ?? "normal") as PlanLoadLevel;
  const credits = values.credits ?? null;
  const [custom, setCustom] = useState(defaultValues.load_level === "custom");

  // 유형·학점·단계가 바뀌면 한 주 시간을 기본값으로 다시 채웁니다 (직접 입력 중이면 그대로)
  useEffect(() => {
    const hours = defaultHours(type, loadLevel, credits);
    if (hours !== null) setValue("hours_per_week", hours, { shouldValidate: true });
  }, [type, loadLevel, credits, setValue]);

  // 사전 검토에 넘길 값
  useEffect(() => {
    if (!onDraftChange) return;
    const parsed = planSchema.safeParse(values);
    onDraftChange(parsed.success ? parsed.data : null);
  }, [values, onDraftChange]);

  const changeType = (next: PlanType) => {
    setValue("type", next, { shouldValidate: true });
    setValue("credits", next === "class" ? (credits ?? DEFAULT_CREDITS) : null);
  };
  const switchToCustom = () => {
    setCustom(true);
    setValue("load_level", "custom");
  };
  const switchToLevels = () => {
    setCustom(false);
    setValue("load_level", "normal");
  };

  const msg = (name: keyof PlanFormValues) => (errors[name] ? `${name}-message` : undefined);
  const titleLabel = type === "class" ? "과목명" : "계획명";

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
      {errorMessage ? <FormAlert>{errorMessage}</FormAlert> : null}

      <div className="grid gap-2">
        <span id="plan-type-label" className="text-sm font-medium">
          유형
        </span>
        <SegmentedControl
          labelledBy="plan-type-label"
          name="type"
          value={type}
          onChange={changeType}
          options={(Object.keys(PLAN_TYPE_LABEL) as PlanType[]).map((t) => ({ value: t, label: PLAN_TYPE_LABEL[t] }))}
        />
      </div>

      <div className={type === "class" ? "grid grid-cols-[minmax(0,1fr)_7.5rem] gap-3" : "grid"}>
        <FormField id="title" label={titleLabel} error={errors.title?.message}>
          <Input
            id="title"
            maxLength={30}
            placeholder={type === "class" ? "예: 운영체제" : "예: 학회 활동"}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={msg("title")}
            {...register("title")}
          />
        </FormField>
        {type === "class" ? (
          <FormField id="credits" label="학점" error={errors.credits?.message}>
            <NativeSelect
              id="credits"
              aria-invalid={errors.credits ? true : undefined}
              aria-describedby={msg("credits")}
              {...register("credits", { valueAsNumber: true })}
            >
              {[1, 2, 3, 4].map((c) => (
                <option key={c} value={c}>
                  {c}학점
                </option>
              ))}
            </NativeSelect>
          </FormField>
        ) : null}
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">기간</legend>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2.5">
          <Label htmlFor="start_week" className="sr-only">
            시작 주차
          </Label>
          <NativeSelect id="start_week" aria-describedby={msg("start_week")} {...register("start_week", { valueAsNumber: true })}>
            {WEEKS.map((w) => (
              <option key={w} value={w}>
                {w}주차
              </option>
            ))}
          </NativeSelect>
          <span className="text-sm text-muted-foreground">부터</span>
          <Label htmlFor="end_week" className="sr-only">
            끝 주차
          </Label>
          <NativeSelect
            id="end_week"
            aria-invalid={errors.end_week ? true : undefined}
            aria-describedby={msg("end_week")}
            {...register("end_week", { valueAsNumber: true })}
          >
            {WEEKS.map((w) => (
              <option key={w} value={w}>
                {w}주차
              </option>
            ))}
          </NativeSelect>
        </div>
        {errors.start_week ? (
          <p id="start_week-message" className="text-[13px] text-destructive">
            {errors.start_week.message}
          </p>
        ) : null}
        {errors.end_week ? (
          <p id="end_week-message" className="text-[13px] text-destructive">
            {errors.end_week.message}
          </p>
        ) : null}
      </fieldset>

      <div className="grid gap-2">
        <span id="hours-label" className="text-sm font-medium">
          한 주에 쓰는 시간
        </span>
        {custom ? (
          <>
            <div className="flex items-center gap-2.5">
              <Input
                id="hours_per_week"
                type="number"
                inputMode="decimal"
                step={0.5}
                min={0.5}
                max={60}
                aria-labelledby="hours-label"
                aria-invalid={errors.hours_per_week ? true : undefined}
                aria-describedby="hours_per_week-message"
                className="w-28 text-right text-lg font-semibold tabular-nums"
                {...register("hours_per_week", { valueAsNumber: true })}
              />
              <span className="text-sm">시간</span>
              <span className="ml-auto rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-primary">직접 입력</span>
            </div>
            <p id="hours_per_week-message" className={errors.hours_per_week ? "text-[13px] text-destructive" : "text-[13px] text-muted-foreground"}>
              {errors.hours_per_week?.message ?? "0.5시간 단위, 60시간까지 입력할 수 있어요."}
            </p>
            <button type="button" onClick={switchToLevels} className="justify-self-start text-sm font-semibold text-primary underline underline-offset-2">
              적음·보통·많음으로 고르기
            </button>
          </>
        ) : (
          <>
            <SegmentedControl
              variant="card"
              labelledBy="hours-label"
              name="load_level"
              value={loadLevel === "custom" ? null : loadLevel}
              onChange={(level) => setValue("load_level", level, { shouldValidate: true })}
              options={LEVELS.map((level) => ({
                value: level,
                label: LOAD_LEVEL_LABEL[level],
                detail: `${defaultHours(type, level, credits)}시간`,
              }))}
            />
            <p className="text-[13px] text-muted-foreground">
              {type === "class" ? `${credits ?? DEFAULT_CREDITS}학점 기준이에요. ` : ""}시험 주간에는 수업 시간을 1.5배로 계산해요.
            </p>
            <button type="button" onClick={switchToCustom} className="justify-self-start text-sm font-semibold text-primary underline underline-offset-2">
              직접 입력
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Button type="button" variant="outline" size="lg" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
