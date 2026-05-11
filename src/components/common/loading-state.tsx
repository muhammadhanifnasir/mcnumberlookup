export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
      {label}
    </div>
  );
}
