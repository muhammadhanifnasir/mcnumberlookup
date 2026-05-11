import { NextResponse } from "next/server";

import { listCarrierRecordsPaginated } from "@/services/carrier-repository.service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = Number.parseInt(searchParams.get("pageSize") ?? "50", 10);
    const search = searchParams.get("search") ?? undefined;
    const importStatus = searchParams.get("importStatus") ?? undefined;
    const usdotStatus = searchParams.get("usdotStatus") ?? undefined;

    const result = await listCarrierRecordsPaginated({
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 50,
      search,
      importStatus:
        importStatus === "imported" || importStatus === "not_found" || importStatus === "failed"
          ? importStatus
          : undefined,
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
