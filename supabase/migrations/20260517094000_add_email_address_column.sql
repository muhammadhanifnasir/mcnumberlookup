alter table if exists public.carriers
  add column if not exists email_address text;
