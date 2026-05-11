import type { CarrierImportStatus } from "@/types/carrier";

const statusClassMap: Record<CarrierImportStatus, string> = {
  imported: "bg-emerald-100 text-emerald-700",
  not_found: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: CarrierImportStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClassMap[status]}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
