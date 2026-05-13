"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { CarriersTable } from "@/components/carriers/carriers-table";
import type { CarrierRecord } from "@/types/carrier";
import { parseMcNumbers } from "@/utils/mc";
import { cn } from "@/lib/utils";

type ImportResponse = {
  processed: number;
  imported: number;
  failed: number;
  notFound: number;
  results: CarrierRecord[];
};

const CSV_COLUMNS: { header: string; value: (carrier: CarrierRecord) => string }[] = [
  { header: "MC", value: (carrier) => carrier.mcNumber },
  { header: "USDOT", value: (carrier) => carrier.usdotNumber ?? "" },
  { header: "Carrier", value: (carrier) => carrier.legalName ?? carrier.dbaName ?? "" },
  { header: "Owner Status", value: (carrier) => carrier.ownerStatus ?? "" },
  { header: "Email", value: (carrier) => carrier.emailAddress ?? "" },
  { header: "Physical Address", value: (carrier) => carrier.physicalAddress ?? "" },
  { header: "Truck Type", value: (carrier) => carrier.truckType ?? "" },
  { header: "Phone", value: (carrier) => carrier.phone ?? "" },
  { header: "Status", value: (carrier) => carrier.importStatus },
  { header: "Scraped At", value: (carrier) => carrier.scrapedAt },
];

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function toCsv(rows: CarrierRecord[]) {
  const header = CSV_COLUMNS.map((column) => escapeCsv(column.header)).join(",");
  const lines = rows.map((row) => CSV_COLUMNS.map((column) => escapeCsv(column.value(row))).join(","));

  return `${header}\n${lines.join("\n")}`;
}

export function CarrierImportForm() {
  const [mcInput, setMcInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportResponse | null>(null);

  const parsedCount = useMemo(() => parseMcNumbers(mcInput).length, [mcInput]);
  const hasResults = Boolean(summary?.results.length);

  function onDownloadCsv() {
    if (!summary?.results.length) {
      return;
    }

    const csvContent = toCsv(summary.results);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replaceAll(":", "-");

    link.href = url;
    link.setAttribute("download", `carrier-import-results-${timestamp}.csv`);
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/carrier-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mcInput }),
      });

      const payload = (await response.json()) as Partial<ImportResponse> & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Import failed.");
      }

      setSummary(payload as ImportResponse);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Import failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import MC Numbers</CardTitle>
          <CardDescription>
            Paste MC numbers separated by line, comma, or semicolon. You can also enter ranges like
            1000-1010. Imports run with parallel workers for faster extraction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <textarea
              value={mcInput}
              onChange={(event) => setMcInput(event.target.value)}
              placeholder="MC 123456\nMC 654321\n1000-1010"
              className="min-h-40 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Valid MC count: {parsedCount}</p>
              <div className="flex items-center gap-2">
                <Button type="submit" disabled={isSubmitting || parsedCount === 0}>
                  {isSubmitting ? "Importing..." : "Start Fast Import"}
                </Button>
                <Link href="/carriers" className={cn(buttonVariants({ variant: "outline" }))}>
                  View Carriers
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {error ? <ErrorState message={error} /> : null}
      {isSubmitting ? <LoadingState label="Processing MC numbers with parallel workers..." /> : null}

      {summary ? (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
            <CardDescription>
              Processed {summary.processed} • Imported {summary.imported} • Not Found {summary.notFound} • Failed{" "}
              {summary.failed}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex justify-end">
              <Button type="button" variant="outline" onClick={onDownloadCsv} disabled={!hasResults}>
                Download CSV
              </Button>
            </div>
            <CarriersTable data={summary.results} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
