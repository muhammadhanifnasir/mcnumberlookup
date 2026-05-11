# MCN Extracter

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

## Suggested Supabase table

Create a `carriers` table with columns:

- `id` (uuid, default generated)
- `mc_number` (text, unique)
- `usdot_number` (text)
- `legal_name` (text)
- `dba_name` (text)
- `entity_type` (text)
- `phone` (text)
- `physical_address` (text)
- `mailing_address` (text)
- `operation_classification` (text)
- `out_of_service_date` (text)
- `import_status` (text)
- `import_error` (text)
- `source_url` (text)
- `scraped_at` (timestamptz)

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```
