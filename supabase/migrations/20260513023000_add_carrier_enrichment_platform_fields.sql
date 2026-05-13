alter table if exists public.carriers
  add column if not exists website text,
  add column if not exists equipment_type text,
  add column if not exists cargo_carried text,
  add column if not exists operation_classification text,
  add column if not exists carrier_operation text,
  add column if not exists authority_information text,
  add column if not exists fleet_size_category text,
  add column if not exists inferred_truck_type text,
  add column if not exists data_source text,
  add column if not exists enrichment_status text;

alter table if exists public.carriers
  drop constraint if exists carriers_enrichment_status_check;

alter table if exists public.carriers
  add constraint carriers_enrichment_status_check
  check (enrichment_status in ('pending', 'enriched', 'partial', 'failed') or enrichment_status is null);

create index if not exists carriers_enrichment_status_created_at_idx
  on public.carriers (enrichment_status, created_at desc);

create index if not exists carriers_fleet_size_category_idx
  on public.carriers (fleet_size_category);

create index if not exists carriers_inferred_truck_type_idx
  on public.carriers (inferred_truck_type);
