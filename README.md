# MC EXTRACTION

Dedicated production-oriented FMCSA SAFER MC carrier importer built with:

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Playwright

## Platform scope

- Sequential FMCSA SAFER scraping by MC number
- Carrier enrichment (website and operational metadata)
- Equipment/truck inference and fleet-size classification
- Supabase persistence of enriched lead-intelligence fields
- Carrier dashboard with enrichment/status badges

## Routes

- `/carrier-import`
- `/carriers`

## Project structure

- `src/app`
- `src/components`
- `src/lib`
- `src/services`
- `src/types`
- `src/utils`

## Environment variables

Set environment values in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT=
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
NEXT_PUBLIC_GOOGLE_SCRIPT_NONCE=
```

## Supabase schema

Run the migrations in:

- `supabase/migrations/20260511153000_create_carriers.sql`
- `supabase/migrations/20260512130000_add_carrier_extraction_fields.sql`
- `supabase/migrations/20260513023000_add_carrier_enrichment_platform_fields.sql`

It creates `public.carriers` with:

- `id` (uuid, generated)
- `mc_number` (text, unique)
- `usdot_status` (text)
- `usdot_number` (text)
- `authority_status` (text)
- `authority_date` (text)
- `mcs150_form_date` (text)
- `operating_authority_status` (text)
- `legal_name` (text)
- `dba_name` (text)
- `owner_status` (text)
- `phone` (text)
- `power_units` (integer)
- `drivers` (integer)
- `physical_address` (text)
- `truck_type` (text)
- `website` (text)
- `equipment_type` (text)
- `cargo_carried` (text)
- `operation_classification` (text)
- `carrier_operation` (text)
- `authority_information` (text)
- `fleet_size_category` (text)
- `inferred_truck_type` (text)
- `data_source` (text)
- `enrichment_status` (`pending | enriched | partial | failed`)
- `import_status` (`imported | not_found | failed`)
- `created_at` / `updated_at` (timestamptz)

Indexes are included for pagination, filtering, and search.

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run build
npm run start
```

`npm install` runs a `postinstall` step that downloads the Playwright Chromium browser used by the scraper.
