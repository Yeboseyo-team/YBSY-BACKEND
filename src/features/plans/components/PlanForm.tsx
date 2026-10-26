import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/auth-context";
import { useProfile } from "@/features/auth/api";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { FormField } from "@/features/auth/components/FormField";
import { addDays, TOTAL_WEEKS, weekDates, weeksFromDates } from "@/features/forecast/calc";
import { formatDuration } from "@/features/forecast/weather";
import { cn } from "@/lib/utils";
import type { PlanLoadLevel, PlanPriority, PlanType } from "@/types/database";
import type { PlanInput } from "../api";
import { toCategoryMessage, useCreateCategory, usePlanCategories } from "../categories";
import {
  BUILTIN_TYPES,
  CREDITS_RANGE,
  defaultHoursPerWeek,
  LOAD_LEVEL_LABEL,
  MAX_CATEGORIES,
  PLAN_TYPE_LABEL,
  PRIORITY_LABEL,
} from "../defaults";
import { makePlanSchema, toPlanInput, type PlanFormValues } from "../schema";
import { AiEstimate } from "./AiEstimate";

type Props = {
  /** 수정 화면에서는 저장된 값, 등록 화면에서는 비워 두면 3학점 수업 보통·학기 전체로 시작 */
  defaultValues?: PlanInput;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  errorMessage?: string | null;
  onSubmit: (values: PlanInput) => void;
  /** 사전 검토 (F-06). 없으면 버튼을 숨겨요 (10/26 UI 점검: 꺼진 버튼만 보여서 헷갈렸음) */
  onPreview?: (values: PlanInput) => void;
  /** 입력이 바뀔 때마다 (사전 검토 실시간 미리보기용). 아직 올바르지 않은 값이면 null */
  onValuesChange?: (values: PlanInput | null) => void;
  /** 취소 버튼이 갈 곳. null 이면 취소 버튼을 숨겨요 (온보딩 2단계) */
  cancelTo?: string | null;
  /** 수정 화면의 삭제 버튼 같은 추가 버튼 */
  extraActions?: ReactNode;
  disabled?: boolean;
  className?: string;
};

const LEVELS: Exclude<PlanLoadLevel, "custom">[] = ["low", "normal", "high"];
const PRIORITIES: PlanPriority[] = ["high", "normal", "low"];

/** 저장된 계획(또는 빈 계획) → 폼 값. 날짜가 없던 예전 계획은 주차의 첫날~마지막 날로 채워요. */
function toFormValues(plan: PlanInput | undefined, semesterStart: string): PlanFormValues {
  const p = plan ?? {
    title: "",
    type: "class" as PlanType,
    credits: 3,
    load_level: "normal" as PlanLoadLevel,
    start_week: 1,
    end_week: TOTAL_WEEKS,
    hours_per_week: 4.5,
    start_date: null,
    end_date: null,
    priority: "normal" as PlanPriority,
    category_id: null,
    no_exam: false,
  };
  return {
    title: p.title,
    type: p.type,
    category_id: p.category_id,
    credits: p.credits,
    load_level: p.load_level,
    start_date: p.start_date ?? weekDates(p.start_week, semesterStart)[0],
    end_date: p.end_date ?? weekDates(p.end_week, semesterStart)[6],
    hours_per_week: p.hours_per_week,
    priority: p.priority,
    no_exam: p.no_exam ?? false,
  };
}

/** 계획 등록·수정 폼 (S-09, F-02·F-03). 등록 화면과 수정 화면이 같이 씁니다. */
export function PlanForm(props: Props) {
  const { user } = useAuth();
  const profile = useProfile(user?.id);
  const semesterStart = profile.data?.semester_start ?? null;
  // 학기 시작일을 알아야 날짜 ↔ 주차를 바꿀 수 있어요 (온보딩을 마쳤으면 항상 있음)
  if (!semesterStart) return <p className="text-sm text-muted-foreground">학기 설정을 불러오는 중…</p>;
  return <PlanFormInner {...props} semesterStart={semesterStart} />;
}

