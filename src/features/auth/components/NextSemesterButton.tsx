import { CalendarPlus } from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";
import { useStartNextSemester } from "@/features/auth/next-semester";

const CONFIRM =
  "다음 학기를 시작할까요?\n\n" +
  "지금 학기는 그대로 보관돼요. 위쪽 학기 메뉴에서 언제든 다시 돌아올 수 있어요.\n" +
  "새 학기는 개강일부터 다시 정하고, 쓸 수 있는 시간·공부 스타일·시험 주차·내 유형은 이어서 써요.";

/** 다음 학기 시작 버튼 (10/28, 10/29 학기별 저장) — 설정·회고·학기가 끝난 홈에서 같이 써요 */
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
