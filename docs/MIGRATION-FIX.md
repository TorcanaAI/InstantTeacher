# Fix: TutoringSession.section and DB migration

## Root cause

The Prisma schema has `TutoringSession.section`, but the database does not. Any query that selects sessions (admin dashboard, sessions tab) fails with:

> The column TutoringSession.section does not exist in the current database.

## Fix (apply migration to your real DB)

Your `.env` may point at `localhost:5432` (no local Postgres). Use the **same** `DATABASE_URL` you use in Vercel (e.g. Neon).

### Option A: Remote DB (Neon / Vercel Postgres / Supabase)

1. Set `DATABASE_URL` to your production DB URL (e.g. from Neon dashboard).
2. Run:

```bash
npx prisma migrate deploy
```

3. Redeploy on Vercel (or run again after env is set in Vercel).

### Option B: Reset local DB (dev only, wipes data)

If you run Postgres locally and are okay wiping dev data:

```bash
npx prisma migrate reset
```

Then:

```bash
npx prisma migrate dev
```

### Option C: Push schema without migration history

```bash
npx prisma db push
```

Use the same `DATABASE_URL` as production so the column is added to the real DB.

## Verify

```bash
npx prisma studio
```

Open the `TutoringSession` table and confirm a `section` column exists.
