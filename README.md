# MCN Extractor

Dedicated production-oriented FMCSA SAFER MC carrier importer built with:

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Playwright

## MVP scope

- MC import textarea
- Sequential FMCSA SAFER scraping by MC number
- Supabase persistence
- Carrier results dashboard table

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
```

## Supabase schema

Run the migration at:

- `supabase/migrations/20260511152800_create_carriers.sql`

The schema includes:

- required `carriers` columns for FMCSA import data
- unique constraint on `mc_number` for conflict-safe upserts
- `created_at` / `updated_at` timestamps with update trigger
- indexes for pagination (`created_at`), filtering (`import_status`, `usdot_number`) and search (`legal_name`, `dba_name`)

## API query support

`GET /api/carriers` supports:

- pagination: `page`, `pageSize`
- filtering: `importStatus`, `usdotStatus`
- search: `search` (matches MC, USDOT, legal name, DBA)

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```
