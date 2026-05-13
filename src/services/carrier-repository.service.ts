import type { CarrierRecord } from "@/types/carrier";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import { buildSaferUrl } from "@/services/safer-scraper.service";

const CARRIERS_TABLE = "carriers";
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;
const CARRIER_SEARCH_FIELDS = [
  "mc_number",
  "usdot_number",
  "legal_name",
  "dba_name",
  "owner_status",
  "email_address",
  "website",
  "physical_address",
  "truck_type",
  "equipment_type",
  "cargo_carried",
  "operation_classification",
  "carrier_operation",
  "fleet_size_category",
  "inferred_truck_type",
  "enrichment_status",
] as const;

type CarrierRow = Database["public"]["Tables"]["carriers"]["Row"];
export type CarrierInsertPayload = Database["public"]["Tables"]["carriers"]["Insert"];
export type CarrierUpdatePayload = Database["public"]["Tables"]["carriers"]["Update"];

export type CarrierListOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  importStatus?: CarrierRecord["importStatus"];
  usdotStatus?: string;
};

export type CarrierListResult = {
  data: CarrierRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

function parseOptionalInteger(value?: string) {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildCarrierInsertPayload(record: CarrierRecord): CarrierInsertPayload {
  return {
    mc_number: record.mcNumber,
    usdot_status: record.usdotStatus ?? null,
    owner_status: record.ownerStatus ?? null,
    usdot_number: record.usdotNumber ?? null,
    mcs150_form_date: record.mcs150FormDate ?? null,
    operating_authority_status: record.operatingAuthorityStatus ?? null,
    legal_name: record.legalName ?? null,
    dba_name: record.dbaName ?? null,
    email_address: record.emailAddress ?? null,
    phone: record.phone ?? null,
    power_units: parseOptionalInteger(record.powerUnits),
    drivers: parseOptionalInteger(record.drivers),
    physical_address: record.physicalAddress ?? null,
    truck_type: record.truckType ?? null,
    website: record.website ?? null,
    equipment_type: record.equipmentType ?? null,
    cargo_carried: record.cargoCarried ?? null,
    operation_classification: record.operationClassification ?? null,
    carrier_operation: record.carrierOperation ?? null,
    authority_information: record.authorityInformation ?? null,
    fleet_size_category: record.fleetSizeCategory ?? null,
    inferred_truck_type: record.inferredTruckType ?? null,
    data_source: record.dataSource ?? null,
    enrichment_status: record.enrichmentStatus ?? null,
    import_status: record.importStatus,
    created_at: record.scrapedAt,
  };
}

export function buildCarrierUpdatePayload(record: Partial<CarrierRecord>): CarrierUpdatePayload {
  const payload: CarrierUpdatePayload = {};

  if (record.usdotStatus !== undefined) payload.usdot_status = record.usdotStatus ?? null;
  if (record.ownerStatus !== undefined) payload.owner_status = record.ownerStatus ?? null;
  if (record.usdotNumber !== undefined) payload.usdot_number = record.usdotNumber ?? null;
  if (record.mcs150FormDate !== undefined) payload.mcs150_form_date = record.mcs150FormDate ?? null;
  if (record.operatingAuthorityStatus !== undefined) {
    payload.operating_authority_status = record.operatingAuthorityStatus ?? null;
  }
  if (record.legalName !== undefined) payload.legal_name = record.legalName ?? null;
  if (record.dbaName !== undefined) payload.dba_name = record.dbaName ?? null;
  if (record.emailAddress !== undefined) payload.email_address = record.emailAddress ?? null;
  if (record.phone !== undefined) payload.phone = record.phone ?? null;
  if (record.powerUnits !== undefined) payload.power_units = parseOptionalInteger(record.powerUnits);
  if (record.drivers !== undefined) payload.drivers = parseOptionalInteger(record.drivers);
  if (record.physicalAddress !== undefined) payload.physical_address = record.physicalAddress ?? null;
  if (record.truckType !== undefined) payload.truck_type = record.truckType ?? null;
  if (record.website !== undefined) payload.website = record.website ?? null;
  if (record.equipmentType !== undefined) payload.equipment_type = record.equipmentType ?? null;
  if (record.cargoCarried !== undefined) payload.cargo_carried = record.cargoCarried ?? null;
  if (record.operationClassification !== undefined) {
    payload.operation_classification = record.operationClassification ?? null;
  }
  if (record.carrierOperation !== undefined) payload.carrier_operation = record.carrierOperation ?? null;
  if (record.authorityInformation !== undefined) {
    payload.authority_information = record.authorityInformation ?? null;
  }
  if (record.fleetSizeCategory !== undefined) payload.fleet_size_category = record.fleetSizeCategory ?? null;
  if (record.inferredTruckType !== undefined) payload.inferred_truck_type = record.inferredTruckType ?? null;
  if (record.dataSource !== undefined) payload.data_source = record.dataSource ?? null;
  if (record.enrichmentStatus !== undefined) payload.enrichment_status = record.enrichmentStatus ?? null;
  if (record.importStatus !== undefined) payload.import_status = record.importStatus;

  return payload;
}

function fromSupabaseRow(row: CarrierRow): CarrierRecord {
  return {
    id: row.id,
    mcNumber: row.mc_number,
    usdotStatus: row.usdot_status ?? undefined,
    ownerStatus: row.owner_status ?? undefined,
    usdotNumber: row.usdot_number ?? undefined,
    mcs150FormDate: row.mcs150_form_date ?? undefined,
    operatingAuthorityStatus: row.operating_authority_status ?? undefined,
    legalName: row.legal_name ?? undefined,
    dbaName: row.dba_name ?? undefined,
    emailAddress: row.email_address ?? undefined,
    phone: row.phone ?? undefined,
    powerUnits: row.power_units !== null ? String(row.power_units) : undefined,
    drivers: row.drivers !== null ? String(row.drivers) : undefined,
    physicalAddress: row.physical_address ?? undefined,
    truckType: row.truck_type ?? undefined,
    website: row.website ?? undefined,
    equipmentType: row.equipment_type ?? undefined,
    cargoCarried: row.cargo_carried ?? undefined,
    operationClassification: row.operation_classification ?? undefined,
    carrierOperation: row.carrier_operation ?? undefined,
    authorityInformation: row.authority_information ?? undefined,
    fleetSizeCategory: row.fleet_size_category ?? undefined,
    inferredTruckType: row.inferred_truck_type ?? undefined,
    dataSource: row.data_source ?? undefined,
    enrichmentStatus: row.enrichment_status ?? undefined,
    importStatus: row.import_status,
    sourceUrl: buildSaferUrl(row.mc_number),
    scrapedAt: row.created_at,
  };
}

export async function createCarrierRecord(payload: CarrierInsertPayload) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(CARRIERS_TABLE)
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return fromSupabaseRow(data);
}

export async function updateCarrierRecordByMcNumber(
  mcNumber: string,
  payload: CarrierUpdatePayload,
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(CARRIERS_TABLE)
    .update(payload)
    .eq("mc_number", mcNumber)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return fromSupabaseRow(data);
}

export async function upsertCarrierRecord(payload: CarrierInsertPayload) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(CARRIERS_TABLE)
    .upsert(payload, { onConflict: "mc_number" })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return fromSupabaseRow(data);
}