function PlanFormInner({
  defaultValues,
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
  semesterStart,
}: Props & { semesterStart: string }) {
  const schema = useMemo(() => makePlanSchema(semesterStart), [semesterStart]);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PlanFormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(defaultValues, semesterStart) });

  const categories = usePlanCategories();
  const createCategory = useCreateCategory();
  const [newCategory, setNewCategory] = useState<string | null>(null);

  const type = watch("type");
  const credits = watch("credits");
  const noExam = watch("no_exam");
  const level = watch("load_level");
  const categoryId = watch("category_id");
  const priority = watch("priority");
  const startDate = watch("start_date");
  const endDate = watch("end_date");
  const isClass = type === "class";
  const isCustom = type === "custom";
  const weeks = startDate && endDate && startDate <= endDate ? weeksFromDates(startDate, endDate, semesterStart) : null;

  useEffect(() => {
    if (!onValuesChange) return;
    const sub = watch((values) => {
      const parsed = schema.safeParse(values);
      onValuesChange(parsed.success ? toPlanInput(parsed.data, semesterStart) : null);
    });
    return () => sub.unsubscribe();
  }, [watch, onValuesChange, schema, semesterStart]);

  /** 유형·학점·단계가 바뀌면 F-03 기본 시간을 다시 채워요. 직접 입력이면 그대로 둬요. */
  const refill = (nextType: PlanType, nextLevel: PlanLoadLevel, nextCredits: number | null) => {
    const hours = defaultHoursPerWeek(nextType, nextLevel, nextCredits);
    if (hours !== null) setValue("hours_per_week", hours, { shouldValidate: true });
  };

  const chooseType = (next: PlanType, nextCategory: string | null = null) => {
    const nextCredits = next === "class" ? (credits ?? 3) : null;
    setValue("type", next);
    setValue("category_id", nextCategory, { shouldValidate: next === "custom" });
    setValue("credits", nextCredits, { shouldValidate: true });
    if (next === "custom") {
      setValue("load_level", "custom");
    } else {
      const nextLevel = level === "custom" && type === "custom" ? "normal" : level;
      setValue("load_level", nextLevel);
      refill(next, nextLevel, nextCredits);
    }
  };

  const chooseLevel = (next: PlanLoadLevel) => {
    setValue("load_level", next);
    refill(type, next, credits);
  };

  const addCategory = () => {
    const name = (newCategory ?? "").trim();
    if (!name) return;
    createCategory.mutate(name, {
      onSuccess: (created) => {
        setNewCategory(null);
        chooseType("custom", created.id);
      },
    });
  };

  const submit = handleSubmit((values) => onSubmit(toPlanInput(values, semesterStart)));
  const preview = handleSubmit((values) => onPreview?.(toPlanInput(values, semesterStart)));
  const describe = (name: keyof PlanFormValues, hasHint = false) => (errors[name] || hasHint ? `${name}-message` : undefined);
  const myCategories = categories.data ?? [];
  const semesterEnd = addDays(semesterStart, TOTAL_WEEKS * 7 - 1);

  return (
    <form noValidate onSubmit={submit} className={cn("grid gap-6", className)}>
      {errorMessage ? <FormAlert>{errorMessage}</FormAlert> : null}

      <fieldset className="grid gap-2" disabled={disabled}>
        <legend className="mb-2 text-sm font-semibold">유형</legend>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
          {BUILTIN_TYPES.map((t) => (
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

        {/* 사용자 지정 유형 (예: 결혼식) — 10/24 QA */}
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="내 유형">
          {myCategories.map((c) => {
            const active = isCustom && categoryId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => chooseType("custom", c.id)}
                className={cn(
                  "h-8 rounded-full border px-3 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active ? "border-ink bg-ink font-semibold text-white" : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {c.name}
              </button>
            );
          })}
          {newCategory === null ? (
            myCategories.length < MAX_CATEGORIES ? (
              <button
                type="button"
                onClick={() => setNewCategory("")}
                className="inline-flex h-8 items-center gap-1 rounded-full border border-dashed border-input px-3 text-[13px] text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus aria-hidden="true" className="size-3.5" />
                내 유형 만들기
              </button>
            ) : null
          ) : (
            <span className="flex items-center gap-1.5">
              <Input
                aria-label="새 유형 이름"
                autoFocus
                maxLength={10}
                placeholder="예: 결혼식"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCategory();
                  }
                  if (e.key === "Escape") setNewCategory(null);
                }}
                className="h-8 w-32 text-sm"
              />
              <Button type="button" size="sm" variant="outline" disabled={createCategory.isPending || !newCategory.trim()} onClick={addCategory}>
                추가
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setNewCategory(null)}>
                취소
              </Button>
            </span>
          )}
        </div>
        {createCategory.error ? <p className="text-[13px] text-destructive">{toCategoryMessage(createCategory.error)}</p> : null}
        {errors.category_id ? <p className="text-[13px] text-destructive">{errors.category_id.message}</p> : null}
      </fieldset>

      {/* items-start: 이름 칸 아래 오류 문구가 생겨도 학점 칸이 밀려 내려가지 않게 (10/24 QA) */}
      <div className={cn("grid items-start gap-3", isClass && "grid-cols-[minmax(0,1fr)_6.5rem]")}>
        <FormField id="title" label={isClass ? "과목명" : "계획명"} error={errors.title?.message}>
          <Input
            id="title"
            className="h-11"
            maxLength={30}
            placeholder={isClass ? "예: 운영체제" : type === "activity" ? "예: 학회 활동" : type === "project" ? "예: 캡스톤 디자인" : "예: 사촌 결혼식"}
            disabled={disabled}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={describe("title")}
            {...register("title")}
          />
        </FormField>
        {isClass ? (
          <FormField id="credits" label="학점" error={errors.credits?.message}>
            <Input
              id="credits"
              type="number"
              inputMode="numeric"
              min={CREDITS_RANGE.min}
              max={CREDITS_RANGE.max}
              step={1}
              className="h-11"
              disabled={disabled}
              aria-invalid={errors.credits ? true : undefined}
              aria-describedby={describe("credits")}
              {...register("credits", {
                setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
                onChange: (e) => {
                  const next = e.target.value === "" ? null : Number(e.target.value);
                  if (next !== null && Number.isInteger(next) && next >= CREDITS_RANGE.min && next <= CREDITS_RANGE.max) {
                    refill(type, level, next);
                  }
                },
              })}
            />
          </FormField>
        ) : null}
      </div>
      {/* 10/26: 캡스톤처럼 시험 대신 발표·과제로 평가하는 수업 */}
      {isClass ? (
        <label className="-mt-3 flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-primary" disabled={disabled} {...register("no_exam")} />
          <span>
            시험 없는 수업이에요
            <span className="block text-[13px] text-muted-foreground">
              발표·과제로 평가하면 체크하세요. 시험 주간 1.5배를 빼고, 벼락치기는 끝나는 날 전 2주에 몰아요.
            </span>
          </span>
        </label>
      ) : null}

      <fieldset className="grid gap-2" disabled={disabled}>
        <legend className="mb-2 text-sm font-semibold">기간</legend>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2.5">
          <Input
            type="date"
            aria-label="시작하는 날"
            className="h-11"
            min={semesterStart}
            max={semesterEnd}
            aria-invalid={errors.start_date ? true : undefined}
            {...register("start_date")}
          />
          <span className="text-sm text-muted-foreground">부터</span>
          <Input
            type="date"
            aria-label="끝나는 날"
            className="h-11"
            min={startDate || semesterStart}
            max={semesterEnd}
            aria-invalid={errors.end_date ? true : undefined}
            aria-describedby="end_date-message"
            {...register("end_date")}
          />
        </div>
        <p id="end_date-message" className={cn("text-[13px]", errors.end_date || errors.start_date ? "text-destructive" : "text-muted-foreground")}>
          {errors.end_date?.message ??
            errors.start_date?.message ??
            (weeks
              ? weeks.start_week === weeks.end_week
                ? `${weeks.start_week}주차에 들어가요.`
                : `${weeks.start_week}주차 ~ ${weeks.end_week}주차에 들어가요.`
              : "학기(1~16주차) 안의 날짜를 고르세요.")}
        </p>
      </fieldset>

      <fieldset className="grid gap-2" disabled={disabled}>
        <legend className="mb-2 text-sm font-semibold">한 주에 쓰는 시간</legend>
        {isCustom ? null : (
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
                    {hours === null ? "-" : `${formatDuration(hours)}`}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {level === "custom" || isCustom ? (
          <FormField
            id="hours_per_week"
            label={isCustom ? "그 주에 쓰는 시간 (시간)" : "직접 입력 (시간)"}
            error={errors.hours_per_week?.message}
            hint={
              isCustom
                ? "하루짜리 일정이면 그날 쓰는 시간을 넣으세요. 예보에서 그 날짜에 들어가요."
                : "0.5시간 단위로 60시간까지 넣을 수 있어요."
            }
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
            {isClass
              ? `${credits ?? 3}학점 기준, 수업 시간은 빼고 과제·복습 시간이에요. ${noExam ? "시험이 없어 시험 주간도 그대로 계산해요." : "시험 주간에는 1.5배로 계산해요."} `
              : "유형별 기본값으로 채웠어요. "}
            <button
              type="button"
              onClick={() => chooseLevel("custom")}
              className="font-semibold text-primary underline underline-offset-[3px]"
            >
              직접 입력
            </button>
          </p>
        )}
        {level !== "custom" && !isCustom && errors.hours_per_week ? (
          <p className="text-[13px] text-destructive">{errors.hours_per_week.message}</p>
        ) : null}

        <AiEstimate
          title={watch("title") ?? ""}
          type={type}
          credits={credits}
          disabled={disabled}
          submitLabel={submitLabel}
          pendingLabel={pendingLabel}
          isPending={isPending}
          onApply={(hours) => {
            setValue("load_level", "custom");
            setValue("hours_per_week", hours, { shouldValidate: true });
          }}
        />
      </fieldset>

      {/* 우선순위 — 10/24 QA. 폭풍 주에는 낮은 것부터 줄여 보라고 안내해요 */}
      <fieldset className="grid gap-2" disabled={disabled}>
        <legend className="mb-2 text-sm font-semibold">우선순위</legend>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={priority === p}
              onClick={() => setValue("priority", p)}
              className={cn(
                "h-9 rounded-[9px] text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
                priority === p ? "bg-card font-semibold text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {PRIORITY_LABEL[p]}
            </button>
          ))}
        </div>
        <p className="text-[13px] text-muted-foreground">바쁜 주에는 우선순위가 낮은 계획부터 줄여 보라고 알려 드려요.</p>
      </fieldset>

      <div className="grid gap-2 pt-1">
        {onPreview ? (
          <Button type="button" variant="outline" size="lg" disabled={disabled} onClick={() => void preview()}>
            사전 검토
          </Button>
        ) : null}
        <div className={cn("grid gap-2", cancelTo !== null && "grid-cols-2")}>
          {cancelTo !== null ? (
            <Button asChild variant="outline" size="lg">
              <Link to={cancelTo}>취소</Link>
            </Button>
          ) : null}
          <Button type="submit" size="lg" className="bg-ink hover:bg-ink/90" disabled={disabled || isPending}>
            {isPending ? pendingLabel : submitLabel}
          </Button>
        </div>
        {extraActions}
      </div>
    </form>
  );
}
