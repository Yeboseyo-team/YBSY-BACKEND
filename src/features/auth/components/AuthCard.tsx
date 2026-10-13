import type { ReactNode } from "react";
import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";

type Props = {
  title: string;
  description?: ReactNode;
  /** 제목 위 아이콘 (lucide 아이콘) */
  icon?: ReactNode;
  /** 제목 위 "← 로그인으로" 같은 돌아가기 링크 */
  back?: { to: string; label: string };
  children?: ReactNode;
  footer?: ReactNode;
};

/** 메일 확인, 비밀번호 찾기·재설정, 인증 실패처럼 한 가지 일만 하는 화면의 가운데 카드 */
export function AuthCard({ title, description, icon, back, children, footer }: Props) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-6 pt-6 sm:px-9">
        <Link to="/" className="text-lg font-bold tracking-tight">
          학기예보
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center sm:px-6">
        <div className="w-full max-w-[29rem] rounded-xl border border-border bg-card p-6 sm:p-10">
          {back ? (
            <Link
              to={back.to}
              className="-ml-1 mb-5 inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              {back.label}
            </Link>
          ) : null}
          {icon ? (
            <div className="mb-5 grid size-12 place-items-center rounded-lg bg-accent text-primary [&_svg]:size-6" aria-hidden="true">
              {icon}
            </div>
          ) : null}
          <h1 className="text-2xl font-bold tracking-tight text-balance">{title}</h1>
          {description ? (
            <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</div>
          ) : null}
          {children ? <div className="mt-6">{children}</div> : null}
          {footer ? <div className="mt-5 text-center text-sm">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
