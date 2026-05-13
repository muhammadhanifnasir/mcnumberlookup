import type { CarrierRecord, EnrichmentStatus } from "@/types/carrier";

import { classifyCarrier } from "@/services/carrier-classification.service";
import { extractBusinessEmailFromWebsite } from "@/services/email-extraction.service";
import { discoverCarrierWebsite } from "@/services/website-discovery.service";
import { normalizeEmail, normalizeWebsiteUrl, normalizeWhitespace } from "@/utils/normalization";

function resolveEnrichmentStatus(input: {
  website?: string;
  emailAddress?: string;
  cargoCarried?: string;
  operationClassification?: string;
  carrierOperation?: string;
  inferredTruckType?: string;
}): EnrichmentStatus {
  const completeSignals = [
    input.website,
    input.emailAddress,
    input.cargoCarried,
    input.operationClassification,
    input.carrierOperation,
    input.inferredTruckType,
  ].filter(Boolean).length;

  if (completeSignals >= 4) return "enriched";
  if (completeSignals >= 1) return "partial";
  return "failed";
}

function resolveDataSource(input: { website?: string; emailAddress?: string }) {
  if (input.website || input.emailAddress) return "fmcsa_safer+website";
  return "fmcsa_safer";
}

export async function enrichCarrierRecord(record: CarrierRecord): Promise<CarrierRecord> {
  const saferWebsite = normalizeWebsiteUrl(record.website);
  const discoveredWebsite =
    saferWebsite ??
    (await discoverCarrierWebsite({
      legalName: record.legalName,
      dbaName: record.dbaName,
    }));

  const website = normalizeWebsiteUrl(discoveredWebsite);
  const scrapedWebsiteEmail = website ? await extractBusinessEmailFromWebsite(website) : undefined;
  const emailAddress = normalizeEmail(record.emailAddress) ?? normalizeEmail(scrapedWebsiteEmail);

  const cargoCarried = normalizeWhitespace(record.cargoCarried ?? record.truckType);
  const operationClassification = normalizeWhitespace(record.operationClassification);
  const carrierOperation = normalizeWhitespace(record.carrierOperation ?? record.ownerStatus);

  const classification = classifyCarrier({
    cargoCarried,
    operationClassification,
    carrierOperation,
    legalName: record.legalName,
    dbaName: record.dbaName,
    powerUnits: record.powerUnits,
    drivers: record.drivers,
  });

  const enrichmentStatus = resolveEnrichmentStatus({
    website,
    emailAddress,
    cargoCarried,
    operationClassification,
    carrierOperation,
    inferredTruckType: classification.inferredTruckType,
  });

  return {
    ...record,
    website,
    emailAddress,
    cargoCarried,
    operationClassification,
    carrierOperation,
    fleetSizeCategory: classification.fleetSizeCategory,
    inferredTruckType: classification.inferredTruckType,
    equipmentType: classification.equipmentType,
    dataSource: resolveDataSource({ website, emailAddress }),
    enrichmentStatus,
  };
}
