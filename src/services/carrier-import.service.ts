import type { CarrierRecord } from "@/types/carrier";

import { upsertCarrierRecord } from "@/services/carrier-repository.service";
import {
  buildSaferUrl,
  closeSaferScraperSession,
  createSaferScraperSession,
  scrapeCarrierByMcWithPage,
} from "@/services/safer-scraper.service";

export async function importCarriersSequentially(mcNumbers: string[]) {
  const results: CarrierRecord[] = [];
  const session = await createSaferScraperSession();

  try {
    for (const mcNumber of mcNumbers) {
      const sourceUrl = buildSaferUrl(mcNumber);

      try {
        const scraped = await scrapeCarrierByMcWithPage(session.page, mcNumber);

        const result: CarrierRecord = scraped
          ? {
              ...scraped,
              importStatus: "imported",
            }
          : {
              mcNumber,
              sourceUrl,
              scrapedAt: new Date().toISOString(),
              importStatus: "not_found",
              importError: "Carrier not found in FMCSA SAFER.",
            };

        const saved = await upsertCarrierRecord(result);
        results.push(saved);
      } catch (error) {
        const failed: CarrierRecord = {
          mcNumber,
          sourceUrl,
          scrapedAt: new Date().toISOString(),
          importStatus: "failed",
          importError: error instanceof Error ? error.message : "Import failed",
        };

        try {
          const saved = await upsertCarrierRecord(failed);
          results.push(saved);
        } catch {
          results.push(failed);
        }
      }
    }
  } finally {
    await closeSaferScraperSession(session);
  }

  return results;
}
