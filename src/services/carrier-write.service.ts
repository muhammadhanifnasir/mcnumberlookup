import type { CarrierRecord } from "@/types/carrier";
import {
  createCarrierRecord,
  updateCarrierByMcNumber,
  upsertCarrierRecord,
} from "@/services/carrier-repository.service";

export async function insertCarrier(record: CarrierRecord) {
  return createCarrierRecord(record);
}

export async function updateCarrier(mcNumber: string, updates: Partial<CarrierRecord>) {
  return updateCarrierByMcNumber(mcNumber, updates);
}

export async function upsertCarrier(record: CarrierRecord) {
  return upsertCarrierRecord(record);
}
