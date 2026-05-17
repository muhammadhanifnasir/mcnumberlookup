// All domain union types are derived from `as const` arrays in type-guards.ts.
// Imported here for use in the DTOs below, and re-exported to keep the
// public API of this module stable.
import type {
  CarrierImportStatus,
  CarrierOperationType,
  EnrichmentStatus,
  EquipmentType,
  FleetSizeCategory,
  InferredTruckType,
  OperationClassificationType,
} from "@/utils/type-guards";

export type {
  CarrierImportStatus,
  CarrierOperationType,
  EnrichmentStatus,
  EquipmentType,
  FleetSizeCategory,
  InferredTruckType,
  OperationClassificationType,
};

export type ScrapedCarrierData = {
  mcNumber: string;
  usdotStatus?: string;
  ownerStatus?: string;
  usdotNumber?: string;
  authorityStatus?: string;
  authorityDate?: string;
  mcs150FormDate?: string;
  operatingAuthorityStatus?: string;
  legalName?: string;
  dbaName?: string;
  entityType?: string;
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
