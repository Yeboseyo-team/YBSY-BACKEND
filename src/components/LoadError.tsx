import { CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  /** 무엇을 못 불러왔는지, 예: "자격증 목록" */
  what?: string;
  onRetry: () => void;
  retrying?: boolean;
  className?: string;
};

/** 데이터를 불러오지 못했을 때: 이유 한 줄 + 다시 시도 버튼 (명세서 6.1) */
export function LoadError({ what = "정보", onRetry, retrying, className }: Props) {
  return (
    <div role="alert" className={cn("grid justify-items-center gap-3 rounded-xl border border-border bg-card px-6 py-10 text-center", className)}>
      <CloudOff className="size-6 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm">
        {what}를 불러오지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.
      </p>
      <Button variant="outline" onClick={onRetry} disabled={retrying}>
        {retrying ? "다시 불러오는 중…" : "다시 시도"}
      </Button>
    </div>
  );
}
