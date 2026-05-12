"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Eye, RefreshCcw, RotateCcw, Trash2 } from "lucide-react";

import { CarrierDetailsModal } from "@/components/carriers/carrier-details-modal";
import { StatusBadge } from "@/components/carriers/status-badge";
import { DataTable } from "@/components/common/data-table";
import { Pagination } from "@/components/common/pagination";
import { SearchBar } from "@/components/common/search-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CarrierRecord } from "@/types/carrier";

type CarrierListResponse = {
  data?: CarrierRecord[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  error?: string;
};

const CONFIRM_DELETE_TIMEOUT_MS = 5_000;

export function CarriersDashboard() {
  const [records, setRecords] = useState<CarrierRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [retryingMc, setRetryingMc] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierRecord | null>(null);
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);

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
      const payload = (await response.json()) as CarrierListResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load carriers.");
      }

      setRecords(payload.data ?? []);
      setTotal(payload.pagination?.total ?? 0);
      setTotalPages(payload.pagination?.totalPages ?? 0);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load carriers.");
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

  useEffect(() => {
    if (!confirmDeleteAll) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setConfirmDeleteAll(false);
    }, CONFIRM_DELETE_TIMEOUT_MS);

    return () => window.clearTimeout(timeout);
  }, [confirmDeleteAll]);

  const retryImport = useCallback(async (mcNumber: string) => {
    try {
      setRetryingMc(mcNumber);
      const response = await fetch("/api/import-carriers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mcNumbers: [mcNumber] }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? `Failed to retry MC ${mcNumber}.`);
      }
      await loadData();
    } catch (retryError) {
      setError(retryError instanceof Error ? retryError.message : "Retry failed.");
    } finally {
      setRetryingMc(null);
    }
  }, [loadData]);

  const deleteAllCarriers = useCallback(async () => {
    if (!confirmDeleteAll) {
      setConfirmDeleteAll(true);
      return;
    }

    try {
      setDeletingAll(true);
      setError(null);
      setConfirmDeleteAll(false);

      const response = await fetch("/api/carriers?all=true", { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to delete carriers.");
      }

      setSelectedCarrier(null);
      setPage(1);
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete carriers.");
    } finally {
      setDeletingAll(false);
    }
  }, [confirmDeleteAll, loadData]);

  const columns = useMemo<ColumnDef<CarrierRecord>[]>(
    () => [
      {
        accessorKey: "mcNumber",
        header: "MC Number",
        cell: ({ row }) => <span className="font-medium">MC {row.original.mcNumber}</span>,
      },
      {
        accessorKey: "usdotNumber",
        header: "USDOT Number",
        cell: ({ row }) => row.original.usdotNumber ?? "-",
      },
      {
        accessorKey: "legalName",
        header: "Legal Name",
        cell: ({ row }) => row.original.legalName ?? row.original.dbaName ?? "-",
      },
      {
        accessorKey: "ownerStatus",
        header: "Owner Status",
        cell: ({ row }) => row.original.ownerStatus ?? "-",
      },
      {
        accessorKey: "emailAddress",
        header: "Email",
        cell: ({ row }) => row.original.emailAddress ?? "-",
      },
      {
        accessorKey: "physicalAddress",
        header: "Physical Address",
        cell: ({ row }) => (
          <div className="max-w-xs whitespace-normal text-muted-foreground">
            {row.original.physicalAddress ?? "-"}
          </div>
        ),
      },
      {
        accessorKey: "truckType",
        header: "Truck Type",
        cell: ({ row }) => row.original.truckType ?? "-",
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => row.original.phone ?? "-",
      },
      {
        accessorKey: "powerUnits",
        header: "Power Units",
        cell: ({ row }) => row.original.powerUnits ?? "-",
      },
      {
        accessorKey: "drivers",
        header: "Drivers",
        cell: ({ row }) => row.original.drivers ?? "-",
      },
      {
        accessorKey: "usdotStatus",
        header: "USDOT Status",
        cell: ({ row }) => <StatusBadge status={row.original.usdotStatus} kind="usdot" />,
      },
      {
        accessorKey: "importStatus",
        header: "Import Status",
        cell: ({ row }) => <StatusBadge status={row.original.importStatus} kind="import" />,
      },
      {
        id: "createdAt",
        accessorFn: (row) => new Date(row.scrapedAt).getTime(),
        header: "Created At",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {new Date(row.original.scrapedAt).toLocaleString()}
          </span>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: "Actions",
        cell: ({ row }) => {
          const isRetrying = retryingMc === row.original.mcNumber;
          const canRetry = row.original.importStatus === "failed";

          return (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => setSelectedCarrier(row.original)}
              >
                <Eye className="mr-1 h-3.5 w-3.5" />
                View
              </Button>
              {canRetry ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 px-2 text-xs"
                  onClick={() => void retryImport(row.original.mcNumber)}
                  disabled={isRetrying}
                >
                  <RotateCcw className="mr-1 h-3.5 w-3.5" />
                  {isRetrying ? "Retrying..." : "Retry"}
                </Button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [retryImport, retryingMc],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carrier Results Dashboard</CardTitle>
        <CardDescription>
          Imported FMCSA SAFER carriers with live status, sorting, search, and recovery actions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md">
            <SearchBar value={searchInput} onChange={setSearchInput} disabled={loading} />
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => void loadData()} disabled={loading}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void deleteAllCarriers()}
              disabled={loading || deletingAll}
              aria-label={confirmDeleteAll ? "Click again to confirm deletion of all carriers" : "Delete all carriers"}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deletingAll ? "Deleting..." : confirmDeleteAll ? "Click Again to Confirm" : "Delete All"}
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={records}
          sorting={sorting}
          onSortingChange={setSorting}
          isLoading={loading}
          error={error}
          onErrorRetry={() => void loadData()}
          emptyTitle="No carriers imported yet"
          emptyDescription="Import carriers from the Carrier Import page to see results here."
          getRowId={(row) => row.id ?? `${row.mcNumber}-${row.scrapedAt}`}
          mobileCard={(row) => (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-card-foreground">MC {row.mcNumber}</p>
                  <p className="text-xs text-muted-foreground">{row.legalName ?? row.dbaName ?? "-"}</p>
                </div>
                <StatusBadge status={row.importStatus} kind="import" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>USDOT: {row.usdotNumber ?? "-"}</div>
                <div>Owner: {row.ownerStatus ?? "-"}</div>
                <div>Email: {row.emailAddress ?? "-"}</div>
                <div>Phone: {row.phone ?? "-"}</div>
                <div>Truck Type: {row.truckType ?? "-"}</div>
                <div>Power Units: {row.powerUnits ?? "-"}</div>
                <div>Drivers: {row.drivers ?? "-"}</div>
                <div className="col-span-2">Address: {row.physicalAddress ?? "-"}</div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <StatusBadge status={row.usdotStatus} kind="usdot" />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 px-2 text-xs"
                    onClick={() => setSelectedCarrier(row)}
                  >
                    View
                  </Button>
                  {row.importStatus === "failed" ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 px-2 text-xs"
                      onClick={() => void retryImport(row.mcNumber)}
                      disabled={retryingMc === row.mcNumber}
                    >
                      Retry
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        />

        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          disabled={loading}
          onPageChange={(nextPage) => setPage(Math.max(1, nextPage))}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(1);
          }}
        />
      </CardContent>

      <CarrierDetailsModal carrier={selectedCarrier} onClose={() => setSelectedCarrier(null)} />
    </Card>
  );
}
