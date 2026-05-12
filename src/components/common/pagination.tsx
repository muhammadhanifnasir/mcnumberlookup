"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (nextPage: number) => void;
  onPageSizeChange: (nextPageSize: number) => void;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  disabled = false,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const hasRows = total > 0;
  const start = hasRows ? (page - 1) * pageSize + 1 : 0;
  const end = hasRows ? Math.min(page * pageSize, total) : 0;

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {hasRows ? `Showing ${start}-${end} of ${total}` : "No records"}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-24">
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
            disabled={disabled}
          >
            <SelectTrigger aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
          className="h-10 px-3"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Prev
        </Button>
        <span className="min-w-20 text-center text-sm text-muted-foreground">
          Page {totalPages === 0 ? 0 : page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || totalPages === 0 || page >= totalPages}
          className="h-10 px-3"
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
