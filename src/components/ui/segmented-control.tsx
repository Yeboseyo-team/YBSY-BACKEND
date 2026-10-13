import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
  value: T;
  label: ReactNode;
  /** card 모양에서 라벨 아래 큰 글자 (예: "6시간") */
  detail?: ReactNode;
  disabled?: boolean;
};

type Props<T extends string> = {
  /** 그룹 이름 (화면 읽기 프로그램용). 화면에 보이는 라벨이 있으면 labelledBy를 쓰세요. */
  label?: string;
  labelledBy?: string;
  options: SegmentedOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** pill: 회색 바탕 위 탭 모양 / card: 칸마다 테두리가 있는 카드 */
  variant?: "pill" | "card";
  name?: string;
  className?: string;
};

/**
 * 여러 개 중 하나 고르기. 실제로는 라디오 버튼이라 Tab으로 들어오고 화살표로 바꿀 수 있습니다.
 */
export function SegmentedControl<T extends string>({
  label,
  labelledBy,
  options,
  value,
  onChange,
  variant = "pill",
  name,
  className,
}: Props<T>) {
  const fallbackName = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-labelledby={labelledBy}
      className={cn(
        "grid auto-cols-fr grid-flow-col",
        variant === "pill" ? "gap-1 rounded-lg bg-secondary p-1" : "gap-2",
        className,
      )}
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label
            key={option.value}
            className={cn(
              "relative flex cursor-pointer flex-col items-center justify-center text-center transition-colors",
              "has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/40",
              option.disabled && "cursor-not-allowed opacity-50",
              variant === "pill"
                ? cn("h-10 rounded-md text-sm", checked ? "bg-card font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground")
                : cn(
                    "min-h-17 gap-0.5 rounded-lg border bg-card px-2 py-2.5",
                    checked ? "border-2 border-ink" : "border-input hover:bg-accent",
                  ),
            )}
          >
            <input
              type="radio"
              name={name ?? fallbackName}
              value={option.value}
              checked={checked}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span className={cn(variant === "card" && (checked ? "text-xs font-semibold" : "text-xs text-muted-foreground"))}>
              {option.label}
            </span>
            {option.detail ? <span className="text-base font-bold tabular-nums">{option.detail}</span> : null}
          </label>
        );
      })}
    </div>
  );
}
