import type { ReactNode } from "react";
import { Link } from "react-router";
import { Logo } from "@/components/layout/Logo";
import { ForecastStrip } from "./ForecastStrip";

type Props = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({ title, description, children, footer }: Props) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="bg-ink px-6 pt-8 pb-7 text-white sm:px-10 lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-14">
        <Link to="/" className="inline-block text-lg font-extrabold tracking-tight">
          <Logo size={32} />
        </Link>

        <div className="mt-6 max-w-md lg:mt-0">
          <p className="hidden text-[28px] leading-[1.3] font-bold tracking-tight text-balance lg:block">
            일정을 더하기 전에,
            <br />
            이번 학기 날씨부터 확인하세요.
          </p>
          <p className="text-sm leading-relaxed text-white/70 lg:mt-4 lg:text-base">
            수업·활동·자격증 준비 시간을 주 단위로 더해, 바빠지는 주를 미리 알려 드려요.
          </p>
          <ForecastStrip className="mt-6 lg:mt-12" />
          <p className="mt-3 text-[11px] text-white/45">예시 학기입니다.</p>
        </div>

        <div className="hidden lg:block" />
      </aside>

      <main className="flex items-start justify-center px-6 py-10 sm:px-10 lg:items-center lg:py-14">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description ? (
            <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</div>
          ) : null}
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-8 text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
