import { NextResponse } from "next/server";

import { assertSupabaseConfiguration } from "@/lib/supabase/env";
import { importCarriersSequentially } from "@/services/carrier-import.service";
import { parseMcNumbers } from "@/utils/mc";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for larger sequential import batches

type ImportPayload = {
  mcInput?: string;
  mcNumbers?: string[];
};

export async function POST(request: Request) {
  try {
    assertSupabaseConfiguration();

    const payload = (await request.json()) as ImportPayload;
    const parsedFromInput = payload.mcInput ? parseMcNumbers(payload.mcInput) : [];
    const parsedFromArray = payload.mcNumbers
      ? payload.mcNumbers.flatMap((item) => parseMcNumbers(item))
      : [];

    const mcNumbers = Array.from(new Set([...parsedFromInput, ...parsedFromArray]));

    if (mcNumbers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one valid MC number is required.",
        },
        { status: 400 },
      );
    }

    const results = await importCarriersSequentially(mcNumbers);

    return NextResponse.json({
      success: true,
      data: {
        processed: mcNumbers.length,
        imported: results.filter((item) => item.importStatus === "imported").length,
        failed: results.filter((item) => item.importStatus === "failed").length,
        notFound: results.filter((item) => item.importStatus === "not_found").length,
        results,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 },
    );
  }
}
