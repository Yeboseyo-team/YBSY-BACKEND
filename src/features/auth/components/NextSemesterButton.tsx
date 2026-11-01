import { CalendarPlus } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";
import { useStartNextSemester } from "@/features/auth/next-semester";
import { NextSemesterDialog } from "./NextSemesterDialog";

/** 다음 학기 시작 버튼 (10/28, 10/29 학기별 저장, 11/01 팝업 개편) — 설정·회고·학기가 끝난 홈에서 같이 써요 */
export function NextSemesterButton({
  variant = "outline",
  size = "sm",
  className,
}: Pick<ComponentProps<typeof Button>, "variant" | "size" | "className">) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const start = useStartNextSemester(user?.id);

  return (
    <div className="grid justify-items-start gap-1">
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled={start.isPending}
        onClick={() => setOpen(true)}
      >
        <CalendarPlus aria-hidden="true" />
        {start.isPending ? "정리하는 중…" : "다음 학기 시작"}
      </Button>
      {start.error ? <p className="text-[13px] text-destructive">다음 학기를 시작하지 못했어요. 잠시 뒤 다시 시도하세요.</p> : null}
      <NextSemesterDialog
        open={open}
        isPending={start.isPending}
        onConfirm={() => start.mutate()}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}
