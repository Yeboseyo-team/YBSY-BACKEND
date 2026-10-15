import { Link, useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";

// TODO(팀 확정): 시행일·보유 기간·문의처 (명세서 9.1 미결 사항)
const EFFECTIVE_DATE = "2026년 10월 20일";
const CONTACT = "학기예보 팀 (문의 이메일은 팀 확정 후 안내)";

const SECTIONS = [
  {
    id: "items",
    title: "1. 수집하는 항목",
    body: (
      <ul className="grid list-disc gap-1.5 pl-5">
        <li>Google 로그인 시: Google 계정 이메일, 이름</li>
        <li>서비스 이용 중 입력: 학기 설정(개강일·가용 시간·시험 주차), 계획, 고른 자격증 회차와 준비 시간</li>
        <li>개인정보 수집·이용 동의 시각</li>
      </ul>
    ),
  },
  {
    id: "purpose",
    title: "2. 이용 목적",
    body: <p>회원 식별과 로그인, 주차별 부담 예보 계산, 자격증 접수 마감 안내에만 사용해요. 광고나 다른 목적으로는 쓰지 않아요.</p>,
  },
  {
    id: "retention",
    title: "3. 보유 기간",
    body: <p>회원 탈퇴 시까지 보관하고, 탈퇴하면 계획·자격증 선택을 포함한 모든 정보를 바로 삭제해요.</p>,
  },
  {
    id: "outsourcing",
    title: "4. 처리 위탁",
    body: (
      <ul className="grid list-disc gap-1.5 pl-5">
        <li>Supabase: 데이터 저장과 로그인 처리</li>
        <li>Vercel: 웹 호스팅</li>
        <li>Google: 로그인(계정 확인)</li>
      </ul>
    ),
  },
  {
    id: "rights",
    title: "5. 이용자의 권리",
    body: <p>언제든지 내 정보의 열람, 수정, 삭제를 요청할 수 있어요. 학기 설정과 이름은 설정 화면에서 바로 고칠 수 있고, 그 밖의 요청은 아래 문의처로 보내 주세요.</p>,
  },
  {
    id: "contact",
    title: "6. 문의처",
    body: <p>{CONTACT}</p>,
  },
];

/** 개인정보처리방침 (경로 /privacy, 로그인 없이 볼 수 있음, NFR-LEGAL-1) — 담당: 프론트 A */
export default function PrivacyPage() {
  const navigate = useNavigate();
  const canGoBack = typeof window !== "undefined" && window.history.length > 1;

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-8">
          <Link to="/" className="text-lg font-bold tracking-tight">
            학기예보
          </Link>
          {canGoBack ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-10 items-center gap-1 rounded-md px-2 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              돌아가기
            </button>
          ) : null}
        </div>
      </header>

      <main className="mx-auto grid max-w-3xl gap-8 px-4 py-8 sm:px-8 sm:py-12">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">개인정보처리방침</h1>
          <p className="mt-2 text-sm text-muted-foreground">시행일 {EFFECTIVE_DATE}</p>
        </div>

        <nav aria-label="목차" className="rounded-xl border border-border bg-card p-5">
          <ol className="grid gap-1.5 text-sm sm:grid-cols-2">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-muted-foreground hover:text-foreground hover:underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <p className="leading-relaxed">학기예보 팀은 서비스에 꼭 필요한 정보만 받고, 아래 목적 밖으로는 쓰지 않아요.</p>

        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="grid scroll-mt-6 gap-3 leading-relaxed">
            <h2 id={`${s.id}-title`} className="text-lg font-semibold">
              {s.title}
            </h2>
            {s.body}
          </section>
        ))}
      </main>
    </div>
  );
}
