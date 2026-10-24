import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { FormField } from "@/features/auth/components/FormField";
import { addDays } from "@/features/forecast/calc";
import { PreviewSheet } from "@/features/preview/PreviewSheet";
import type { PreviewDraft } from "@/features/preview/preview";
import { toCertificateMessage, useCreateOwnCertificate } from "../api";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜를 달력에서 고르세요.");
const optionalDate = z.union([isoDate, z.literal("")]);

const schema = z
  .object({
    name: z.string().trim().min(1, "자격증 이름을 입력하세요.").max(40, "40자까지 쓸 수 있어요."),
    round: z.string().trim().max(40, "40자까지 쓸 수 있어요."),
    exam_date: isoDate,
    apply_start: optionalDate,
    apply_end: optionalDate,
    prep_weeks: z.number({ invalid_type_error: "숫자로 입력하세요." }).int().min(1, "1~16주로 입력하세요.").max(16, "1~16주로 입력하세요."),
    study_hours: z.number({ invalid_type_error: "숫자로 입력하세요." }).int().min(1, "1~40시간으로 입력하세요.").max(40, "1~40시간으로 입력하세요."),
    source_url: z.union([z.string().trim().url("https:// 로 시작하는 주소를 넣으세요."), z.literal("")]),
  })
  .refine((d) => !d.apply_start || !d.apply_end || d.apply_start <= d.apply_end, {
    path: ["apply_end"],
    message: "접수 마감은 접수 시작과 같거나 뒤로 고르세요.",
  })
  .refine((d) => !d.apply_end || d.apply_end < d.exam_date, { path: ["apply_end"], message: "접수 마감은 시험일보다 앞이어야 해요." });

type Values = z.infer<typeof schema>;

type Props = {
  onCreated: (message: string) => void;
  onCancel: () => void;
};

/** 사전 검토용 임시 회차 id (저장 전이라 아직 DB id 가 없음) */
const DRAFT_ID = "own-certificate-draft";

/** 목록에 없는 자격증을 추가 (10/24 QA). [사전 검토]로 예보 변화를 먼저 보고, 저장하면 바로 내 자격증으로 골라져요. */
export function OwnCertificateForm({ onCreated, onCancel }: Props) {
  const create = useCreateOwnCertificate();
  const [previewing, setPreviewing] = useState<Values | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", round: "", exam_date: "", apply_start: "", apply_end: "", prep_weeks: 4, study_hours: 6, source_url: "" },
  });

  const save = (v: Values) => {
    // 접수 일정을 모르면 시험 전날로 채워요 (DB 는 접수 마감 < 시험일만 확인)
    const dayBefore = addDays(v.exam_date, -1);
    const applyEnd = v.apply_end || dayBefore;
    create.mutate(
      {
        name: v.name,
        round: v.round || "직접 추가",
        exam_date: v.exam_date,
        apply_start: v.apply_start || applyEnd,
        apply_end: applyEnd,
        prep_weeks: v.prep_weeks,
        study_hours: v.study_hours,
        source_url: v.source_url || null,
      },
      {
        onSuccess: (c) => onCreated(`${c.name}을(를) 추가했어요. 준비 기간 ${v.prep_weeks}주가 예보에 들어갔어요.`),
        onError: () => setPreviewing(null),
      },
    );
  };
  const submit = handleSubmit(save);
  const preview = handleSubmit((v) => setPreviewing(v));
  const draft: PreviewDraft | null = previewing
    ? {
        kind: "certificate",
        certificate: { id: DRAFT_ID, name: previewing.name.trim(), exam_date: previewing.exam_date },
        prep_weeks: previewing.prep_weeks,
        study_hours: previewing.study_hours,
      }
    : null;

  return (
    // PC 에서는 사전 검토가 폼 옆 칸에 펼쳐져요. 휴대폰은 아래에서 올라오는 시트
    <div className="grid items-start gap-6 lg:grid-cols-[520px_minmax(0,1fr)]">
    <form noValidate onSubmit={submit} className="grid max-w-[520px] gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
      {create.error ? <FormAlert>{toCertificateMessage(create.error)}</FormAlert> : null}

      <div className="grid items-start gap-3 sm:grid-cols-2">
        <FormField id="cert-name" label="자격증 이름" error={errors.name?.message}>
          <Input id="cert-name" className="h-11" placeholder="예: TOEIC" maxLength={40} {...register("name")} />
        </FormField>
        <FormField id="cert-round" label="회차 (선택)" error={errors.round?.message}>
          <Input id="cert-round" className="h-11" placeholder="예: 제540회" maxLength={40} {...register("round")} />
        </FormField>
      </div>

      <FormField id="cert-exam" label="시험일" error={errors.exam_date?.message}>
        <Input id="cert-exam" type="date" className="h-11" {...register("exam_date")} />
      </FormField>

      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-semibold">접수 기간 (선택)</legend>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2.5">
          <Input type="date" aria-label="접수 시작" className="h-11" {...register("apply_start")} />
          <span className="text-sm text-muted-foreground">~</span>
          <Input type="date" aria-label="접수 마감" className="h-11" {...register("apply_end")} />
        </div>
        <p className={errors.apply_end ? "text-[13px] text-destructive" : "text-[13px] text-muted-foreground"}>
          {errors.apply_end?.message ?? "넣으면 마감이 다가올 때 예보 화면에 알려 드려요."}
        </p>
      </fieldset>

      <div className="grid items-start gap-3 sm:grid-cols-2">
        <FormField id="cert-prep" label="준비 기간 (주)" error={errors.prep_weeks?.message} hint="시험 주를 포함해 몇 주 준비할지">
          <Input id="cert-prep" type="number" min={1} max={16} className="h-11" {...register("prep_weeks", { valueAsNumber: true })} />
        </FormField>
        <FormField id="cert-hours" label="한 주 공부 시간" error={errors.study_hours?.message}>
          <Input id="cert-hours" type="number" min={1} max={40} className="h-11" {...register("study_hours", { valueAsNumber: true })} />
        </FormField>
      </div>

      <FormField id="cert-url" label="공고 링크 (선택)" error={errors.source_url?.message}>
        <Input id="cert-url" type="url" className="h-11" placeholder="https://" {...register("source_url")} />
      </FormField>

      <Button type="button" variant="outline" size="lg" onClick={() => void preview()}>
        사전 검토
      </Button>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" size="lg" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" size="lg" disabled={create.isPending}>
          {create.isPending ? "추가하는 중…" : "추가하기"}
        </Button>
      </div>
      <p className="text-[13px] text-muted-foreground">직접 추가한 자격증은 내 계정에서만 보여요.</p>
    </form>

    <PreviewSheet
      inline
      placeholder="[사전 검토]를 누르면 이 자격증을 준비했을 때 예보가 어떻게 바뀌는지 여기에 보여 드려요."
      open={previewing !== null}
      title={previewing ? `${previewing.name.trim()} ${previewing.round.trim() || ""}`.trim() : ""}
      draft={draft}
      pending={create.isPending}
      onCancel={() => setPreviewing(null)}
      onConfirm={() => previewing && save(previewing)}
    />
    </div>
  );
}
