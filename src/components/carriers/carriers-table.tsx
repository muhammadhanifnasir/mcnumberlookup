import type { CarrierRecord } from "@/types/carrier";

import { TableShell } from "@/components/common/table-shell";
import { StatusBadge } from "@/components/carriers/status-badge";

const columns = [
  { key: "mc", label: "MC" },
  { key: "usdot", label: "USDOT Number" },
  { key: "name", label: "Carrier" },
  { key: "ownerStatus", label: "Owner Status" },
  { key: "email", label: "Email" },
  { key: "website", label: "Website" },
  { key: "physicalAddress", label: "Physical Address" },
  { key: "equipmentType", label: "Equipment Type" },
  { key: "fleetSizeCategory", label: "Fleet Category" },
  { key: "enrichmentStatus", label: "Enrichment" },
  { key: "phone", label: "Phone" },
  { key: "status", label: "Status" },
  { key: "error", label: "Error" },
  { key: "updated", label: "Scraped At" },
];

export function CarriersTable({ data }: { data: CarrierRecord[] }) {
  return (
    <TableShell columns={columns} emptyMessage="No carrier records yet.">
      {data.map((carrier) => (
        <tr key={`${carrier.mcNumber}-${carrier.scrapedAt}`}>
          <td className="whitespace-nowrap px-4 py-3 font-medium text-card-foreground">MC {carrier.mcNumber}</td>
          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{carrier.usdotNumber ?? "-"}</td>
          <td className="px-4 py-3 text-card-foreground">{carrier.legalName ?? carrier.dbaName ?? "-"}</td>
          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{carrier.ownerStatus ?? "-"}</td>
          <td className="px-4 py-3 text-muted-foreground">{carrier.emailAddress ?? "-"}</td>
          <td className="px-4 py-3 text-muted-foreground">{carrier.website ?? "-"}</td>
          <td className="px-4 py-3 text-muted-foreground">{carrier.physicalAddress ?? "-"}</td>
          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
            {carrier.equipmentType ?? carrier.truckType ?? "-"}
          </td>
          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{carrier.fleetSizeCategory ?? "-"}</td>
          <td className="whitespace-nowrap px-4 py-3">
            <StatusBadge status={carrier.enrichmentStatus} kind="enrichment" />
          </td>
          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{carrier.phone ?? "-"}</td>
          <td className="whitespace-nowrap px-4 py-3">
            <StatusBadge status={carrier.importStatus} />
          </td>
          <td className="max-w-[320px] px-4 py-3 text-muted-foreground">
            <span className="line-clamp-2">{carrier.importError ?? "-"}</span>
          </td>
          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
            {new Date(carrier.scrapedAt).toLocaleString()}
          </td>
        </tr>
      ))}
    </TableShell>
  );
}
