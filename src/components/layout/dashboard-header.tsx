import { BellDot, Search } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
        <Search className="h-4 w-4" />
        <span className="truncate">Search dispatch data...</span>
      </div>
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground"
      >
        <BellDot className="h-4 w-4" />
      </button>
    </header>
  );
}
