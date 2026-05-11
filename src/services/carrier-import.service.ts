import type { CarrierRecord } from "@/types/carrier";

import { upsertCarrierRecord } from "@/services/carrier-repository.service";
import { scrapeCarrierByMc } from "@/services/safer-scraper.service";

export async function importCarriersSequentially(mcNumbers: string[]) {
  const results: CarrierRecord[] = [];

  for (const mcNumber of mcNumbers) {
    const sourceUrl = `https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=MC_MX&query_string=${mcNumber}`;

    try {
      const scraped = await scrapeCarrierByMc(mcNumber);

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

  return results;
}
