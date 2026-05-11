create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table if not exists public.carriers (
  id uuid primary key default gen_random_uuid(),
  mc_number text not null,
  usdot_status text,
  usdot_number text,
  mcs150_form_date text,
  operating_authority_status text,
  legal_name text,
  dba_name text,
  phone text,
  power_units integer,
  drivers integer,
  import_status text not null default 'failed',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint carriers_mc_number_key unique (mc_number),
  constraint carriers_import_status_check check (import_status in ('imported', 'not_found', 'failed'))
);

create index if not exists carriers_created_at_idx
  on public.carriers (created_at desc);

create index if not exists carriers_import_status_created_at_idx
  on public.carriers (import_status, created_at desc);

create index if not exists carriers_usdot_status_idx
  on public.carriers (usdot_status);

create index if not exists carriers_search_trgm_idx
  on public.carriers using gin (
    (coalesce(mc_number, '') || ' ' || coalesce(usdot_number, '') || ' ' || coalesce(legal_name, '') || ' ' || coalesce(dba_name, '')) gin_trgm_ops
  );

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_carriers_updated_at on public.carriers;

create trigger set_carriers_updated_at
before update on public.carriers
for each row
execute function public.set_updated_at();
