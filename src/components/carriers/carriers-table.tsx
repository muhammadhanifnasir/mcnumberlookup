import type { CarrierRecord } from "@/types/carrier";

import { TableShell } from "@/components/common/table-shell";

const columns = [
  { key: "mc", label: "MC" },
  { key: "usdot", label: "USDOT Number" },
  { key: "authorityStatus", label: "Authority Status" },
  { key: "authorityDate", label: "Authority Date" },
  { key: "name", label: "Carrier" },
  { key: "ownerStatus", label: "Owner Status" },
  { key: "physicalAddress", label: "Physical Address" },
  { key: "fleetSizeCategory", label: "Fleet Category" },
  { key: "phone", label: "Phone" },
  { key: "updated", label: "Scraped At" },
];

export function CarriersTable({ data }: { data: CarrierRecord[] }) {
  return (
    <TableShell columns={columns} emptyMessage="No carrier records yet.">
      {data.map((carrier) => (
        <tr key={`${carrier.mcNumber}-${carrier.scrapedAt}`}>
          <td className="whitespace-nowrap px-4 py-3 font-medium text-card-foreground">MC {carrier.mcNumber}</td>
          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{carrier.usdotNumber ?? "-"}</td>
          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{carrier.authorityStatus ?? "-"}</td>
          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{carrier.authorityDate ?? "-"}</td>
          <td className="px-4 py-3 text-card-foreground">{carrier.legalName ?? carrier.dbaName ?? "-"}</td>
          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{carrier.ownerStatus ?? "-"}</td>
          <td className="px-4 py-3 text-muted-foreground">{carrier.physicalAddress ?? "-"}</td>
          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{carrier.fleetSizeCategory ?? "-"}</td>
          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{carrier.phone ?? "-"}</td>
          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
            {new Date(carrier.scrapedAt).toLocaleString()}
          </td>
        </tr>
      ))}
    </TableShell>
  );
}
