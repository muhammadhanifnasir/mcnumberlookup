"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { StatusBadge } from "@/components/carriers/status-badge";
import { Button } from "@/components/ui/button";
import type { CarrierRecord } from "@/types/carrier";

function DetailsRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1 rounded-lg border border-border p-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="text-sm text-card-foreground">{value || "-"}</p>
    </div>
  );
}

type CarrierDetailsModalProps = {
  carrier: CarrierRecord | null;
  onClose: () => void;
};

export function CarrierDetailsModal({ carrier, onClose }: CarrierDetailsModalProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!carrier) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="carrier-details-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <h3 id="carrier-details-title" className="text-lg font-semibold text-card-foreground">
              Carrier details
            </h3>
            <p className="text-sm text-muted-foreground">MC {carrier.mcNumber}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 w-9 p-0"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailsRow label="MC Number" value={carrier.mcNumber} />
            <DetailsRow label="USDOT Number" value={carrier.usdotNumber} />
            <DetailsRow label="Authority Status" value={carrier.authorityStatus} />
            <DetailsRow label="Authority Date" value={carrier.authorityDate} />
            <DetailsRow label="Legal Name" value={carrier.legalName ?? carrier.dbaName} />
            <DetailsRow label="Owner Status" value={carrier.ownerStatus} />
            <DetailsRow label="Phone" value={carrier.phone} />
            <DetailsRow label="Power Units" value={carrier.powerUnits} />
            <DetailsRow label="Drivers" value={carrier.drivers} />
            <DetailsRow label="Physical Address" value={carrier.physicalAddress} />
            <DetailsRow label="Truck Type" value={carrier.truckType} />
            <DetailsRow label="Cargo Carried" value={carrier.cargoCarried} />
            <DetailsRow label="Operation Classification" value={carrier.operationClassification} />
            <DetailsRow label="Carrier Operation" value={carrier.carrierOperation} />
            <DetailsRow label="Fleet Size Category" value={carrier.fleetSizeCategory} />
            <DetailsRow label="Authority Information" value={carrier.authorityInformation} />
            <DetailsRow label="Data Source" value={carrier.dataSource} />
            <DetailsRow label="Created At" value={new Date(carrier.scrapedAt).toLocaleString()} />
            <DetailsRow label="Source URL" value={carrier.sourceUrl} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={carrier.usdotStatus} kind="usdot" />
          </div>
        </div>
      </div>
    </div>
  );
}
