"use client";

import { type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type OnChangeFn,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  isLoading?: boolean;
  error?: string | null;
  onErrorRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  getRowId?: (row: TData, index: number) => string;
  mobileCard?: (row: TData) => ReactNode;
};

export function DataTable<TData>({
  columns,
  data,
  sorting,
  onSortingChange,
  isLoading = false,
  error = null,
  onErrorRetry,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your filters or import more data.",
  getRowId,
  mobileCard,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId,
  });

  const colSpan = table.getAllLeafColumns().length || 1;
  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isSortable = header.column.getCanSort();
                    const sortState = header.column.getIsSorted();

                    return (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                      >
                        {header.isPlaceholder ? null : isSortable ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-2"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <ArrowUpDown
                              className={cn(
                                "h-4 w-4",
                                sortState ? "text-card-foreground" : "text-muted-foreground",
                              )}
                            />
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 8 }, (_, index) => (
                  <tr key={`loading-${index}`}>
                    <td colSpan={colSpan} className="px-4 py-4">
                      <div className="h-5 w-full animate-pulse rounded bg-muted/60" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-10 text-center">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-red-700">{error}</p>
                      {onErrorRetry ? (
                        <Button type="button" variant="outline" onClick={onErrorRetry}>
                          <RefreshCcw className="mr-2 h-4 w-4" />
                          Try again
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ) : rows.length > 0 ? (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-top text-card-foreground">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-10 text-center">
                    <div className="space-y-1">
                      <p className="font-medium text-card-foreground">{emptyTitle}</p>
                      <p className="text-sm text-muted-foreground">{emptyDescription}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {isLoading ? (
          Array.from({ length: 6 }, (_, index) => (
            <div key={`mobile-loading-${index}`} className="rounded-xl border border-border bg-card p-4">
              <div className="h-4 w-full animate-pulse rounded bg-muted/60" />
            </div>
          ))
        ) : error ? (
          <div className="rounded-xl border border-red-300/30 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : rows.length > 0 && mobileCard ? (
          rows.map((row) => (
            <div key={row.id} className="rounded-xl border border-border bg-card p-4">
              {mobileCard(row.original)}
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="font-medium text-card-foreground">{emptyTitle}</p>
            <p className="text-sm text-muted-foreground">{emptyDescription}</p>
          </div>
        )}
      </div>
    </div>
  );
}
