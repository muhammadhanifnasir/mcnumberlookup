export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center border-b border-border bg-background px-4 sm:px-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">FMCSA SAFER</p>
        <h2 className="text-sm font-semibold text-card-foreground sm:text-base">MC Carrier Import System</h2>
      </div>
    </header>
  );
}
