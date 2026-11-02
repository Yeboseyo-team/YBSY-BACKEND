import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** 다음 학기 시작 확인 팝업 (11/01) — Esc로 닫기, 취소에 기본 초점 */
export function NextSemesterDialog({ open, isPending = false, onConfirm, onCancel }: Props) {
  const titleId = useId();
  const descId = useId();
  const cancelButton = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef(onCancel);
  useEffect(() => {
    cancelRef.current = onCancel;
  });

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

  if (!open) return null;

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
          다음 학기를 시작할까요?
        </h2>
        <p id={descId} className="text-sm leading-relaxed text-muted-foreground">
          지금 학기는 그대로 보관돼요. 위쪽 학기 메뉴에서 언제든 다시 돌아올 수 있어요.
          <br /><br />
          새 학기는 개강일부터 다시 정하고, 쓸 수 있는 시간·공부 스타일·시험 주차·내 유형은 이어서 써요.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button ref={cancelButton} type="button" variant="outline" size="lg" disabled={isPending} onClick={onCancel}>
            취소
          </Button>
          <Button type="button" variant="default" size="lg" disabled={isPending} onClick={onConfirm}>
            {isPending ? "시작하는 중…" : "다음 학기 시작"}
          </Button>
        </div>
      </div>
    </div>
  );
}
