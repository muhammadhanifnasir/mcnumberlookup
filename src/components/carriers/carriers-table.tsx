 "use client";

import { useState } from "react";

import type { CarrierRecord } from "@/types/carrier";

import { TableShell } from "@/components/common/table-shell";
import { StatusBadge } from "@/components/carriers/status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const columns = [
  { key: "mc", label: "MC" },
  { key: "usdot", label: "USDOT" },
  { key: "name", label: "Carrier" },
  { key: "ownerStatus", label: "Owner Status" },
  { key: "email", label: "Email" },
  { key: "physicalAddress", label: "Physical Address" },
  { key: "truckType", label: "Truck Type" },
  { key: "phone", label: "Phone" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Scraped At" },
];

export function CarriersTable({ data }: { data: CarrierRecord[] }) {
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Showing {data.length} records</p>
        <div className="inline-flex items-center rounded-lg border border-border p-1">
          <Button
            type="button"
            variant="ghost"
            className={cn("h-8 px-3 text-xs", viewMode === "table" ? "bg-muted text-card-foreground" : "")}
            onClick={() => setViewMode("table")}
          >
            Table View
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={cn("h-8 px-3 text-xs", viewMode === "cards" ? "bg-muted text-card-foreground" : "")}
            onClick={() => setViewMode("cards")}
          >
            One-Screen View
          </Button>
        </div>
      </div>

      {viewMode === "table" ? (
        <TableShell columns={columns} emptyMessage="No carrier records yet.">
          {data.map((carrier) => (
            <tr key={`${carrier.mcNumber}-${carrier.scrapedAt}`}>
              <td className="whitespace-nowrap px-4 py-3 font-medium text-card-foreground">MC {carrier.mcNumber}</td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{carrier.usdotNumber ?? "-"}</td>
              <td className="px-4 py-3 text-card-foreground">{carrier.legalName ?? carrier.dbaName ?? "-"}</td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{carrier.ownerStatus ?? "-"}</td>
              <td className="px-4 py-3 text-muted-foreground">{carrier.emailAddress ?? "-"}</td>
              <td className="px-4 py-3 text-muted-foreground">{carrier.physicalAddress ?? "-"}</td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{carrier.truckType ?? "-"}</td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{carrier.phone ?? "-"}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <StatusBadge status={carrier.importStatus} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                {new Date(carrier.scrapedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </TableShell>
      ) : data.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.map((carrier) => (
            <div
              key={`${carrier.mcNumber}-${carrier.scrapedAt}`}
              className="space-y-3 rounded-xl border border-border bg-card p-4 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-card-foreground">MC {carrier.mcNumber}</p>
                  <p className="text-xs text-muted-foreground">{carrier.legalName ?? carrier.dbaName ?? "-"}</p>
                </div>
                <StatusBadge status={carrier.importStatus} />
              </div>
              <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                <div>USDOT: {carrier.usdotNumber ?? "-"}</div>
                <div>Owner: {carrier.ownerStatus ?? "-"}</div>
                <div>Email: {carrier.emailAddress ?? "-"}</div>
                <div>Truck: {carrier.truckType ?? "-"}</div>
                <div>Phone: {carrier.phone ?? "-"}</div>
                <div>Scraped: {new Date(carrier.scrapedAt).toLocaleDateString()}</div>
                <div className="sm:col-span-2">Address: {carrier.physicalAddress ?? "-"}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card px-4 py-8 text-center text-muted-foreground">
          No carrier records yet.
        </div>
      )}
    </div>
  );
}
