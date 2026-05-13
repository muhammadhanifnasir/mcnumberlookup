export type CarrierImportStatus = "imported" | "not_found" | "failed";
export type EnrichmentStatus = "pending" | "enriched" | "partial" | "failed";
export type FleetSizeCategory =
  | "Owner Operator"
  | "Small Fleet"
  | "Medium Fleet"
  | "Enterprise Fleet";
export type InferredTruckType =
  | "Dry Van"
  | "Reefer"
  | "Flatbed"
  | "Hotshot"
  | "Box Truck"
  | "Car Hauler"
  | "Tanker"
  | "Hazmat"
  | "Power Only";

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
  carrierOperation?: string;
  cargoCarried?: string;
  authorityInformation?: string;
  outOfServiceDate?: string;
  website?: string;
  equipmentType?: string;
  fleetSizeCategory?: FleetSizeCategory;
  inferredTruckType?: InferredTruckType;
  dataSource?: string;
  enrichmentStatus?: EnrichmentStatus;
  sourceUrl: string;
  scrapedAt: string;
};

export type CarrierRecord = ScrapedCarrierData & {
  id?: string;
  importStatus: CarrierImportStatus;
  importError?: string;
};
