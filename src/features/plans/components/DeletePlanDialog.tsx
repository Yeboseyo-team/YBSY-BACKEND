import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { withJosa } from "@/features/certificates/display";
import { formatHours } from "@/features/forecast/weather";
import type { Plan } from "@/types/database";

type Props = {
  /** 지울 계획. null 이면 닫힘 */
  plan: Plan | null;
  isPending?: boolean;
  onConfirm: (plan: Plan) => void;
  onCancel: () => void;
};

/** 계획 삭제 확인 창 (FR-02-4) — 디자인: PcDeleteConfirm.html */
export function DeletePlanDialog({ plan, isPending = false, onConfirm, onCancel }: Props) {
  const titleId = useId();
  const descId = useId();
  const cancelButton = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef(onCancel);
  useEffect(() => {
    cancelRef.current = onCancel;
  });

  const open = plan !== null;
  // 열리면 [취소]에 초점 (실수로 Enter 눌러도 지워지지 않게), Esc 로 닫기, 닫히면 원래 버튼으로
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    cancelButton.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelRef.current();
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);

  if (!plan) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-ink/40 sm:place-items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="grid w-full max-w-md gap-3 rounded-t-3xl bg-card p-6 sm:rounded-3xl"
      >
        <h2 id={titleId} className="text-lg font-bold">
          {withJosa(plan.title, "을", "를")} 삭제할까요?
        </h2>
        <p id={descId} className="text-sm leading-relaxed text-muted-foreground">
          {plan.start_week}~{plan.end_week}주차에서 한 주 {formatHours(plan.hours_per_week)}시간이 빠져요. 삭제한 계획은 되돌릴 수 없어요.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button ref={cancelButton} type="button" variant="outline" size="lg" onClick={onCancel}>
            취소
          </Button>
          <Button type="button" variant="destructive" size="lg" disabled={isPending} onClick={() => onConfirm(plan)}>
            {isPending ? "삭제하는 중…" : "삭제"}
          </Button>
        </div>
      </div>
    </div>
  );
}
