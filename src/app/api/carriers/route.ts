import { NextResponse } from "next/server";

import { listCarriers } from "@/services/carrier-repository.service";
import type { CarrierImportStatus } from "@/types/carrier";

export const runtime = "nodejs";

const VALID_IMPORT_STATUSES: CarrierImportStatus[] = ["imported", "not_found", "failed"];

function parseImportStatusParam(statusParam: string | null) {
  if (!statusParam) return undefined;

  const statuses = statusParam
    .split(",")
    .map((status) => status.trim())
    .filter((status): status is CarrierImportStatus =>
      VALID_IMPORT_STATUSES.includes(status as CarrierImportStatus),
    );

  return statuses.length <= 1 ? statuses[0] : statuses;
}

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const pageSize = parsePositiveInt(searchParams.get("pageSize"), 50);
    const search = searchParams.get("search")?.trim() || undefined;
    const usdotStatus = searchParams.get("usdotStatus")?.trim() || undefined;
    const importStatus = parseImportStatusParam(searchParams.get("importStatus"));

    const result = await listCarriers({
      page,
      pageSize,
      search,
      usdotStatus,
      importStatus,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load carriers." },
      { status: 500 },
    );
  }
}
