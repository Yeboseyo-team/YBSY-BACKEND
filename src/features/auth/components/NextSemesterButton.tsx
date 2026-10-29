import { CalendarPlus } from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";
import { useStartNextSemester } from "@/features/auth/next-semester";

const CONFIRM =
  "다음 학기를 시작할까요?\n\n" +
  "정리돼요: 이번 학기 계획·공부 기록·시험이 지난 자격증·개강일\n" +
  "남아요: 쓸 수 있는 시간·공부 스타일·시험 주차·내 유형·앞으로 볼 자격증\n\n" +
  "정리한 내용은 되돌릴 수 없어요. 지난 학기 기록이 필요하면 먼저 [회고]에서 파일로 내려받으세요.";

/** 다음 학기 시작 버튼 (10/28) — 설정·회고·학기가 끝난 홈에서 같이 써요 */
export function NextSemesterButton({ variant = "outline", size = "sm", className }: Pick<ComponentProps<typeof Button>, "variant" | "size" | "className">) {
  const { user } = useAuth();
  const start = useStartNextSemester(user?.id);
  return (
    <div className="grid justify-items-start gap-1">
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled={start.isPending}
        onClick={() => {
          if (window.confirm(CONFIRM)) start.mutate();
        }}
      >
        <CalendarPlus aria-hidden="true" />
        {start.isPending ? "정리하는 중…" : "다음 학기 시작"}
      </Button>
      {start.error ? <p className="text-[13px] text-destructive">다음 학기를 시작하지 못했어요. 잠시 뒤 다시 시도하세요.</p> : null}
    </div>
  );
}
