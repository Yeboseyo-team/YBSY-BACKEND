import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatHours } from "@/features/forecast/weather";
import type { PlanType } from "@/types/database";
import { AI_DESCRIPTION_MAX, toEstimateMessage, useEstimateHours } from "../ai";

type Props = {
  title: string;
  type: PlanType;
  credits: number | null;
  disabled?: boolean;
  /** 추천 시간을 폼의 "직접 입력"에 채움 (저장은 사용자가) */
  onApply: (hours: number) => void;
};

const PLACEHOLDER: Record<PlanType, string> = {
  class: "예: 매주 과제가 있고 중간에 팀플 발표가 한 번 있어요. 어렵다고 소문난 과목이에요.",
  activity: "예: 매주 목요일 2시간 모임, 한 달에 한 번 행사 준비가 있어요.",
  project: "예: 4명 팀플, 주 1회 회의하고 중간·최종 발표가 있어요.",
};

/** F-08 계획을 말로 설명하면 AI 가 주당 시간을 추천 (FR-08-1). 계획 폼의 "한 주에 쓰는 시간" 아래에 붙어요. */
export function AiEstimate({ title, type, credits, disabled = false, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const estimate = useEstimateHours();
  const tooShort = description.trim().length < 5;

  if (!open) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="mt-1 inline-flex items-center gap-1.5 justify-self-start text-[13px] font-semibold text-primary underline-offset-[3px] hover:underline disabled:opacity-50"
      >
        <Sparkles aria-hidden="true" className="size-3.5" />
        AI로 시간 추천받기
      </button>
    );
  }

  const ask = () =>
    estimate.mutate(
      { title: title.trim(), type, credits, description: description.trim() },
      { onSuccess: (data) => onApply(data.hours_per_week) },
    );

  return (
    <div className="mt-2 grid gap-2 rounded-xl border border-border bg-muted/40 p-3">
      <label htmlFor="ai-description" className="flex items-center gap-1.5 text-[13px] font-semibold">
        <Sparkles aria-hidden="true" className="size-3.5 text-primary" />
        계획을 설명하면 AI가 한 주 시간을 추천해요
      </label>
      <textarea
        id="ai-description"
        rows={3}
        maxLength={AI_DESCRIPTION_MAX}
        value={description}
        disabled={disabled || estimate.isPending}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={PLACEHOLDER[type]}
        className="w-full resize-none rounded-md border border-input bg-card px-3 py-2 text-base outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:opacity-50 md:text-sm"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground tabular-nums">
          {description.length}/{AI_DESCRIPTION_MAX}
        </span>
        <Button type="button" size="sm" variant="outline" disabled={disabled || tooShort || estimate.isPending} onClick={ask}>
          {estimate.isPending ? "추천받는 중…" : "추천받기"}
        </Button>
      </div>

      <div aria-live="polite">
        {estimate.isError ? <p className="text-[13px] text-destructive">{toEstimateMessage(estimate.error)}</p> : null}
        {estimate.isSuccess ? (
          <p className="text-[13px] leading-relaxed">
            <span className="font-semibold">AI 추천: 한 주 {formatHours(estimate.data.hours_per_week)}시간</span>
            {estimate.data.reason ? ` — ${estimate.data.reason}` : ""}
            <span className="block text-xs text-muted-foreground">
              "직접 입력"에 채웠어요. 저장해야 반영돼요. (오늘 {estimate.data.remaining}번 남음)
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
