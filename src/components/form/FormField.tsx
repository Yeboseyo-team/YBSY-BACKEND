import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

type Props = {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** 라벨, 입력, 입력란 바로 아래 한 줄 안내·오류를 묶습니다. 입력에는 aria-describedby={`${id}-message`}를 걸어 주세요. */
export function FormField({ id, label, error, hint, children, className }: Props) {
  return (
    <div className={className ?? "grid gap-2"}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-message`} className="text-[13px] text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-message`} className="text-[13px] leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
