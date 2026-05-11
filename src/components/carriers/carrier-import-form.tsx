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

export function CarrierImportForm() {
  const [mcInput, setMcInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportResponse | null>(null);

  const parsedCount = useMemo(() => parseMcNumbers(mcInput).length, [mcInput]);

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
            Paste MC numbers separated by line, comma, or semicolon. Imports run sequentially.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <textarea
              value={mcInput}
              onChange={(event) => setMcInput(event.target.value)}
              placeholder="MC 123456\nMC 654321"
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
      {isSubmitting ? <LoadingState label="Processing MC numbers sequentially..." /> : null}

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
