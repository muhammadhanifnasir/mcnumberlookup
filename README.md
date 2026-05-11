# Dispatch CRM Foundation

Production-ready architecture foundation for a trucking dispatch CRM built with:

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style component setup
- Supabase-ready service layer
- PostgreSQL-ready backend integration pattern

## Project structure

- `/home/runner/work/mcnextracter/mcnextracter/src/app`
- `/home/runner/work/mcnextracter/mcnextracter/src/components`
- `/home/runner/work/mcnextracter/mcnextracter/src/lib`
- `/home/runner/work/mcnextracter/mcnextracter/src/hooks`
- `/home/runner/work/mcnextracter/mcnextracter/src/services`
- `/home/runner/work/mcnextracter/mcnextracter/src/types`
- `/home/runner/work/mcnextracter/mcnextracter/src/store`
- `/home/runner/work/mcnextracter/mcnextracter/src/utils`

## Route groups

- `(auth)` for authentication pages
- `(dashboard)` for protected dashboard pages

## Available scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Notes

- Dashboard routes are protected through `requireDashboardSession`.
- Configure Supabase environment variables using `.env.example`.
- For local UI preview without auth setup, set `NEXT_PUBLIC_DEV_AUTH_BYPASS=true`.
