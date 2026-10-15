import { Link } from "react-router";
import { CloudFog } from "lucide-react";
import { Button } from "@/components/ui/button";

/** 없는 주소로 들어왔을 때 — 담당: 프론트 A */
export default function NotFoundPage() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-md content-center justify-items-center gap-4 px-4 text-center">
      <CloudFog className="size-12 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-semibold text-muted-foreground">404</p>
      <h1 className="text-2xl font-bold tracking-tight">페이지를 찾을 수 없어요</h1>
      <p className="text-muted-foreground">주소가 바뀌었거나 없는 페이지예요. 홈에서 다시 시작해 주세요.</p>
      <Button asChild size="lg">
        <Link to="/">홈으로</Link>
      </Button>
    </main>
  );
}
