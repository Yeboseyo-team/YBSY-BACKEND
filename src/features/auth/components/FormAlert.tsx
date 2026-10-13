import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FormAlert({ tone = "error", children }: { tone?: "error" | "info"; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-md border px-3.5 py-3 text-sm leading-relaxed",
        tone === "error"
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-primary/25 bg-accent text-accent-foreground",
      )}
    >
      {children}
    </div>
  );
}
