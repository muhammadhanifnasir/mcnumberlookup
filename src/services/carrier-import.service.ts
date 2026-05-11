import type { Page } from "playwright";

import type { CarrierRecord } from "@/types/carrier";
import { upsertCarrierRecord } from "@/services/carrier-repository.service";
import { processSequentialQueue } from "@/services/queue.service";
import {
  buildSaferUrl,
  closeSaferScraperSession,
  createSaferScraperSession,
  scrapeCarrierByMcWithPage,
} from "@/services/safer-scraper.service";
import { randomDelay } from "@/utils/delay";
import { logger } from "@/utils/logger";
import { withRetry } from "@/utils/retry";

const SCRAPE_RETRY_OPTIONS = {
  maxAttempts: 3,
  baseDelayMs: 2_000,
  maxDelayMs: 15_000,
};

const UPSERT_RETRY_OPTIONS = {
  maxAttempts: 2,
  baseDelayMs: 1_000,
  maxDelayMs: 5_000,
};

const INTER_REQUEST_MIN_MS = 1_000;
const INTER_REQUEST_MAX_MS = 2_500;

function buildFailedRecord(mcNumber: string, error: unknown): CarrierRecord {
  const message = error instanceof Error ? error.message : String(error);

  return {
    mcNumber,
    sourceUrl: buildSaferUrl(mcNumber),
    scrapedAt: new Date().toISOString(),
    importStatus: "failed",
    importError: message || "Unknown scrape error",
  };
}

async function processOneMcNumber(mcNumber: string, page: Page): Promise<CarrierRecord> {
  const sourceUrl = buildSaferUrl(mcNumber);

  let record: CarrierRecord;

  try {
    const scraped = await withRetry(
      () => scrapeCarrierByMcWithPage(page, mcNumber),
      SCRAPE_RETRY_OPTIONS,
      `scrape MC#${mcNumber}`,
    );

    record = scraped
      ? { ...scraped, importStatus: "imported" }
      : {
          mcNumber,
          sourceUrl,
          scrapedAt: new Date().toISOString(),
          importStatus: "not_found",
          importError: "Carrier not found in FMCSA SAFER.",
        };
  } catch (error) {
    logger.error("Scrape failed after retries", {
      mcNumber,
      error: error instanceof Error ? error.message : String(error),
    });
    record = buildFailedRecord(mcNumber, error);
  }

  return withRetry(
    () => upsertCarrierRecord(record),
    UPSERT_RETRY_OPTIONS,
    `upsert MC#${mcNumber}`,
  );
}

export async function importCarriersSequentially(mcNumbers: string[]) {
  logger.info("Starting carrier import", { count: mcNumbers.length });

  const session = await createSaferScraperSession();

  try {
    const queueResults = await processSequentialQueue(mcNumbers, async (mcNumber) => {
      try {
        return await processOneMcNumber(mcNumber, session.page);
      } finally {
        await randomDelay(INTER_REQUEST_MIN_MS, INTER_REQUEST_MAX_MS);
      }
    },
    );

    const results: CarrierRecord[] = queueResults.map((qr) => {
      if (qr.result) return qr.result;
      // Build a failed record if the queue item itself threw unexpectedly
      return {
        mcNumber: String(qr.input),
        sourceUrl: buildSaferUrl(String(qr.input)),
        scrapedAt: new Date().toISOString(),
        importStatus: "failed" as const,
        importError: qr.error ?? "Unknown error",
      };
    });

    const imported = results.filter((r) => r.importStatus === "imported").length;
    const failed = results.filter((r) => r.importStatus === "failed").length;
    const notFound = results.filter((r) => r.importStatus === "not_found").length;
    logger.info("Carrier import complete", { imported, failed, notFound });

    return results;
  } finally {
    await closeSaferScraperSession(session);
  }
}
