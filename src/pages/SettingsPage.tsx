import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";
import { useSignOut } from "@/features/auth/api";

/**
 * S-12 설정 (경로 /settings) — 담당: 프론트 A (feature/frontend-ge)
 * 할 일 목록: docs/tasks/frontend-ge.md
 */
export default function SettingsPage() {
  const signOut = useSignOut();
  return (
    <PageContainer>
      <PageHeader title="설정" />
      <ScreenPlaceholder
        screen="S-12 설정"
        owner="프론트 A (ge)"
        design="PcSettings.html"
        todo={["학기 설정(가용 시간·시작일·시험 주차) 수정", "이름 수정", "로그아웃 (아래 버튼은 이미 동작)"]}
      >
        <Button variant="outline" disabled={signOut.isPending} onClick={() => signOut.mutate()}>
          {signOut.isPending ? "로그아웃하는 중…" : "로그아웃"}
        </Button>
      </ScreenPlaceholder>
    </PageContainer>
  );
}
