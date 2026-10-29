import { useProfile } from "@/features/auth/api";
import { useAuth } from "@/features/auth/auth-context";
import { semesterLabel, useSemesters, useSwitchSemester } from "@/features/auth/semesters";
import { cn } from "@/lib/utils";

/**
 * 학기 고르기 (10/29) — 위쪽 메뉴의 "2026년 2학기 ▾". 학기가 둘 이상일 때만 보여요.
 * 고르면 그 학기의 계획·자격증·기록·설정으로 바뀌어요 (지난 학기도 보고 고칠 수 있어요).
 */
export function SemesterSwitcher({ className }: { className?: string }) {
  const { user } = useAuth();
  const profile = useProfile(user?.id);
  const semesters = useSemesters();
  const change = useSwitchSemester();
  const list = semesters.data ?? [];
  const current = profile.data?.current_semester_id ?? null;
  if (list.length < 2 || !current) return null;

  // 같은 이름(같은 해·학기)이 여럿이면 개강일을 붙여 구분
  const labels = list.map((s) => semesterLabel(s));
  const label = (i: number) => (labels.filter((l) => l === labels[i]).length > 1 && list[i].semester_start ? `${labels[i]} (${list[i].semester_start})` : labels[i]);

  return (
    <label className={cn("relative inline-flex items-center", className)}>
      <span className="sr-only">학기 고르기</span>
      <select
        value={current}
        disabled={change.isPending}
        onChange={(e) => change.mutate(e.target.value)}
        className="h-9 rounded-lg border border-border bg-card pr-8 pl-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      >
        {list.map((s, i) => (
          <option key={s.id} value={s.id}>
            {label(i)}
          </option>
        ))}
      </select>
      {change.error ? <span className="ml-2 text-xs text-destructive">학기를 바꾸지 못했어요</span> : null}
    </label>
  );
}
