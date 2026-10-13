import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";
import { useProfile, useSignOut } from "@/features/auth/api";

/**
 * 로그인 후 첫 화면 자리. 지금은 세션이 제대로 유지되는지 확인하는 용도입니다.
 * 이후 부담 예보 화면(F-05, 프론트 B)으로 교체하세요. 상단 메뉴는 AppShell이 그립니다.
 */
export default function HomePage() {
  const { user, session } = useAuth();
  const profile = useProfile(user?.id);
  const signOut = useSignOut();

  const name = profile.data?.display_name ?? user?.email ?? "";
  const provider = user?.app_metadata.provider === "google" ? "Google" : "이메일";
  const expiresAt = session?.expires_at
    ? new Date(session.expires_at * 1000).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    : "-";

  return (
    <>
      <main className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight">{name}님, 반가워요.</h1>
        <p className="mt-2 text-muted-foreground">여기에 이번 학기 부담 예보가 들어갈 예정입니다.</p>

        <dl className="mt-8 grid max-w-md grid-cols-[auto_1fr] gap-x-6 gap-y-3 rounded-lg border border-border bg-card p-5 text-sm">
          <dt className="text-muted-foreground">이메일</dt>
          <dd className="break-all">{user?.email}</dd>
          <dt className="text-muted-foreground">로그인 방식</dt>
          <dd>{provider}</dd>
          <dt className="text-muted-foreground">토큰 만료</dt>
          <dd>{expiresAt} (자동 갱신)</dd>
          <dt className="text-muted-foreground">프로필</dt>
          <dd>
            {profile.isPending
              ? "불러오는 중"
              : profile.error
                ? "불러오지 못함 — 마이그레이션 SQL을 실행했는지 확인하세요"
                : profile.data
                  ? "생성됨"
                  : "없음 — 가입 트리거를 확인하세요"}
          </dd>
        </dl>
        <Button variant="outline" className="mt-6" disabled={signOut.isPending} onClick={() => signOut.mutate()}>
          {signOut.isPending ? "로그아웃하는 중…" : "로그아웃"}
        </Button>
      </main>
    </>
  );
}
