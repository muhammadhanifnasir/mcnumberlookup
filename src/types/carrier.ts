export type CarrierImportStatus = "imported" | "not_found" | "failed";

export type ScrapedCarrierData = {
  mcNumber: string;
  usdotStatus?: string;
  ownerStatus?: string;
  usdotNumber?: string;
  mcs150FormDate?: string;
  operatingAuthorityStatus?: string;
  legalName?: string;
  dbaName?: string;
  entityType?: string;
  emailAddress?: string;
  phone?: string;
  powerUnits?: string;
  drivers?: string;
  physicalAddress?: string;
  truckType?: string;
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
