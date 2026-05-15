alter table if exists public.carriers
  drop column if exists email_address,
  drop column if exists website,
  drop column if exists equipment_type,
  drop column if exists inferred_truck_type,
  drop column if exists enrichment_status,
  drop column if exists import_status;
