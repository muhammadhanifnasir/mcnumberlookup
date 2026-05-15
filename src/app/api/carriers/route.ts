import { NextResponse } from "next/server";

import {
  deleteAllCarrierRecords,
  deleteCarrierRecordByMcNumber,
  deleteCarrierRecordsByMcNumbers,
  listCarrierRecordsPaginated,
} from "@/services/carrier-repository.service";
import { parseMcNumbers } from "@/utils/mc";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");
    const page = Number.parseInt(pageParam ?? "1", 10);
    const pageSize = Number.parseInt(pageSizeParam ?? "50", 10);
    const search = searchParams.get("search") ?? undefined;
    const usdotStatus = searchParams.get("usdotStatus") ?? undefined;

    const result = await listCarrierRecordsPaginated({
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 50,
      search,
      usdotStatus,
    });

    return NextResponse.json({
      success: true,
      data: result,
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deleteAll = searchParams.get("all") === "true";
    const mcParam = searchParams.get("mcNumber");

    if (deleteAll) {
      const deleted = await deleteAllCarrierRecords();
      return NextResponse.json({
        success: true,
        data: { deleted },
      });
    }

    if (!mcParam) {
      return NextResponse.json(
        {
          success: false,
          error: "Provide mcNumber or set all=true to delete carrier records.",
        },
        { status: 400 },
      );
    }

    const mcNumbers = parseMcNumbers(mcParam);
    const [mcNumber] = mcNumbers;
    if (!mcNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid MC number is required.",
        },
        { status: 400 },
      );
    }

    if (mcNumbers.length > 1) {
      const deleted = await deleteCarrierRecordsByMcNumbers(mcNumbers);
      return NextResponse.json({
        success: true,
        data: { deleted, mcNumbers },
      });
    }

    const deleted = await deleteCarrierRecordByMcNumber(mcNumber);
    return NextResponse.json({
      success: true,
      data: { deleted, mcNumber },
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
