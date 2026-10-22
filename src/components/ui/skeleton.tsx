import { cn } from "@/lib/utils";

/** 불러오는 동안 보여 줄 화면 틀 (명세서 6.1) */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn("animate-pulse rounded-md bg-secondary motion-reduce:animate-none", className)} {...props} />;
}

export { Skeleton };
