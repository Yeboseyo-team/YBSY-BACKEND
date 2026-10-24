import { useEffect, type ReactNode } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { FormField } from "@/features/auth/components/FormField";
import { NativeSelect } from "@/features/auth/components/NativeSelect";
import { TOTAL_WEEKS } from "@/features/forecast/calc";
import { formatHours } from "@/features/forecast/weather";
import { cn } from "@/lib/utils";
import type { PlanLoadLevel, PlanType } from "@/types/database";
import type { PlanInput } from "../api";
import { defaultHoursPerWeek, LOAD_LEVEL_LABEL, PLAN_TYPE_LABEL } from "../defaults";
import { planSchema, type PlanFormValues } from "../schema";

type Props = {
  /** 수정 화면에서는 저장된 값, 등록 화면에서는 비워 두면 3학점 수업 보통으로 시작 */
  defaultValues?: PlanInput;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  errorMessage?: string | null;
  onSubmit: (values: PlanInput) => void;
  /** 사전 검토 (F-06). 없으면 버튼이 꺼진 채로 보여요 (6번 작업에서 연결). */
  onPreview?: (values: PlanInput) => void;
  /** 입력이 바뀔 때마다 (사전 검토 실시간 미리보기용). 아직 올바르지 않은 값이면 null */
  onValuesChange?: (values: PlanInput | null) => void;
  cancelTo?: string;
  /** 수정 화면의 삭제 버튼 같은 추가 버튼 */
  extraActions?: ReactNode;
  disabled?: boolean;
  className?: string;
};

const TYPES = Object.keys(PLAN_TYPE_LABEL) as PlanType[];
const LEVELS: Exclude<PlanLoadLevel, "custom">[] = ["low", "normal", "high"];
const WEEKS = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);
const NEW_PLAN: PlanInput = {
  title: "",
  type: "class",
  credits: 3,
  load_level: "normal",
  start_week: 1,
  end_week: TOTAL_WEEKS,
  hours_per_week: 6,
};

