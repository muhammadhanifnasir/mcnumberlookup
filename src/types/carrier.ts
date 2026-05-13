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
export type EquipmentType = InferredTruckType | "Other";
export type CarrierOperationType =
  | "Interstate"
  | "Intrastate Hazmat"
  | "Intrastate Non-Hazmat"
  | "Private"
  | "For Hire"
  | "Exempt For Hire"
  | "Other";
export type OperationClassificationType =
  | "Authorized For Hire"
  | "Exempt For Hire"
  | "Private(Property)"
  | "Private(Passengers)"
  | "Private(HM)"
  | "Migrant"
  | "U.S. Mail"
  | "Other";

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
  operationClassification?: OperationClassificationType;
  carrierOperation?: CarrierOperationType;
  cargoCarried?: string;
  authorityInformation?: string;
  outOfServiceDate?: string;
  website?: string;
  equipmentType?: EquipmentType;
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
