import type { CarrierRecord } from "@/types/carrier";

import {
  buildCarrierInsertPayload,
  buildCarrierUpdatePayload,
  createCarrierRecord,
  upsertCarrierRecord,
  updateCarrierRecordByMcNumber,
} from "@/services/carrier-repository.service";

export function toCarrierInsertPayload(record: CarrierRecord) {
  return buildCarrierInsertPayload(record);
}

export function toCarrierUpdatePayload(changes: Partial<CarrierRecord>) {
  return buildCarrierUpdatePayload(changes);
}

export async function insertCarrierForImport(record: CarrierRecord) {
  return createCarrierRecord(toCarrierInsertPayload(record));
}

export async function upsertCarrierForImport(record: CarrierRecord) {
  return upsertCarrierRecord(toCarrierInsertPayload(record));
}

export async function updateCarrierForImport(mcNumber: string, changes: Partial<CarrierRecord>) {
  return updateCarrierRecordByMcNumber(mcNumber, toCarrierUpdatePayload(changes));
}
