import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";

/**
 * 개인정보처리방침 (경로 /privacy, 로그인 없이 볼 수 있음) — 담당: 프론트 A (feature/frontend-ge)
 */
export default function PrivacyPage() {
  return (
    <main className="mx-auto grid max-w-3xl gap-6 px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">개인정보처리방침</h1>
      <ScreenPlaceholder
        screen="개인정보처리방침"
        owner="프론트 A (ge)"
        design="PcPrivacy.html"
        todo={["수집 항목, 이용 목적, 보관 기간, 삭제 방법 안내 (명세서 NFR-LEGAL)"]}
      />
    </main>
  );
}
