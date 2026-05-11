export type CarrierImportStatus = "imported" | "not_found" | "failed";

export type ScrapedCarrierData = {
  mcNumber: string;
  usdotNumber?: string;
  legalName?: string;
  dbaName?: string;
  entityType?: string;
  phone?: string;
  physicalAddress?: string;
  mailingAddress?: string;
  operationClassification?: string;
  outOfServiceDate?: string;
  sourceUrl: string;
  scrapedAt: string;
};

export type CarrierRecord = ScrapedCarrierData & {
  id?: string;
  importStatus: CarrierImportStatus;
  importError?: string;
};
