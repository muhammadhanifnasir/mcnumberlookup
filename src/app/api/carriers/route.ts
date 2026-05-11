import { NextResponse } from "next/server";

import { listCarrierRecords } from "@/services/carrier-repository.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await listCarrierRecords(200);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load carriers." },
      { status: 500 },
    );
  }
}
