"use client";

import { useCallback, useEffect, useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { Pagination } from "@/components/common/pagination";
import { SearchBar } from "@/components/common/search-bar";
import { TableShell } from "@/components/common/table-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readApiResponse } from "@/lib/api-client";
import type { CarrierRecord } from "@/types/carrier";
import { normalizeAuthorityStatusLabel } from "@/utils/parser";

type CarrierListResponse = {
  data?: CarrierRecord[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

const columns = [
  { key: "mc", label: "MC Number" },
  { key: "usdot", label: "USDOT Number" },
  { key: "authorityStatus", label: "Authority Status" },
  { key: "authorityDate", label: "Authority Date" },
  { key: "name", label: "Carrier" },
  { key: "scrapedAt", label: "Scraped At" },
];

export function UsdotNumbersDashboard() {
  const [records, setRecords] = useState<CarrierRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(`/api/carriers?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });
      const payload = await readApiResponse<CarrierListResponse>(response);
      setRecords(payload.data ?? []);
      setTotal(payload.pagination?.total ?? 0);
      setTotalPages(payload.pagination?.totalPages ?? 0);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load USDOT numbers.");
      setRecords([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>USDOT Numbers</CardTitle>
        <CardDescription>List of searched MC numbers with their related USDOT numbers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full lg:max-w-md">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            disabled={loading}
            placeholder="Search by MC, USDOT, or carrier name..."
            ariaLabel="Search USDOT number records"
          />
        </div>

        {error ? <ErrorState message={error} /> : null}
        {loading ? <LoadingState label="Loading USDOT number records..." /> : null}

        {!loading ? (
          <>
            <TableShell columns={columns} emptyMessage="No USDOT number records found.">
              {records.map((record, index) => (
                <tr key={record.id ?? `${record.mcNumber}-${record.scrapedAt}-${index}`}>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-card-foreground">
                    MC {record.mcNumber}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {record.usdotNumber ?? "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {normalizeAuthorityStatusLabel(record.authorityStatus) ?? "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {record.authorityDate ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-card-foreground">{record.legalName ?? record.dbaName ?? "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {new Date(record.scrapedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </TableShell>

            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              disabled={loading}
              onPageChange={setPage}
              onPageSizeChange={(nextPageSize) => {
                setPageSize(nextPageSize);
                setPage(1);
              }}
            />
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
