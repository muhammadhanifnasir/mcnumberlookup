"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef, RowSelectionState, SortingState } from "@tanstack/react-table";
import { Download, Eye, RefreshCcw, RotateCcw, Trash2 } from "lucide-react";

import { CarrierDetailsModal } from "@/components/carriers/carrier-details-modal";
import { StatusBadge } from "@/components/carriers/status-badge";
import { DataTable } from "@/components/common/data-table";
import { Pagination } from "@/components/common/pagination";
import { SearchBar } from "@/components/common/search-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { readApiResponse } from "@/lib/api-client";
import type { CarrierRecord } from "@/types/carrier";

type CarrierListResponse = {
  data?: CarrierRecord[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

const CONFIRM_DELETE_TIMEOUT_MS = 5_000;
const EXPORT_PAGE_SIZE = 200;
const USDOT_STATUS_FILTER_ALL = "";
const USDOT_STATUS_VALUES = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  OUT_OF_SERVICE: "OUT OF SERVICE",
  NOT_AUTHORIZED: "NOT AUTHORIZED",
} as const;
const USDOT_STATUS_FILTER_OPTIONS = [
  { value: USDOT_STATUS_FILTER_ALL, label: "All extracted results" },
  { value: USDOT_STATUS_VALUES.ACTIVE, label: "Active" },
  { value: USDOT_STATUS_VALUES.INACTIVE, label: "Inactive" },
  { value: USDOT_STATUS_VALUES.OUT_OF_SERVICE, label: "Out of Service" },
  { value: USDOT_STATUS_VALUES.NOT_AUTHORIZED, label: "Not Authorized" },
] as const;

const EXPORT_HEADERS: Array<{ label: string; value: (record: CarrierRecord) => string | number | null | undefined }> = [
  { label: "MC Number", value: (record) => record.mcNumber },
  { label: "USDOT Number", value: (record) => record.usdotNumber },
  { label: "Authority Status", value: (record) => record.authorityStatus },
  { label: "Authority Date", value: (record) => record.authorityDate },
  { label: "Legal Name", value: (record) => record.legalName },
  { label: "DBA Name", value: (record) => record.dbaName },
  { label: "Owner Status", value: (record) => record.ownerStatus },
  { label: "Phone", value: (record) => record.phone },
  { label: "Power Units", value: (record) => record.powerUnits },
  { label: "Drivers", value: (record) => record.drivers },
  { label: "Physical Address", value: (record) => record.physicalAddress },
  { label: "Truck Type", value: (record) => record.truckType },
  { label: "Fleet Category", value: (record) => record.fleetSizeCategory },
  { label: "USDOT Status", value: (record) => record.usdotStatus },
  { label: "Created At", value: (record) => record.scrapedAt },
];

function toCsvCell(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  const raw = String(value);
  const escaped = raw.replace(/"/g, "\"\"");
  return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
}

function buildCarrierExportCsv(rows: CarrierRecord[]) {
  const headerRow = EXPORT_HEADERS.map((header) => toCsvCell(header.label)).join(",");
  const dataRows = rows.map((row) => EXPORT_HEADERS.map((header) => toCsvCell(header.value(row))).join(","));

  return [headerRow, ...dataRows].join("\n");
}

function InfoBadge({ value }: { value?: string }) {
  return (
    <span className="inline-flex rounded-full border border-slate-300/40 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
      {value ?? "-"}
    </span>
  );
}

export function CarriersDashboard() {
  const [records, setRecords] = useState<CarrierRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [usdotStatusFilter, setUsdotStatusFilter] = useState<string>(USDOT_STATUS_FILTER_ALL);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [retryingMc, setRetryingMc] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [confirmDeleteSelected, setConfirmDeleteSelected] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierRecord | null>(null);
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [downloading, setDownloading] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const getCarrierRowId = useCallback(
    (row: CarrierRecord) => row.id ?? `${row.mcNumber}-${row.scrapedAt}`,
    [],
  );

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
      if (usdotStatusFilter !== USDOT_STATUS_FILTER_ALL) {
        params.set("usdotStatus", usdotStatusFilter);
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
      setError(requestError instanceof Error ? requestError.message : "Failed to load carriers.");
      setRecords([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, usdotStatusFilter]);

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

  useEffect(() => {
    if (!confirmDeleteSelected) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setConfirmDeleteSelected(false);
    }, CONFIRM_DELETE_TIMEOUT_MS);

    return () => window.clearTimeout(timeout);
  }, [confirmDeleteSelected]);

  useEffect(() => {
    setRowSelection({});
    setConfirmDeleteSelected(false);
  }, [records]);

  const selectedRecords = useMemo(
    () => records.filter((record) => rowSelection[getCarrierRowId(record)]),
    [getCarrierRowId, records, rowSelection],
  );
  const selectedCount = selectedRecords.length;

  const retryImport = useCallback(async (mcNumber: string) => {
    try {
      setRetryingMc(mcNumber);
      const response = await fetch("/api/import-carriers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mcNumbers: [mcNumber] }),
      });
      await readApiResponse(response);
      await loadData();
    } catch (retryError) {
      setError(retryError instanceof Error ? retryError.message : "Retry failed.");
    } finally {
      setRetryingMc(null);
    }
  }, [loadData]);

  const refreshPage = useCallback(
    async (nextPage: number) => {
      if (nextPage !== page) {
        setPage(nextPage);
        return;
      }

      await loadData();
    },
    [loadData, page],
  );

  const deleteSelectedCarriers = useCallback(async () => {
    if (selectedCount === 0) {
      return;
    }

    if (!confirmDeleteSelected) {
      setConfirmDeleteSelected(true);
      return;
    }

    const mcNumbers = selectedRecords.map((record) => record.mcNumber);

    try {
      setDeletingSelected(true);
      setError(null);
      setConfirmDeleteSelected(false);

      const params = new URLSearchParams({ mcNumber: mcNumbers.join(",") });
      const response = await fetch(`/api/carriers?${params.toString()}`, { method: "DELETE" });
      await readApiResponse(response);

      setSelectedCarrier((current) =>
        current && mcNumbers.includes(current.mcNumber) ? null : current,
      );
      setRowSelection({});

      const nextPage = page > 1 && selectedCount >= records.length ? page - 1 : page;
      await refreshPage(nextPage);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete selected carriers.");
    } finally {
      setDeletingSelected(false);
    }
  }, [confirmDeleteSelected, page, records.length, refreshPage, selectedCount, selectedRecords]);

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
      await readApiResponse(response);

      setSelectedCarrier(null);
      setRowSelection({});
      await refreshPage(1);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete carriers.");
    } finally {
      setDeletingAll(false);
    }
  }, [confirmDeleteAll, refreshPage]);

  const downloadCarrierResults = useCallback(async () => {
    try {
      setDownloading(true);
      setError(null);

      const allRecords: CarrierRecord[] = [];
      let nextPage = 1;
      let totalPages = 1;

      while (nextPage <= totalPages) {
        const params = new URLSearchParams({
          page: String(nextPage),
          pageSize: String(EXPORT_PAGE_SIZE),
        });
        if (search.trim()) {
          params.set("search", search.trim());
        }
        if (usdotStatusFilter !== USDOT_STATUS_FILTER_ALL) {
          params.set("usdotStatus", usdotStatusFilter);
        }

        const response = await fetch(`/api/carriers?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });
        const payload = await readApiResponse<CarrierListResponse>(response);
        const pageRecords = payload.data ?? [];
        allRecords.push(...pageRecords);
        totalPages = payload.pagination?.totalPages ?? 0;
        nextPage += 1;
      }

      if (allRecords.length === 0) {
        throw new Error("No carrier results available to download.");
      }

      const csv = buildCarrierExportCsv(allRecords);
      const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
      const objectUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = objectUrl;
      downloadLink.download = `carrier-results-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(objectUrl);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Failed to download carrier results.");
    } finally {
      setDownloading(false);
    }
  }, [search, usdotStatusFilter]);

  const columns = useMemo<ColumnDef<CarrierRecord>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
            aria-label="Select all carriers on this page"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
            aria-label={`Select carrier MC ${row.original.mcNumber}`}
          />
        ),
      },
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
        accessorKey: "authorityStatus",
        header: "Authority Status",
        cell: ({ row }) => row.original.authorityStatus ?? "-",
      },
      {
        accessorKey: "authorityDate",
        header: "Authority Date",
        cell: ({ row }) => row.original.authorityDate ?? "-",
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
        accessorKey: "physicalAddress",
        header: "Physical Address",
        cell: ({ row }) => (
          <div className="max-w-xs whitespace-normal text-muted-foreground">
            {row.original.physicalAddress ?? "-"}
          </div>
        ),
      },
      {
        accessorKey: "fleetSizeCategory",
        header: "Fleet Category",
        cell: ({ row }) => <InfoBadge value={row.original.fleetSizeCategory} />,
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
          Carrier intelligence records with SAFER enrichment, classification, and recovery actions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid w-full gap-3 lg:max-w-3xl lg:grid-cols-[minmax(0,1fr)_240px]">
            <SearchBar value={searchInput} onChange={setSearchInput} disabled={loading} />
            <Select
              value={usdotStatusFilter}
              onValueChange={(nextStatus) => {
                setUsdotStatusFilter(nextStatus);
                setPage(1);
              }}
              disabled={loading}
            >
              <SelectTrigger aria-label="Filter extracted results">
                <SelectValue placeholder="Filter extracted results" />
              </SelectTrigger>
              <SelectContent>
                {USDOT_STATUS_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {selectedCount > 0 ? (
              <span className="text-sm font-medium text-muted-foreground">{selectedCount} selected</span>
            ) : null}
            <Button type="button" variant="outline" onClick={() => void loadData()} disabled={loading}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void downloadCarrierResults()}
              disabled={loading || downloading}
            >
              <Download className="mr-2 h-4 w-4" />
              {downloading ? "Downloading..." : "Download Excel"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void deleteSelectedCarriers()}
              disabled={loading || deletingSelected || selectedCount === 0}
              aria-label={
                confirmDeleteSelected
                  ? `Click again to confirm deletion of ${selectedCount} selected carriers`
                  : `Delete ${selectedCount} selected carriers`
              }
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deletingSelected
                ? "Deleting Selected..."
                : confirmDeleteSelected
                  ? `Confirm Delete (${selectedCount})`
                  : `Delete Selected (${selectedCount})`}
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
          getRowId={getCarrierRowId}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          mobileCard={(tableRow) => {
            const row = tableRow.original;

            return (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={tableRow.getIsSelected()}
                      onCheckedChange={(value) => tableRow.toggleSelected(Boolean(value))}
                      aria-label={`Select carrier MC ${row.mcNumber}`}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">MC {row.mcNumber}</p>
                      <p className="text-xs text-muted-foreground">{row.legalName ?? row.dbaName ?? "-"}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>USDOT: {row.usdotNumber ?? "-"}</div>
                  <div>Authority Status: {row.authorityStatus ?? "-"}</div>
                  <div>Authority Date: {row.authorityDate ?? "-"}</div>
                  <div>Owner: {row.ownerStatus ?? "-"}</div>
                  <div>Phone: {row.phone ?? "-"}</div>
                  <div>Fleet: {row.fleetSizeCategory ?? "-"}</div>
                  <div>Power Units: {row.powerUnits ?? "-"}</div>
                  <div>Drivers: {row.drivers ?? "-"}</div>
                  <div className="col-span-2">Address: {row.physicalAddress ?? "-"}</div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={row.usdotStatus} kind="usdot" />
                  </div>
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
            );
          }}
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
