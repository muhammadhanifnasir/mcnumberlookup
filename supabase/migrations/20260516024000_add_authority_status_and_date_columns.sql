alter table if exists public.carriers
  add column if not exists authority_status text,
  add column if not exists authority_date text;
