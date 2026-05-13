import type { CarrierImportStatus } from "@/types/carrier";
import { cn } from "@/lib/utils";

const statusClassMap: Record<CarrierImportStatus, string> = {
  imported: "bg-emerald-100 text-emerald-700 border border-emerald-300/40",
  not_found: "bg-amber-100 text-amber-700 border border-amber-300/40",
  failed: "bg-red-100 text-red-700 border border-red-300/40",
};

const usdotStatusClassMap: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border border-emerald-300/40",
  out_of_service: "bg-red-100 text-red-700 border border-red-300/40",
  unauthorized: "bg-orange-100 text-orange-700 border border-orange-300/40",
  inactive: "bg-slate-100 text-slate-700 border border-slate-300/40",
};

const enrichmentStatusClassMap: Record<string, string> = {
  enriched: "bg-emerald-100 text-emerald-700 border border-emerald-300/40",
  partial: "bg-amber-100 text-amber-700 border border-amber-300/40",
  failed: "bg-red-100 text-red-700 border border-red-300/40",
  pending: "bg-blue-100 text-blue-700 border border-blue-300/40",
};

type StatusBadgeProps = {
  status?: string;
  kind?: "import" | "usdot" | "enrichment";
  className?: string;
};

export function StatusBadge({ status, kind = "import", className }: StatusBadgeProps) {
  const trimmedStatus = status?.trim();
  const normalized = trimmedStatus ? trimmedStatus.toLowerCase().replaceAll(/\s+/g, "_") : undefined;
  const fallbackClass = "bg-slate-100 text-slate-700 border border-slate-300/40";
  const badgeClass =
    kind === "import"
      ? (normalized ? statusClassMap[normalized as CarrierImportStatus] : undefined) ?? fallbackClass
      : kind === "usdot"
        ? (normalized ? usdotStatusClassMap[normalized] : undefined) ?? fallbackClass
        : (normalized ? enrichmentStatusClassMap[normalized] : undefined) ?? fallbackClass;

  const label = normalized ? normalized.replaceAll("_", " ") : "unknown";

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize", badgeClass, className)}>
      {label}
    </span>
  );
}