export async function getCarrierByMcNumber(mcNumber: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(CARRIERS_TABLE)
    .select("*")
    .eq("mc_number", mcNumber)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? fromSupabaseRow(data) : null;
}

export async function listCarrierRecords(limit = 200) {
  const result = await listCarrierRecordsPaginated({ page: 1, pageSize: limit });
  return result.data;
}

export async function listCarrierRecordsPaginated(
  options: CarrierListOptions = {},
): Promise<CarrierListResult> {
  const supabase = createSupabaseAdminClient();
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, options.pageSize ?? DEFAULT_PAGE_SIZE));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(CARRIERS_TABLE)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (options.importStatus) {
    query = query.eq("import_status", options.importStatus);
  }

  if (options.usdotStatus) {
    query = query.eq("usdot_status", options.usdotStatus);
  }

  if (options.search) {
    const safeSearch = options.search.replace(/[^a-zA-Z0-9\s-]/g, "").trim();
    if (safeSearch) {
      const searchFilters = CARRIER_SEARCH_FIELDS.map((field) => `${field}.ilike.%${safeSearch}%`);
      query = query.or(searchFilters.join(","));
    }
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    data: (data ?? []).map((row) => fromSupabaseRow(row)),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: total > 0 ? Math.ceil(total / pageSize) : 0,
    },
  };
}

export async function listCarrierRetryCandidates(limit = 100) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(CARRIERS_TABLE)
    .select("*")
    .eq("import_status", "failed")
    .order("updated_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => fromSupabaseRow(row));
}

export async function deleteCarrierRecordByMcNumber(mcNumber: string) {
  const supabase = createSupabaseAdminClient();
  const { error, count } = await supabase
    .from(CARRIERS_TABLE)
    .delete({ count: "exact" })
    .eq("mc_number", mcNumber);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function deleteAllCarrierRecords() {
  const supabase = createSupabaseAdminClient();
  const { error, count } = await supabase
    .from(CARRIERS_TABLE)
    .delete({ count: "exact" })
    .not("id", "is", null);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}
