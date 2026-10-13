import { Link } from "react-router";
import { Button } from "@/components/ui/button";

/** 없는 주소로 들어왔을 때 — 담당: 프론트 A (feature/frontend-ge) */
export default function NotFoundPage() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-md content-center justify-items-center gap-4 px-4 text-center">
      <p className="text-5xl">🌫️</p>
      <h1 className="text-2xl font-bold tracking-tight">페이지를 찾을 수 없어요</h1>
      <p className="text-muted-foreground">주소가 바뀌었거나 없는 페이지예요.</p>
      <Button asChild>
        <Link to="/">홈으로</Link>
      </Button>
    </main>
  );
}
