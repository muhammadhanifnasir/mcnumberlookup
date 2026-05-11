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

Run the migration in:

- `supabase/migrations/20260511153000_create_carriers.sql`

It creates `public.carriers` with:

- `id` (uuid, generated)
- `mc_number` (text, unique)
- `usdot_status` (text)
- `usdot_number` (text)
- `mcs150_form_date` (text)
- `operating_authority_status` (text)
- `legal_name` (text)
- `dba_name` (text)
- `phone` (text)
- `power_units` (integer)
- `drivers` (integer)
- `import_status` (`imported | not_found | failed`)
- `created_at` / `updated_at` (timestamptz)

Indexes are included for pagination, filtering, and search.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```
