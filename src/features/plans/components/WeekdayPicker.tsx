import { X } from "lucide-react";
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
 * 7칸이 한 줄로 같은 너비라 휴대폰에서도 줄이 안 깨지고, 아래 한 줄 안내가 지금 상태를 알려 줘요.
 */
export function WeekdayPicker({ value, onChange, disabled = false, compact = false, label = "주로 하는 요일" }: Props) {
  const toggle = (day: number) =>
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day].sort((a, b) => a - b));

  return (
    <div className={cn("grid gap-1.5", compact && "max-w-sm")}>
      <div role="group" aria-label={label} className="grid grid-cols-7 gap-1 rounded-lg bg-muted p-1">
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
                "rounded-md text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                compact ? "h-8" : "h-9",
                on
                  ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                  : cn("hover:bg-card/60", day >= 5 ? "text-primary/70" : "text-muted-foreground"),
              )}
            >
              {name}
            </button>
          );
        })}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {value.length > 0 ? (
          <>
            <span>
              <span className="font-semibold text-foreground">{value.map((d) => WEEKDAY_LABELS[d]).join("·")}</span>에 해야 할 공부량을 정해줘요
            </span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange([])}
              aria-label="고른 요일 모두 빼기"
              className="inline-flex items-center gap-0.5 rounded px-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X aria-hidden="true" className="size-3" />
              지우기
            </button>
          </>
        ) : (
          "안 고르면 요일별 쓸 수 있는 시간에 맞춰 나눠요"
        )}
      </p>
    </div>
  );
}
