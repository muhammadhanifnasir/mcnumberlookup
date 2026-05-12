alter table if exists public.carriers
  add column if not exists owner_status text,
  add column if not exists email_address text,
  add column if not exists physical_address text,
  add column if not exists truck_type text;
