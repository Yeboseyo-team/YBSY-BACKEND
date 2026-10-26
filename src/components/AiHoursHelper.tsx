import { useState, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/features/forecast/weather";
import { AI_DESCRIPTION_MAX, toEstimateMessage, useEstimateHours, type Estimate, type EstimateInput } from "@/features/plans/ai";

type Props = {
  /** 접힌 상태의 버튼 글자 */
  openLabel: string;
  /** 펼친 뒤 입력칸 제목 */
  label: string;
  placeholder: string;
  /** 설명을 받아 서버로 보낼 값을 만듦 */
  toInput: (description: string) => EstimateInput;
  /** 추천 결과를 폼에 채움 (저장은 사용자가) */
  onApply: (estimate: Estimate) => void;
  /** 채운 뒤 안내 (예: "직접 입력에 채웠어요.") */
  appliedNote: string;
  /** 추천을 채운 뒤 바로 누를 버튼 (예: 계획 폼의 [추가하기]) — 10/26: 추천받고 저장 버튼을 못 찾는다는 피드백 */
  action?: ReactNode;
  disabled?: boolean;
};

/** F-08 말로 설명하면 AI 가 시간을 추천 (FR-08-1). 계획 폼과 학기 설정(온보딩·설정)이 같이 써요. */
export function AiHoursHelper({ openLabel, label, placeholder, toInput, onApply, appliedNote, action, disabled = false }: Props) {
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
        {openLabel}
      </button>
    );
  }

  const ask = () => estimate.mutate(toInput(description.trim()), { onSuccess: (data) => onApply(data) });

  return (
    <div className="mt-2 grid gap-2 rounded-xl border border-border bg-muted/40 p-3">
      <label htmlFor="ai-description" className="flex items-center gap-1.5 text-[13px] font-semibold">
        <Sparkles aria-hidden="true" className="size-3.5 text-primary" />
        {label}
      </label>
      <textarea
        id="ai-description"
        rows={3}
        maxLength={AI_DESCRIPTION_MAX}
        value={description}
        disabled={disabled || estimate.isPending}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={placeholder}
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
            <span className="font-semibold">AI 추천: 한 주 {formatDuration(estimate.data.hours_per_week)}</span>
            {estimate.data.reason ? ` — ${estimate.data.reason}` : ""}
            <span className="block text-xs text-muted-foreground">
              {appliedNote} (오늘 {estimate.data.remaining}번 남음)
            </span>
          </p>
        ) : null}
        {estimate.isSuccess && action ? <div className="mt-2">{action}</div> : null}
      </div>
    </div>
  );
}
