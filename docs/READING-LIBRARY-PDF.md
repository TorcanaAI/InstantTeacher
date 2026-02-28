# Reading Library – Why PDFs Might Not Show

## 1. Production database is missing the `pdfBytes` column

The app stores uploaded PDFs in the `ReadingBook.pdfBytes` column. That column was added in a **migration** that runs only when you update your database; **Vercel deploy does not run migrations**.

- **Symptom:** Upload seems to work (no error in UI) but the PDF doesn’t appear, or you get a DB error when saving.
- **Fix:** Apply the migration (or schema) to your **production** database.

**Option A – Prisma Migrate (recommended if you use migrations):**

```bash
# Use your production DATABASE_URL (e.g. from Vercel env)
set DATABASE_URL=<your-production-neon-url>
npx prisma migrate deploy
```

**Option B – Prisma DB Push (if you use push for prod):**

```bash
# Pull production env from Vercel first, then:
npx vercel env pull .env.vercel --environment=production --yes
# Set DATABASE_URL from .env.vercel, then:
npx prisma db push
```

Your existing script `scripts/vercel-db-and-redeploy.ps1` runs `prisma db push` against the DB URL from Vercel; run that (or run `prisma migrate deploy` with production `DATABASE_URL`) so the `pdfBytes` column exists in production.

---

## 2. Next.js / Vercel request body size limit

- **Next.js** limits Server Action request body size (default **1 MB**). Larger PDFs in the form never reach the server.
- **Vercel** limits serverless request body to about **4.5 MB**.

The app is configured to allow PDFs up to **4 MB** and the server action body limit is set to **4 MB** in `next.config.mjs`. PDFs larger than that must be hosted elsewhere and linked via the **PDF URL** field instead of upload.

---

## 3. How to get PDFs to show in the library

1. **Run the migration (or db push)** on the production database so `ReadingBook.pdfBytes` exists (see above).
2. In **Admin → Books**, open a book and either:
   - **Upload PDF**: use “Upload PDF” and choose a file (≤ 4 MB), then Save; or  
   - **PDF URL**: paste a public URL to a PDF (any size) in “PDF URL” and Save.
3. The library table shows **View PDF** when `pdfUrl` is set (from upload or URL). Click it to open the PDF (stored file or external link).
