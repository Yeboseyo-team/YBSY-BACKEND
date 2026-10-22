import { Link, NavLink, Outlet } from "react-router";
import { Plus, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "예보", end: true },
  { to: "/plans", label: "계획", end: false },
  { to: "/certificates", label: "자격증", end: false },
];

/** 로그인 후 화면 공통 틀: 상단 메뉴 + 본문 */
export function AppShell() {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex min-h-16 max-w-[75rem] flex-wrap items-center gap-x-8 gap-y-2 px-4 py-2.5 sm:px-8">
          <Link to="/" className="text-lg font-bold tracking-tight">
            학기예보
          </Link>
          <nav aria-label="주요 메뉴" className="flex gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "inline-flex h-10 items-center rounded-lg px-3.5 text-[15px] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                    isActive ? "bg-secondary font-semibold text-foreground" : "text-muted-foreground hover:bg-secondary/60",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" aria-label="설정">
              <Link to="/settings">
                <SlidersHorizontal className="size-5" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild>
              <Link to="/plans/new">
                <Plus aria-hidden="true" />
                계획 추가
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
