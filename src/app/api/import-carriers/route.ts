import { NextResponse } from "next/server";

import { assertSupabaseConfiguration } from "@/lib/supabase/env";
import { importCarriersSequentially } from "@/services/carrier-import.service";
import { logger } from "@/utils/logger";
import { parseMcNumbers } from "@/utils/mc";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes to handle large batches

type ImportCarriersPayload = {
  mcNumbers: string[];
};

export async function POST(request: Request) {
  try {
    assertSupabaseConfiguration();

    const payload = (await request.json()) as ImportCarriersPayload;

    if (!Array.isArray(payload.mcNumbers)) {
      return NextResponse.json(
        { error: "mcNumbers must be an array of MC number strings." },
        { status: 400 },
      );
    }

    const mcNumbers = Array.from(
      new Set(payload.mcNumbers.flatMap((item) => parseMcNumbers(item))),
    );

    if (mcNumbers.length === 0) {
      return NextResponse.json(
        { error: "At least one valid MC number is required." },
        { status: 400 },
      );
    }

    logger.info("/api/import-carriers request received", { count: mcNumbers.length });

    const results = await importCarriersSequentially(mcNumbers);

    return NextResponse.json({
      processed: mcNumbers.length,
      imported: results.filter((r) => r.importStatus === "imported").length,
      failed: results.filter((r) => r.importStatus === "failed").length,
      notFound: results.filter((r) => r.importStatus === "not_found").length,
      results,
    });
  } catch (error) {
    logger.error("/api/import-carriers unhandled error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import carriers." },
      { status: 500 },
    );
  }
}
