import { useEffect, useRef, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 위험한 동작(삭제)이면 빨간 버튼과 휴지통 아이콘 */
  destructive?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * 확인 창 (PcDeleteConfirm). 브라우저 기본 <dialog>를 써서 포커스 가두기와 Esc 닫기가 기본으로 됩니다.
 * 열리면 "취소"에 먼저 포커스가 가서 Enter를 눌러도 바로 지워지지 않습니다.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  destructive = false,
  pending = false,
  onConfirm,
  onCancel,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? "confirm-dialog-description" : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-card p-7 text-card-foreground shadow-xl backdrop:bg-ink/45"
    >
      {destructive ? (
        <div className="mb-4 grid size-12 place-items-center rounded-lg bg-destructive/10 text-destructive" aria-hidden="true">
          <Trash2 className="size-5" />
        </div>
      ) : null}
      <h2 id="confirm-dialog-title" className="text-xl font-bold tracking-tight text-balance">
        {title}
      </h2>
      {description ? (
        <p id="confirm-dialog-description" className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      <div className="mt-6 flex justify-end gap-2">
        <Button ref={cancelRef} variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={destructive ? "destructive" : "default"} disabled={pending} onClick={onConfirm}>
          {pending ? "처리하는 중…" : confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
