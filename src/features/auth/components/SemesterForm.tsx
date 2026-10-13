import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/form/FormField";
import { NativeSelect } from "@/components/form/NativeSelect";
import { NumberStepper } from "@/components/form/NumberStepper";
import { cn } from "@/lib/utils";
import { semesterSchema, type SemesterValues } from "../schemas";
import { HOURS_PRESETS, SEMESTER_WEEKS } from "../semester";
import { FormAlert } from "./FormAlert";

type Props = {
  defaultValues: SemesterValues;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  errorMessage?: string;
  onSubmit: (values: SemesterValues) => void;
  /** 입력이 바뀔 때마다 호출 (온보딩 미리보기용) */
  onValuesChange?: (values: Partial<SemesterValues>) => void;
  className?: string;
};

const WEEK_OPTIONS = Array.from({ length: SEMESTER_WEEKS }, (_, i) => i + 1);

/** 개강일·한 주 가용 시간·시험 주차 입력. 온보딩(FR-01-11)과 설정(FR-01-12)에서 같이 씁니다. */
export function SemesterForm({
  defaultValues,
  submitLabel,
  pendingLabel,
  isPending,
  errorMessage,
  onSubmit,
  onValuesChange,
  className,
}: Props) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SemesterValues>({ resolver: zodResolver(semesterSchema), defaultValues });

  useEffect(() => {
    if (!onValuesChange) return;
    const sub = watch((values) => onValuesChange(values as Partial<SemesterValues>));
    return () => sub.unsubscribe();
  }, [watch, onValuesChange]);

  const describe = (name: keyof SemesterValues, hasHint = false) =>
    errors[name] || hasHint ? `${name}-message` : undefined;

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className={cn("grid gap-7", className)}>
      {errorMessage ? <FormAlert>{errorMessage}</FormAlert> : null}

      <FormField id="semesterStart" label="개강일" error={errors.semesterStart?.message} hint="이 날이 들어 있는 주를 1주차로 계산해요.">
        <Input
          id="semesterStart"
          type="date"
          aria-invalid={errors.semesterStart ? true : undefined}
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
            error={errors.availableHours?.message}
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
                invalid={Boolean(errors.availableHours)}
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
                        "h-11 rounded-md border bg-card px-1 text-[13px] whitespace-nowrap outline-none sm:text-sm transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                        selected ? "border-2 border-ink font-semibold" : "border-input text-muted-foreground hover:bg-accent",
                      )}
                    >
                      {preset.label} {preset.hours}
                    </button>
                  );
                })}
              </div>
            </div>
          </FormField>
        )}
      />

      <fieldset className="grid gap-3">
        <legend className="mb-3 text-sm font-medium">시험 주간</legend>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="midtermWeek" className="text-[13px] font-normal text-muted-foreground">
              중간고사
            </Label>
            <NativeSelect
              id="midtermWeek"
              aria-invalid={errors.midtermWeek ? true : undefined}
              aria-describedby={describe("midtermWeek")}
              {...register("midtermWeek", { valueAsNumber: true })}
            >
              {WEEK_OPTIONS.map((w) => (
                <option key={w} value={w}>
                  {w}주차
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="finalWeek" className="text-[13px] font-normal text-muted-foreground">
              기말고사
            </Label>
            <NativeSelect
              id="finalWeek"
              aria-invalid={errors.finalWeek ? true : undefined}
              aria-describedby={describe("finalWeek")}
              {...register("finalWeek", { valueAsNumber: true })}
            >
              {WEEK_OPTIONS.map((w) => (
                <option key={w} value={w}>
                  {w}주차
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>
        {errors.midtermWeek ? (
          <p id="midtermWeek-message" className="text-[13px] text-destructive">
            {errors.midtermWeek.message}
          </p>
        ) : null}
        {errors.finalWeek ? (
          <p id="finalWeek-message" className="text-[13px] text-destructive">
            {errors.finalWeek.message}
          </p>
        ) : null}
      </fieldset>

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
