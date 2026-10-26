import { Link, NavLink, Outlet, useLocation } from "react-router";
import { CalendarCheck, CloudSun, ListTodo, NotebookPen, Plus, SlidersHorizontal, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; end: boolean; icon: LucideIcon };

const NAV: NavItem[] = [
  { to: "/", label: "예보", end: true, icon: CloudSun },
  { to: "/plans", label: "계획", end: false, icon: ListTodo },
  { to: "/certificates", label: "자격증", end: false, icon: CalendarCheck },
  { to: "/review", label: "회고", end: false, icon: NotebookPen },
];

/**
 * 로그인 후 화면 공통 틀 (명세서 6.1)
 * - PC(1024px~): 상단 메뉴 + 설정 + 계획 추가
 * - 휴대폰(360px~): 위에는 로고·설정·계획 추가, 아래에 탭 4개(예보·계획·자격증·회고)
 * - 인쇄(회고 PDF 저장)할 때는 메뉴를 숨겨요
 * 본문은 각 화면의 PageContainer(<main>)가 그립니다.
 */
export function AppShell() {
  const { pathname } = useLocation();
  // 하루 할 일(/day/...)은 예보에서 들어오는 화면이라 '예보' 메뉴를 켜 둬요
  const isOn = (to: string, active: boolean) => active || (to === "/" && pathname.startsWith("/day/"));
  // 계획을 넣는 화면에서는 위쪽 [계획 추가]가 겹쳐서 숨겨요 (10/26 UI 점검)
  const hideAdd = /^\/plans\/(new|import|[^/]+\/edit)/.test(pathname);
  return (
    <div className="min-h-dvh pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:shadow"
      >
        본문으로 건너뛰기
      </a>

      <header className="sticky top-0 z-30 print:hidden border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
        <div className="mx-auto flex h-14 max-w-[75rem] items-center gap-x-8 px-4 sm:px-8 lg:h-16">
          <Link to="/" className="rounded-md text-lg font-bold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">
            <Logo />
          </Link>

          <nav aria-label="주요 메뉴" className="hidden gap-1 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "inline-flex h-10 items-center rounded-lg px-3.5 text-[15px] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                    isOn(item.to, isActive) ? "bg-secondary font-semibold text-foreground" : "text-muted-foreground hover:bg-secondary/60",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <NavLink
              to="/settings"
              aria-label="설정"
              className={({ isActive }) =>
                cn(
                  "inline-flex size-11 items-center justify-center gap-1.5 rounded-lg text-[15px] outline-none hover:bg-secondary/60 focus-visible:ring-[3px] focus-visible:ring-ring/40 lg:w-auto lg:px-3",
                  isActive ? "bg-secondary font-semibold text-foreground" : "text-foreground",
                )
              }
            >
              <SlidersHorizontal className="size-5" aria-hidden="true" />
              {/* PC 에서는 아이콘만으로 알기 어려워 글자도 (10/26 UI 점검) */}
              <span className="hidden lg:inline">설정</span>
            </NavLink>
            {hideAdd ? null : (
              <Button asChild className="h-10 px-3 sm:px-4 lg:h-11">
                <Link to="/plans/new">
                  <Plus aria-hidden="true" />
                  <span>계획 추가</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </div>

      <nav
        aria-label="주요 메뉴"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden print:hidden"
      >
        <ul className="mx-auto grid h-16 max-w-md grid-cols-4">
          {NAV.map(({ to, label, end, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex h-full flex-col items-center justify-center gap-1 text-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:ring-inset",
                    isOn(to, isActive) ? "font-semibold text-foreground" : "text-muted-foreground",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn("size-6", isOn(to, isActive) && "text-primary")} strokeWidth={isOn(to, isActive) ? 2.2 : 1.8} aria-hidden="true" />
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
