import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = ComponentProps<"input"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  /** 라벨 오른쪽에 붙는 링크 (예: 비밀번호를 잊었나요?) */
  labelAction?: ReactNode;
};

/** RHF의 register() 결과를 그대로 펼쳐 넣을 수 있는 입력 + 라벨 + 에러 묶음 */
export function Field({ id, label, error, hint, labelAction, "aria-describedby": extraDescribedBy, ...inputProps }: Props) {
  const messageId = `${id}-message`;
  const describedBy = [error || hint ? messageId : null, extraDescribedBy].filter(Boolean).join(" ") || undefined;
  return (
    <div className="grid gap-2">
      {labelAction ? (
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={id}>{label}</Label>
          {labelAction}
        </div>
      ) : (
        <Label htmlFor={id}>{label}</Label>
      )}
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {error ? (
        <p id={messageId} className="text-[13px] text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-[13px] text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
