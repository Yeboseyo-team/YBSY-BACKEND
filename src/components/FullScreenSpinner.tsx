import { LoaderCircle } from "lucide-react";

export function FullScreenSpinner({ label = "불러오는 중" }: { label?: string }) {
  return (
    <div className="grid min-h-dvh place-items-center" role="status">
      <LoaderCircle className="size-6 animate-spin text-muted-foreground motion-reduce:animate-none" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
