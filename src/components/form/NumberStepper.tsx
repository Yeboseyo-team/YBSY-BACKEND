import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
};

/** − 값 + 로 숫자를 고르는 입력. 가운데 칸에 직접 입력할 수도 있습니다. */
export function NumberStepper({ id, value, onChange, min, max, step = 1, unit, invalid, describedBy, className }: Props) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const buttonClass =
    "grid size-11 place-items-center rounded-md border border-input bg-card text-foreground outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:opacity-40";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-input bg-card p-1.5",
        invalid && "border-destructive",
        className,
      )}
    >
      <button
        type="button"
        className={buttonClass}
        aria-label={`${step}${unit} 줄이기`}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - step))}
      >
        <Minus />
      </button>
      <div className="flex items-baseline gap-1 px-2">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={Number.isNaN(value) ? "" : value}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.valueAsNumber)}
          className="w-14 [appearance:textfield] rounded bg-transparent focus-visible:ring-2 focus-visible:ring-ring/50 text-center text-2xl font-bold tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      <button
        type="button"
        className={buttonClass}
        aria-label={`${step}${unit} 늘리기`}
        disabled={value >= max}
        onClick={() => onChange(clamp((Number.isNaN(value) ? min : value) + step))}
      >
        <Plus />
      </button>
    </div>
  );
}
