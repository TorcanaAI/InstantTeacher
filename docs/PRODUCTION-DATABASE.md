# Production database (Vercel + Postgres)

## Missing tables (`HomeworkSession does not exist`, etc.)

Your **Postgres schema must match** `prisma/schema.prisma`.

### Automatic (recommended)

On **Vercel** (build env `VERCEL=1`), `npm run build` runs **`prisma db push`** before `next build`, so each deploy syncs the schema to **`DATABASE_URL`**. Other CI is skipped unless you set `RUN_DB_PUSH=1`.

1. In Vercel → Project → **Settings → Environment Variables**, confirm **`DATABASE_URL`** points at your production Postgres (Neon / Supabase / etc.).
2. **Redeploy** (or push a commit). The build step will create missing tables (`HomeworkSession`, `TrialCoupon`, …).

### Manual (one-off)

From your machine, with the **production** connection string:

```bash
# PowerShell (Windows)
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
npx prisma db push

# macOS / Linux
DATABASE_URL="postgresql://..." npx prisma db push
```

Do **not** commit `.env` or paste secrets into chat.

### Local builds

Local `npm run build` **skips** `db push` by default so you can build without Postgres. To apply the schema to the DB in `.env`:

```bash
RUN_DB_PUSH=1 npm run build
# PowerShell: $env:RUN_DB_PUSH="1"; npm run build
```

## Migrations note

This repo has legacy SQL files under `prisma/migrations/` that do not match the current schema history. Until that is cleaned up, use **`prisma db push`** for deploys (as in `npm run build`), not `prisma migrate deploy`.
