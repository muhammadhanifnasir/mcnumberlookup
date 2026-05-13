import { NextResponse } from "next/server";

import {
  deleteAllCarrierRecords,
  deleteCarrierRecordByMcNumber,
  listCarrierRecordsPaginated,
} from "@/services/carrier-repository.service";
import { parseMcNumbers } from "@/utils/mc";
import { mapImportStatus } from "@/utils/carrier-type-mappers";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");
    const page = Number.parseInt(pageParam ?? "1", 10);
    const pageSize = Number.parseInt(pageSizeParam ?? "50", 10);
    const search = searchParams.get("search") ?? undefined;
    const importStatus = searchParams.get("importStatus") ?? undefined;
    const usdotStatus = searchParams.get("usdotStatus") ?? undefined;

    const result = await listCarrierRecordsPaginated({
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 50,
      search,
      importStatus: mapImportStatus(importStatus),
      usdotStatus,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load carriers." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deleteAll = searchParams.get("all") === "true";
    const mcParam = searchParams.get("mcNumber");

    if (deleteAll) {
      const deleted = await deleteAllCarrierRecords();
      return NextResponse.json({ deleted });
    }

    if (!mcParam) {
      return NextResponse.json(
        { error: "Provide mcNumber or set all=true to delete carrier records." },
        { status: 400 },
      );
    }

    const [mcNumber] = parseMcNumbers(mcParam);
    if (!mcNumber) {
      return NextResponse.json({ error: "A valid MC number is required." }, { status: 400 });
    }

    const deleted = await deleteCarrierRecordByMcNumber(mcNumber);
    return NextResponse.json({ deleted, mcNumber });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete carriers." },
      { status: 500 },
    );
  }
}
