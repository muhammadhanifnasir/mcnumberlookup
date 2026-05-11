"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CarriersTable } from "@/components/carriers/carriers-table";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import type { CarrierRecord } from "@/types/carrier";

export function CarriersDashboard() {
  const [data, setData] = useState<CarrierRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const response = await fetch("/api/carriers", {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await response.json()) as { data?: CarrierRecord[]; error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load carriers.");
        }

        if (isMounted) {
          setData(payload.data ?? []);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load carriers.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Carriers</CardTitle>
        <CardDescription>Latest imported FMCSA SAFER carrier records from Supabase.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <LoadingState label="Loading carriers..." /> : null}
        {error ? <ErrorState message={error} /> : null}
        {!loading && !error ? <CarriersTable data={data} /> : null}
      </CardContent>
    </Card>
  );
}
