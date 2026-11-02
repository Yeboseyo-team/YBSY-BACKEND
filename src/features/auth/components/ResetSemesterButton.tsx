import { RotateCcw } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";
import { useResetCurrentSemester } from "@/features/auth/reset-semester";
import { canResetSemester, toResetSemesterMessage } from "@/features/auth/reset-semester-rules";
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

  if (!canResetSemester(user?.email)) {
    return <span className="text-[13px] text-muted-foreground">시연용 데모 계정은 초기화할 수 없어요</span>;
  }

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
        // 실패하면 팝업을 닫아 버튼 아래 오류 문구가 보이게 해요
        onConfirm={() => reset.mutate(undefined, { onError: () => setOpen(false) })}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}
