import type { ReactNode } from "react";
import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";

type Props = {
  title: string;
  description?: ReactNode;
  back?: { to: string; label: string };
  /** 제목 오른쪽 버튼 */
  action?: ReactNode;
};

/** 로그인 후 화면의 제목 줄 */
export function PageHeader({ title, description, back, action }: Props) {
  return (
    <div className="grid gap-3">
      {back ? (
        <Link to={back.to} className="-ml-1 inline-flex items-center gap-1 justify-self-start text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" aria-hidden="true" />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] font-bold tracking-tight sm:text-3xl">{title}</h1>
          {description ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">{description}</p> : null}
        </div>
        {action}
      </div>
    </div>
  );
}

/** 본문 폭과 여백 */
export function PageContainer({ children }: { children: ReactNode }) {
  return <main className="mx-auto grid max-w-[75rem] gap-6 px-4 py-8 sm:px-8 sm:py-10 [&>*]:min-w-0">{children}</main>;
}
