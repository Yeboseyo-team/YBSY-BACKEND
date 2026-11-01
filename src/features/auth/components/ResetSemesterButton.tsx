import { RotateCcw } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";
import { toResetSemesterMessage, useResetCurrentSemester } from "@/features/auth/reset-semester";
import { ResetSemesterDialog } from "./ResetSemesterDialog";

/** 이번 학기 초기화 버튼 (11/01) — 설정 화면의 데이터 섹션에서 사용 */
export function ResetSemesterButton({
  variant = "outline",
  size = "sm",
  className,
}: Pick<ComponentProps<typeof Button>, "variant" | "size" | "className">) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const reset = useResetCurrentSemester(user?.id);

  return (
    <div className="grid justify-items-start gap-1">
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled={reset.isPending}
        onClick={() => setOpen(true)}
      >
        <RotateCcw aria-hidden="true" />
        {reset.isPending ? "초기화하는 중…" : "이번 학기 초기화"}
      </Button>
      {reset.error ? (
        <p className="text-[13px] text-destructive">
          {toResetSemesterMessage(reset.error)}
        </p>
      ) : null}
      <ResetSemesterDialog
        open={open}
        isPending={reset.isPending}
        onConfirm={() => reset.mutate()}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}
