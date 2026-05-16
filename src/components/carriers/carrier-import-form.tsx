"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { CarriersTable } from "@/components/carriers/carriers-table";
import { readApiResponse } from "@/lib/api-client";
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

const IMPORT_BATCH_SIZE = 25;

export function CarrierImportForm() {
  const [mcInput, setMcInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportResponse | null>(null);
  const [batchProgress, setBatchProgress] = useState<{
    currentBatch: number;
    totalBatches: number;
  } | null>(null);

  const parsedMcNumbers = useMemo(() => Array.from(new Set(parseMcNumbers(mcInput))), [mcInput]);
  const parsedCount = parsedMcNumbers.length;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSummary(null);
    setIsSubmitting(true);

    try {
      const mcNumbers = parsedMcNumbers;

      if (mcNumbers.length === 0) {
        throw new Error("At least one valid MC number is required.");
      }

      const totalBatches = Math.ceil(mcNumbers.length / IMPORT_BATCH_SIZE);
      const aggregated: ImportResponse = {
        processed: 0,
        imported: 0,
        failed: 0,
        notFound: 0,
        results: [],
      };
      const failedBatches: string[] = [];

      for (let i = 0; i < totalBatches; i++) {
        const batchStart = i * IMPORT_BATCH_SIZE;
        const batchMcNumbers = mcNumbers.slice(batchStart, batchStart + IMPORT_BATCH_SIZE);
        setBatchProgress({ currentBatch: i + 1, totalBatches });

        try {
          const response = await fetch("/api/carrier-import", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ mcNumbers: batchMcNumbers }),
          });

          const payload = await readApiResponse<ImportResponse>(response);
          aggregated.processed += payload.processed;
          aggregated.imported += payload.imported;
          aggregated.failed += payload.failed;
          aggregated.notFound += payload.notFound;
          aggregated.results.push(...payload.results);
        } catch (batchError) {
          const message = batchError instanceof Error ? batchError.message : "Import failed.";
          failedBatches.push(`Batch ${i + 1}/${totalBatches}: ${message}`);
        }
      }

      setSummary(aggregated);
      if (failedBatches.length > 0) {
        const preview = failedBatches.slice(0, 3).join(" | ");
        const remaining = failedBatches.length - 3;
        const suffix = remaining > 0 ? ` | +${remaining} more` : "";
        setError(`Some batches failed. ${preview}${suffix}`);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Import failed.");
    } finally {
      setBatchProgress(null);
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
              1000-1010. Imports run sequentially in timeout-safe batches for scraping and enrichment.
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
                  {isSubmitting ? "Importing..." : "Start Sequential Import"}
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
      {isSubmitting ? (
        <LoadingState
          label={
            batchProgress
              ? `Processing batch ${batchProgress.currentBatch}/${batchProgress.totalBatches}...`
              : "Preparing import batches..."
          }
        />
      ) : null}

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
            <CarriersTable data={summary.results} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
