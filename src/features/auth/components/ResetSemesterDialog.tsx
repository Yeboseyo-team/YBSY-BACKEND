import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** 이번 학기 초기화 확인 팝업 (11/01) — 단순 확인 창으로 Esc로 닫기, 취소에 기본 초점 */
export function ResetSemesterDialog({ open, isPending = false, onConfirm, onCancel }: Props) {
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
          이번 학기를 초기화할까요?
        </h2>
        <p id={descId} className="text-sm leading-relaxed text-muted-foreground">
          이번 학기에 등록된 <strong className="font-semibold text-foreground">계획, 공부 기록, 선택한 자격증</strong>이 모두 삭제되고 처음 온보딩(시간표 및 계획 등록) 상태로 돌아가요.
          <br /><br />
          내가 직접 추가한 자격증이나 계획 유형은 그대로 유지되며, 초기화된 데이터는 되돌릴 수 없어요.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button ref={cancelButton} type="button" variant="outline" size="lg" disabled={isPending} onClick={onCancel}>
            취소
          </Button>
          <Button type="button" variant="destructive" size="lg" disabled={isPending} onClick={onConfirm}>
            {isPending ? "초기화하는 중…" : "초기화"}
          </Button>
        </div>
      </div>
    </div>
  );
}
