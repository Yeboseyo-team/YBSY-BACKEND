import type { ReactNode } from "react";
import { Link } from "react-router";
import { ForecastStrip } from "./ForecastStrip";

type Props = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

/** 로그인·회원가입의 좌우 분할 화면. 왼쪽은 서비스 소개와 예시 예보, 오른쪽은 폼 */
export function AuthLayout({ title, description, children, footer }: Props) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,51fr)_minmax(0,49fr)]">
      <aside className="bg-ink px-6 pt-8 pb-7 text-white sm:px-10 lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-12">
        <Link to="/" className="inline-block text-lg font-bold tracking-tight">
          학기예보
        </Link>

        <div className="mt-6 max-w-xl lg:mt-0">
          <p className="hidden text-4xl leading-[1.3] font-bold tracking-tight text-balance lg:block">
            일정을 더하기 전에,
            <br />
            이번 학기 날씨부터 확인하세요.
          </p>
          <p className="text-sm leading-relaxed text-white/75 lg:mt-5 lg:text-base">
            수업, 활동, 자격증 준비 시간을 주 단위로 더해 바빠지는 주를 미리 알려 드려요.
          </p>
          <ForecastStrip className="mt-6 lg:mt-16" />
        </div>

        <p className="hidden text-[13px] text-white/60 lg:block">학기예보 팀</p>
      </aside>

      <main className="flex items-start justify-center px-6 py-10 sm:px-10 lg:items-center lg:py-14">
        <div className="w-full max-w-[25rem]">
          <h1 className="text-[28px] font-bold tracking-tight">{title}</h1>
          {description ? (
            <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</div>
          ) : null}
          <div className="mt-6">{children}</div>
          {footer ? <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
