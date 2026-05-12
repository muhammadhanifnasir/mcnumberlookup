import type { Page } from "playwright-core";

import type { CarrierRecord } from "@/types/carrier";
import { upsertCarrierForImport } from "@/services/carrier-write.service";
import { processConcurrentQueue } from "@/services/queue.service";
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

const DEFAULT_IMPORT_CONCURRENCY = 4;
const MAX_IMPORT_CONCURRENCY = 8;
const INTER_REQUEST_MIN_MS = 500;
const INTER_REQUEST_MAX_MS = 1_200;

function resolveImportConcurrency(total: number) {
  const raw = process.env.IMPORT_CONCURRENCY;
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_IMPORT_CONCURRENCY;
  const bounded = Number.isFinite(parsed)
    ? Math.min(MAX_IMPORT_CONCURRENCY, Math.max(1, parsed))
    : DEFAULT_IMPORT_CONCURRENCY;
  return Math.min(total, bounded);
}

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
    () => upsertCarrierForImport(record),
    UPSERT_RETRY_OPTIONS,
    `upsert MC#${mcNumber}`,
  );
}

export async function importCarriersSequentially(mcNumbers: string[]) {
  logger.info("Starting carrier import", { count: mcNumbers.length });

  const session = await createSaferScraperSession();
  const concurrency = resolveImportConcurrency(mcNumbers.length);
  const pages: Page[] = [session.page];

  try {
    for (let i = 1; i < concurrency; i += 1) {
      pages.push(await session.browser.newPage());
    }

    logger.info("Import concurrency resolved", { concurrency });

    const queueResults = await processConcurrentQueue(
      mcNumbers,
      async (mcNumber, _index, _total, workerId) => {
        const page = pages[workerId]!;

        try {
          return await processOneMcNumber(mcNumber, page);
        } finally {
          await randomDelay(INTER_REQUEST_MIN_MS, INTER_REQUEST_MAX_MS);
        }
      },
      concurrency,
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
    await Promise.all(
      pages.slice(1).map(async (page) => {
        await page.close().catch(() => undefined);
      }),
    );
    await closeSaferScraperSession(session);
  }
}
