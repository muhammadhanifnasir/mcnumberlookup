/**
 * Centralized runtime type validators for all domain union types.
 *
 * Every type is derived from an `as const` array — the array is the
 * single source of truth.  Adding or removing a value in the array
 * automatically updates the TypeScript type AND the runtime validator.
 *
 * Usage:
 *   import { isFleetSizeCategory, type FleetSizeCategory } from "@/utils/type-guards";
 *   if (isFleetSizeCategory(row.fleet_size_category)) { ... }
 */

// ---------------------------------------------------------------------------
// Carrier import status
// ---------------------------------------------------------------------------

export const CARRIER_IMPORT_STATUSES = ["imported", "not_found", "failed"] as const;
export type CarrierImportStatus = (typeof CARRIER_IMPORT_STATUSES)[number];

// ---------------------------------------------------------------------------
// Enrichment status
// ---------------------------------------------------------------------------

export const ENRICHMENT_STATUSES = ["pending", "enriched", "partial", "failed"] as const;
export type EnrichmentStatus = (typeof ENRICHMENT_STATUSES)[number];

// ---------------------------------------------------------------------------
// Fleet size category
// ---------------------------------------------------------------------------

export const FLEET_SIZE_CATEGORIES = [
  "Owner Operator",
  "Small Fleet",
  "Medium Fleet",
  "Enterprise Fleet",
] as const;
export type FleetSizeCategory = (typeof FLEET_SIZE_CATEGORIES)[number];

// ---------------------------------------------------------------------------
// Inferred truck type
// ---------------------------------------------------------------------------

export const INFERRED_TRUCK_TYPES = [
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
export type InferredTruckType = (typeof INFERRED_TRUCK_TYPES)[number];

// ---------------------------------------------------------------------------
// Equipment type (superset of InferredTruckType)
// ---------------------------------------------------------------------------

export const EQUIPMENT_TYPES = [...INFERRED_TRUCK_TYPES, "Other"] as const;
export type EquipmentType = (typeof EQUIPMENT_TYPES)[number];

// ---------------------------------------------------------------------------
// Carrier operation type
// ---------------------------------------------------------------------------

export const CARRIER_OPERATION_TYPES = [
  "Interstate",
  "Intrastate Hazmat",
  "Intrastate Non-Hazmat",
  "Private",
  "For Hire",
  "Exempt For Hire",
  "Other",
] as const;
export type CarrierOperationType = (typeof CARRIER_OPERATION_TYPES)[number];

// ---------------------------------------------------------------------------
// Operation classification type
// ---------------------------------------------------------------------------

export const OPERATION_CLASSIFICATION_TYPES = [
  "Authorized For Hire",
  "Exempt For Hire",
  "Private(Property)",
  "Private(Passengers)",
  "Private(HM)",
  "Migrant",
  "U.S. Mail",
  "Other",
] as const;
export type OperationClassificationType = (typeof OPERATION_CLASSIFICATION_TYPES)[number];

// ---------------------------------------------------------------------------
// Generic guard factory — keeps each exported guard DRY
// ---------------------------------------------------------------------------

function makeGuard<T extends string>(
  values: readonly T[],
): (value: unknown) => value is T {
  const set = new Set<string>(values);
  return (value: unknown): value is T =>
    typeof value === "string" && set.has(value);
}

// ---------------------------------------------------------------------------
// Exported type guards
// ---------------------------------------------------------------------------

/** Returns `true` when `value` is a valid {@link CarrierImportStatus}. */
export const isCarrierImportStatus = makeGuard(CARRIER_IMPORT_STATUSES);

/** Returns `true` when `value` is a valid {@link EnrichmentStatus}. */
export const isEnrichmentStatus = makeGuard(ENRICHMENT_STATUSES);

/** Returns `true` when `value` is a valid {@link FleetSizeCategory}. */
export const isFleetSizeCategory = makeGuard(FLEET_SIZE_CATEGORIES);

/** Returns `true` when `value` is a valid {@link InferredTruckType}. */
export const isInferredTruckType = makeGuard(INFERRED_TRUCK_TYPES);

/** Returns `true` when `value` is a valid {@link EquipmentType}. */
export const isEquipmentType = makeGuard(EQUIPMENT_TYPES);

/** Returns `true` when `value` is a valid {@link CarrierOperationType}. */
export const isCarrierOperationType = makeGuard(CARRIER_OPERATION_TYPES);

/** Returns `true` when `value` is a valid {@link OperationClassificationType}. */
export const isOperationClassificationType = makeGuard(OPERATION_CLASSIFICATION_TYPES);