/** 계획 등록·수정 폼 (S-09, F-02·F-03). 등록 화면과 수정 화면이 같이 씁니다. */
export function PlanForm({
  defaultValues = NEW_PLAN,
  submitLabel,
  pendingLabel,
  isPending,
  errorMessage,
  onSubmit,
  onPreview,
  onValuesChange,
  cancelTo = "/plans",
  extraActions,
  disabled = false,
  className,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PlanFormValues>({ resolver: zodResolver(planSchema), defaultValues });

  const type = watch("type");
  const credits = watch("credits");
  const level = watch("load_level");
  const isClass = type === "class";

  useEffect(() => {
    if (!onValuesChange) return;
    const sub = watch((values) => {
      const parsed = planSchema.safeParse(values);
      onValuesChange(parsed.success ? parsed.data : null);
    });
    return () => sub.unsubscribe();
  }, [watch, onValuesChange]);

  /** 유형·학점·단계가 바뀌면 F-03 기본 시간을 다시 채워요. 직접 입력이면 그대로 둬요. */
  const refill = (nextType: PlanType, nextLevel: PlanLoadLevel, nextCredits: number | null) => {
    const hours = defaultHoursPerWeek(nextType, nextLevel, nextCredits);
    if (hours !== null) setValue("hours_per_week", hours, { shouldValidate: true });
  };

  const chooseType = (next: PlanType) => {
    const nextCredits = next === "class" ? (credits ?? 3) : null;
    setValue("type", next);
    setValue("credits", nextCredits, { shouldValidate: true });
    refill(next, level, nextCredits);
  };

  const chooseLevel = (next: PlanLoadLevel) => {
    setValue("load_level", next);
    refill(type, next, credits);
  };

  const submit = handleSubmit((values) => onSubmit(values));
  const preview = handleSubmit((values) => onPreview?.(values));
  const describe = (name: keyof PlanFormValues, hasHint = false) => (errors[name] || hasHint ? `${name}-message` : undefined);

  return (
    <form noValidate onSubmit={submit} className={cn("grid gap-6", className)}>
      {errorMessage ? <FormAlert>{errorMessage}</FormAlert> : null}

      <fieldset className="grid gap-2" disabled={disabled}>
        <legend className="mb-2 text-sm font-semibold">유형</legend>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={type === t}
              onClick={() => chooseType(t)}
              className={cn(
                "h-10 rounded-[9px] text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
                type === t ? "bg-card font-semibold text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {PLAN_TYPE_LABEL[t]}
            </button>
          ))}
        </div>
      </fieldset>

      <div className={cn("grid gap-3", isClass && "grid-cols-[minmax(0,1fr)_7.5rem]")}>
        <FormField id="title" label={isClass ? "과목명" : "계획명"} error={errors.title?.message}>
          <Input
            id="title"
            className="h-11"
            maxLength={30}
            placeholder={isClass ? "예: 운영체제" : type === "activity" ? "예: 학회 활동" : "예: 캡스톤 디자인"}
            disabled={disabled}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={describe("title")}
            {...register("title")}
          />
        </FormField>
        {isClass ? (
          <FormField id="credits" label="학점" error={errors.credits?.message}>
            <NativeSelect
              id="credits"
              value={credits ?? ""}
              disabled={disabled}
              aria-invalid={errors.credits ? true : undefined}
              aria-describedby={describe("credits")}
              onChange={(e) => {
                const next = Number(e.target.value);
                setValue("credits", next, { shouldValidate: true });
                refill(type, level, next);
              }}
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

      <fieldset className="grid gap-2" disabled={disabled}>
        <legend className="mb-2 text-sm font-semibold">기간</legend>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2.5">
          <NativeSelect aria-label="시작 주차" {...register("start_week", { valueAsNumber: true })}>
            {WEEKS.map((w) => (
              <option key={w} value={w}>
                {w}주차
              </option>
            ))}
          </NativeSelect>
          <span className="text-sm text-muted-foreground">부터</span>
          <NativeSelect
            aria-label="종료 주차"
            aria-invalid={errors.end_week ? true : undefined}
            aria-describedby={describe("end_week")}
            {...register("end_week", { valueAsNumber: true })}
          >
            {WEEKS.map((w) => (
              <option key={w} value={w}>
                {w}주차
              </option>
            ))}
          </NativeSelect>
        </div>
        {errors.end_week ? (
          <p id="end_week-message" className="text-[13px] text-destructive">
            {errors.end_week.message}
          </p>
        ) : null}
      </fieldset>

      <fieldset className="grid gap-2" disabled={disabled}>
        <legend className="mb-2 text-sm font-semibold">한 주에 쓰는 시간</legend>
        <div className="grid grid-cols-3 gap-2">
          {LEVELS.map((l) => {
            const hours = defaultHoursPerWeek(type, l, credits);
            const active = level === l;
            return (
              <button
                key={l}
                type="button"
                aria-pressed={active}
                onClick={() => chooseLevel(l)}
                className={cn(
                  "flex h-[68px] flex-col items-center justify-center gap-0.5 rounded-xl bg-card outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active ? "border-2 border-ink" : "border border-border hover:border-input",
                )}
              >
                <span className={cn("text-xs", active ? "font-semibold" : "text-muted-foreground")}>{LOAD_LEVEL_LABEL[l]}</span>
                <span className={cn("text-base tabular-nums", active ? "font-bold" : "font-semibold")}>
                  {hours === null ? "-" : `${formatHours(hours)}시간`}
                </span>
              </button>
            );
          })}
        </div>

        {level === "custom" ? (
          <FormField
            id="hours_per_week"
            label="직접 입력 (시간)"
            error={errors.hours_per_week?.message}
            hint="0.5시간 단위로 60시간까지 넣을 수 있어요."
            className="mt-2 grid gap-2"
          >
            <Input
              id="hours_per_week"
              type="number"
              inputMode="decimal"
              step={0.5}
              min={0.5}
              max={60}
              className="h-11"
              aria-invalid={errors.hours_per_week ? true : undefined}
              aria-describedby={describe("hours_per_week", true)}
              {...register("hours_per_week", { valueAsNumber: true })}
            />
          </FormField>
        ) : (
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            {isClass ? `${credits ?? 3}학점 기준이에요. 시험 주간에는 1.5배로 계산해요. ` : "유형별 기본값으로 채웠어요. "}
            <button
              type="button"
              onClick={() => chooseLevel("custom")}
              className="font-semibold text-primary underline underline-offset-[3px]"
            >
              직접 입력
            </button>
          </p>
        )}
        {level !== "custom" && errors.hours_per_week ? (
          <p className="text-[13px] text-destructive">{errors.hours_per_week.message}</p>
        ) : null}
      </fieldset>

      <div className="grid gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={disabled || !onPreview}
          onClick={() => void preview()}
        >
          사전 검토
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="outline" size="lg">
            <Link to={cancelTo}>취소</Link>
          </Button>
          <Button type="submit" size="lg" className="bg-ink hover:bg-ink/90" disabled={disabled || isPending}>
            {isPending ? pendingLabel : submitLabel}
          </Button>
        </div>
        {extraActions}
      </div>
    </form>
  );
}
