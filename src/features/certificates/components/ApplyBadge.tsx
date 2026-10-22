import { cn } from "@/lib/utils";
import type { applyBadge } from "../display";

/** 접수 상태 배지. 색만이 아니라 글자로 상태를 알려 줍니다 */
export function ApplyBadge({ label, tone }: ReturnType<typeof applyBadge>) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold whitespace-nowrap",
        tone === "urgent" && "bg-storm/10 text-storm",
        tone === "open" && "bg-accent text-primary",
        tone === "upcoming" && "bg-secondary text-foreground",
        tone === "closed" && "bg-secondary text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}
