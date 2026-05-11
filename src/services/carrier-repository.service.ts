import type { CarrierImportStatus, CarrierRecord } from "@/types/carrier";
import type { Database } from "@/types/database";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const CARRIERS_TABLE = "carriers";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

type CarrierRow = Database["public"]["Tables"]["carriers"]["Row"];
type CarrierInsert = Database["public"]["Tables"]["carriers"]["Insert"];
type CarrierUpdate = Database["public"]["Tables"]["carriers"]["Update"];

export type CarrierListOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  importStatus?: CarrierImportStatus | CarrierImportStatus[];
  usdotStatus?: string;
};

export type PaginatedCarrierRecords = {
  data: CarrierRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

function normalizePage(page?: number) {
  return Number.isInteger(page) && page && page > 0 ? page : DEFAULT_PAGE;
}

function normalizePageSize(pageSize?: number) {
  if (!Number.isInteger(pageSize) || !pageSize || pageSize <= 0) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(pageSize, MAX_PAGE_SIZE);
}

function toNullableInteger(value?: string) {
  if (!value) return null;
  const numericValue = Number.parseInt(value.replaceAll(",", "").trim(), 10);
  return Number.isNaN(numericValue) ? null : numericValue;
}

function toNullableDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function toCarrierInsert(record: CarrierRecord): CarrierInsert {
  return {
    mc_number: record.mcNumber,
    usdot_status: record.usdotStatus ?? null,
    usdot_number: record.usdotNumber ?? null,
    mcs150_form_date: toNullableDate(record.mcs150FormDate),
    operating_authority_status: record.operatingAuthorityStatus ?? null,
    legal_name: record.legalName ?? null,
    dba_name: record.dbaName ?? null,
    phone: record.phone ?? null,
    power_units: toNullableInteger(record.powerUnits),
    drivers: toNullableInteger(record.drivers),
    import_status: record.importStatus,
    created_at: record.scrapedAt,
  };
}

function toCarrierUpdate(record: Partial<CarrierRecord>): CarrierUpdate {
  return {
    usdot_status: record.usdotStatus,
    usdot_number: record.usdotNumber,
    mcs150_form_date: record.mcs150FormDate ? toNullableDate(record.mcs150FormDate) : undefined,
    operating_authority_status: record.operatingAuthorityStatus,
    legal_name: record.legalName,
    dba_name: record.dbaName,
    phone: record.phone,
    power_units: record.powerUnits ? toNullableInteger(record.powerUnits) : undefined,
    drivers: record.drivers ? toNullableInteger(record.drivers) : undefined,
    import_status: record.importStatus,
  };
}

function fromCarrierRow(row: CarrierRow, fallback?: Partial<CarrierRecord>): CarrierRecord {
  return {
    id: row.id,
    mcNumber: row.mc_number,
    usdotStatus: row.usdot_status ?? undefined,
    usdotNumber: row.usdot_number ?? undefined,
    mcs150FormDate: row.mcs150_form_date ?? undefined,
    operatingAuthorityStatus: row.operating_authority_status ?? undefined,
    legalName: row.legal_name ?? undefined,
    dbaName: row.dba_name ?? undefined,
    phone: row.phone ?? undefined,
    powerUnits: row.power_units !== null ? String(row.power_units) : undefined,
    drivers: row.drivers !== null ? String(row.drivers) : undefined,
    importStatus: row.import_status,
    importError: fallback?.importError,
    sourceUrl: fallback?.sourceUrl ?? "",
    scrapedAt: row.created_at ?? fallback?.scrapedAt ?? new Date(0).toISOString(),
  };
}

export async function upsertCarrierRecord(record: CarrierRecord) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(CARRIERS_TABLE)
    .upsert(toCarrierInsert(record), { onConflict: "mc_number" })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return fromCarrierRow(data as CarrierRow, record);
}

export async function createCarrierRecord(record: CarrierRecord) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(CARRIERS_TABLE)
    .insert(toCarrierInsert(record))
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return fromCarrierRow(data as CarrierRow, record);
}

export async function updateCarrierByMcNumber(mcNumber: string, updates: Partial<CarrierRecord>) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(CARRIERS_TABLE)
    .update(toCarrierUpdate(updates))
    .eq("mc_number", mcNumber)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return fromCarrierRow(data as CarrierRow, updates);
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

  if (!data) return null;
  return fromCarrierRow(data as CarrierRow);
}

export async function deleteCarrierByMcNumber(mcNumber: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from(CARRIERS_TABLE).delete().eq("mc_number", mcNumber);

  if (error) {
    throw new Error(error.message);
  }
}

export async function listCarriers(options: CarrierListOptions = {}): Promise<PaginatedCarrierRecords> {
  const page = normalizePage(options.page);
  const pageSize = normalizePageSize(options.pageSize);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = createSupabaseAdminClient();
  let query = supabase.from(CARRIERS_TABLE).select("*", { count: "exact" });

  if (options.importStatus) {
    if (Array.isArray(options.importStatus)) {
      query = query.in("import_status", options.importStatus);
    } else {
      query = query.eq("import_status", options.importStatus);
    }
  }

  if (options.usdotStatus) {
    query = query.eq("usdot_status", options.usdotStatus);
  }

  if (options.search) {
    const term = options.search.trim();
    if (term.length > 0) {
      query = query.or(
        `mc_number.ilike.%${term}%,usdot_number.ilike.%${term}%,legal_name.ilike.%${term}%,dba_name.ilike.%${term}%`,
      );
    }
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
  const rows = (data ?? []) as CarrierRow[];
  const mapped = rows.map((row) => fromCarrierRow(row));

  return {
    data: mapped,
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export async function listCarrierRecords(limit = 200) {
  const { data } = await listCarriers({ page: 1, pageSize: limit });
  return data;
}

export async function listCarrierRecordsForRetry(limit = 100) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(CARRIERS_TABLE)
    .select("*")
    .in("import_status", ["failed", "not_found"])
    .order("updated_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as CarrierRow[]).map((row) => fromCarrierRow(row));
}
