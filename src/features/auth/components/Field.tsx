import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = ComponentProps<"input"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

/** RHF의 register() 결과를 그대로 펼쳐 넣을 수 있는 입력 + 라벨 + 에러 묶음 */
export function Field({ id, label, error, hint, ...inputProps }: Props) {
  const messageId = `${id}-message`;
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? messageId : undefined}
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
