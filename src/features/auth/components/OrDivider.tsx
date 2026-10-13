export function OrDivider({ label = "또는" }: { label?: string }) {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground" role="separator">
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
