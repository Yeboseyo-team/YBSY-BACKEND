import { WEEKDAY_LABELS } from "@/features/forecast/calc";
import { cn } from "@/lib/utils";

type Props = {
  /** 고른 요일 (0=월 … 6=일). 비어 있으면 "아무 요일" */
  value: number[];
  onChange: (next: number[]) => void;
  disabled?: boolean;
  /** 작게 (온보딩 2단계 줄 안) */
  compact?: boolean;
  label?: string;
};

/**
 * 주로 공부·과제를 하는 요일 고르기 (10/27 개인화). 고른 요일에만 그 계획의 한 주 시간을 나눠요.
 * 아무것도 안 고르면 요일마다 쓸 수 있는 시간 비율대로 나눠요.
 */
export function WeekdayPicker({ value, onChange, disabled = false, compact = false, label = "주로 하는 요일" }: Props) {
  const toggle = (day: number) =>
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day].sort((a, b) => a - b));

  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1">
      {WEEKDAY_LABELS.map((name, day) => {
        const on = value.includes(day);
        return (
          <button
            key={name}
            type="button"
            aria-pressed={on}
            disabled={disabled}
            onClick={() => toggle(day)}
            className={cn(
              "grid place-items-center rounded-full border text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
              compact ? "size-8" : "size-9",
              on ? "border-primary bg-primary font-semibold text-primary-foreground" : "border-input bg-card text-muted-foreground hover:bg-accent",
              !on && day >= 5 && "text-primary",
            )}
          >
            {name}
          </button>
        );
      })}
      {value.length > 0 ? (
        <button type="button" disabled={disabled} onClick={() => onChange([])} className="ml-1 text-xs text-muted-foreground underline-offset-2 hover:underline">
          아무 요일
        </button>
      ) : (
        <span className="ml-1 text-xs text-muted-foreground">안 고르면 아무 요일</span>
      )}
    </div>
  );
}
