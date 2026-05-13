/**
 * Centralized safe mapper utilities for all domain union types.
 *
 * Each mapper converts a raw Supabase `string | null | undefined` value
 * into the corresponding domain type, or returns `undefined` when the
 * value is absent or does not match any allowed member.
 *
 * Rules:
 *  - Never throws
 *  - Never uses unsafe casts (`as SomeType`)
 *  - Never returns `any`
 *  - Invalid / unrecognised values silently become `undefined`
 *
 * Matching is case- and whitespace-insensitive so that minor formatting
 * differences in the database do not break the mapping.
 *
 * Usage:
 *   import { mapFleetSizeCategory } from "@/utils/type-mappers";
 *   const category = mapFleetSizeCategory(row.fleet_size_category); // FleetSizeCategory | undefined
 */

import type {
  CarrierImportStatus,
  CarrierOperationType,
  EnrichmentStatus,
  EquipmentType,
  FleetSizeCategory,
  InferredTruckType,
  OperationClassificationType,
} from "@/utils/type-guards";

import {
  CARRIER_IMPORT_STATUSES,
  CARRIER_OPERATION_TYPES,
  ENRICHMENT_STATUSES,
  EQUIPMENT_TYPES,
  FLEET_SIZE_CATEGORIES,
  INFERRED_TRUCK_TYPES,
  OPERATION_CLASSIFICATION_TYPES,
} from "@/utils/type-guards";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function normalizeUnionValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Finds the first member of `allowedValues` whose normalised form matches the
 * normalised form of `value`.  Returns `undefined` when there is no match.
 */
function mapOptionalValue<T extends string>(
  value: string | null | undefined,
  allowedValues: readonly T[],
): T | undefined {
  if (!value) return undefined;
  const normalizedInput = normalizeUnionValue(value);
  return allowedValues.find(
    (allowed) => normalizeUnionValue(allowed) === normalizedInput,
  );
}

// ---------------------------------------------------------------------------
// Exported safe mappers
// ---------------------------------------------------------------------------

/**
 * Maps a raw string to {@link CarrierImportStatus}, or `undefined` if invalid.
 */
export function mapImportStatus(
  value: string | null | undefined,
): CarrierImportStatus | undefined {
  return mapOptionalValue(value, CARRIER_IMPORT_STATUSES);
}

/**
 * Maps a raw string to {@link EnrichmentStatus}, or `undefined` if invalid.
 */
export function mapEnrichmentStatus(
  value: string | null | undefined,
): EnrichmentStatus | undefined {
  return mapOptionalValue(value, ENRICHMENT_STATUSES);
}

/**
 * Maps a raw string to {@link FleetSizeCategory}, or `undefined` if invalid.
 */
export function mapFleetSizeCategory(
  value: string | null | undefined,
): FleetSizeCategory | undefined {
  return mapOptionalValue(value, FLEET_SIZE_CATEGORIES);
}

/**
 * Maps a raw string to {@link InferredTruckType}, or `undefined` if invalid.
 */
export function mapInferredTruckType(
  value: string | null | undefined,
): InferredTruckType | undefined {
  return mapOptionalValue(value, INFERRED_TRUCK_TYPES);
}

/**
 * Maps a raw string to {@link EquipmentType}, or `undefined` if invalid.
 */
export function mapEquipmentType(
  value: string | null | undefined,
): EquipmentType | undefined {
  return mapOptionalValue(value, EQUIPMENT_TYPES);
}

/**
 * Maps a raw string to {@link CarrierOperationType}, or `undefined` if invalid.
 */
export function mapCarrierOperationType(
  value: string | null | undefined,
): CarrierOperationType | undefined {
  return mapOptionalValue(value, CARRIER_OPERATION_TYPES);
}

/**
 * Maps a raw string to {@link OperationClassificationType}, or `undefined` if invalid.
 */
export function mapOperationClassificationType(
  value: string | null | undefined,
): OperationClassificationType | undefined {
  return mapOptionalValue(value, OPERATION_CLASSIFICATION_TYPES);
}
