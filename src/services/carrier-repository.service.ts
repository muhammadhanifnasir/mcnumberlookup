import type { CarrierRecord } from "@/types/carrier";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const CARRIERS_TABLE = "carriers";

function toSupabaseRow(record: CarrierRecord) {
  return {
    mc_number: record.mcNumber,
    usdot_number: record.usdotNumber ?? null,
    legal_name: record.legalName ?? null,
    dba_name: record.dbaName ?? null,
    entity_type: record.entityType ?? null,
    phone: record.phone ?? null,
    physical_address: record.physicalAddress ?? null,
    mailing_address: record.mailingAddress ?? null,
    operation_classification: record.operationClassification ?? null,
    out_of_service_date: record.outOfServiceDate ?? null,
    import_status: record.importStatus,
    import_error: record.importError ?? null,
    source_url: record.sourceUrl,
    scraped_at: record.scrapedAt,
  };
}

function fromSupabaseRow(row: Record<string, unknown>): CarrierRecord {
  return {
    id: typeof row.id === "string" ? row.id : undefined,
    mcNumber: String(row.mc_number ?? ""),
    usdotNumber: row.usdot_number ? String(row.usdot_number) : undefined,
    legalName: row.legal_name ? String(row.legal_name) : undefined,
    dbaName: row.dba_name ? String(row.dba_name) : undefined,
    entityType: row.entity_type ? String(row.entity_type) : undefined,
    phone: row.phone ? String(row.phone) : undefined,
    physicalAddress: row.physical_address ? String(row.physical_address) : undefined,
    mailingAddress: row.mailing_address ? String(row.mailing_address) : undefined,
    operationClassification: row.operation_classification
      ? String(row.operation_classification)
      : undefined,
    outOfServiceDate: row.out_of_service_date ? String(row.out_of_service_date) : undefined,
    importStatus: String(row.import_status ?? "failed") as CarrierRecord["importStatus"],
    importError: row.import_error ? String(row.import_error) : undefined,
    sourceUrl: String(row.source_url ?? ""),
    scrapedAt: String(row.scraped_at ?? new Date(0).toISOString()),
  };
}

export async function upsertCarrierRecord(record: CarrierRecord) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(CARRIERS_TABLE)
    .upsert(toSupabaseRow(record), { onConflict: "mc_number" })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return fromSupabaseRow((data ?? {}) as Record<string, unknown>);
}

export async function listCarrierRecords(limit = 200) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(CARRIERS_TABLE)
    .select("*")
    .order("scraped_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => fromSupabaseRow(row as Record<string, unknown>));
}
