import type {
  CarrierImportStatus,
  CarrierOperationType,
  EnrichmentStatus,
  EquipmentType,
  FleetSizeCategory,
  InferredTruckType,
  OperationClassificationType,
} from "@/types/carrier";

const CARRIER_IMPORT_STATUSES = ["imported", "not_found", "failed"] as const;
const ENRICHMENT_STATUSES = ["pending", "enriched", "partial", "failed"] as const;
const FLEET_SIZE_CATEGORIES = [
  "Owner Operator",
  "Small Fleet",
  "Medium Fleet",
  "Enterprise Fleet",
] as const;
const INFERRED_TRUCK_TYPES = [
  "Dry Van",
  "Reefer",
  "Flatbed",
  "Hotshot",
  "Box Truck",
  "Car Hauler",
  "Tanker",
  "Hazmat",
  "Power Only",
] as const;
const EQUIPMENT_TYPES = [...INFERRED_TRUCK_TYPES, "Other"] as const;
const CARRIER_OPERATION_TYPES = [
  "Interstate",
  "Intrastate Hazmat",
  "Intrastate Non-Hazmat",
  "Private",
  "For Hire",
  "Exempt For Hire",
  "Other",
] as const;
const OPERATION_CLASSIFICATION_TYPES = [
  "Authorized For Hire",
  "Exempt For Hire",
  "Private(Property)",
  "Private(Passengers)",
  "Private(HM)",
  "Migrant",
  "U.S. Mail",
  "Other",
] as const;

function normalizeUnionValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function mapOptionalValue<T extends string>(
  value: string | null | undefined,
  allowedValues: readonly T[],
): T | undefined {
  if (!value) return undefined;
  const normalizedInput = normalizeUnionValue(value);
  const match = allowedValues.find((allowed) => normalizeUnionValue(allowed) === normalizedInput);
  return match ?? undefined;
}

export function mapImportStatus(value: string | null | undefined): CarrierImportStatus | undefined {
  return mapOptionalValue(value, CARRIER_IMPORT_STATUSES);
}

export function mapEnrichmentStatus(value: string | null | undefined): EnrichmentStatus | undefined {
  return mapOptionalValue(value, ENRICHMENT_STATUSES);
}

export function mapFleetSizeCategory(value: string | null | undefined): FleetSizeCategory | undefined {
  return mapOptionalValue(value, FLEET_SIZE_CATEGORIES);
}

export function mapInferredTruckType(value: string | null | undefined): InferredTruckType | undefined {
  return mapOptionalValue(value, INFERRED_TRUCK_TYPES);
}

export function mapEquipmentType(value: string | null | undefined): EquipmentType | undefined {
  return mapOptionalValue(value, EQUIPMENT_TYPES);
}

export function mapCarrierOperationType(value: string | null | undefined): CarrierOperationType | undefined {
  return mapOptionalValue(value, CARRIER_OPERATION_TYPES);
}

export function mapOperationClassificationType(
  value: string | null | undefined,
): OperationClassificationType | undefined {
  return mapOptionalValue(value, OPERATION_CLASSIFICATION_TYPES);
}
