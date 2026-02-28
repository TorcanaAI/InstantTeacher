# Admin login setup – step-by-step

Use this so admin login works on **instant-teacher.vercel.app** with:

- **Email:** support@torcanaai.com  
- **Password:** SouthAfrica91!

---

## Option A: Fix admin on production (Vercel) – do this first

### Step 1: Add the bootstrap secret in Vercel

1. Go to **https://vercel.com** and sign in.
2. Open your **instant-teacher** project.
3. Go to **Settings** → **Environment Variables**.
4. Add a new variable:
   - **Name:** `ADMIN_BOOTSTRAP_SECRET`
   - **Value:** `LetMeInNow123!`
   - **Environment:** Production (and Preview if you want).
5. Click **Save**.

### Step 2: Create/repair the admin user (bootstrap)

**Option 2a – In the browser (easiest)**

1. Install a “Modify Headers” or “Request Headers” extension, or use DevTools.
2. Or use **Option 2b** below.

**Option 2b – In PowerShell (recommended)**

1. Open **PowerShell** (Windows key, type `PowerShell`, press Enter).
2. Copy and paste this **whole** command, then press Enter:

```powershell
Invoke-RestMethod -Uri "https://instant-teacher.vercel.app/api/admin/bootstrap" -Method POST -Headers @{ "x-admin-bootstrap-secret" = "LetMeInNow123!" }
```

3. You should see something like: `ok : True` (admin created or updated).

### Step 3: Log in as admin

1. Go to: **https://instant-teacher.vercel.app/admin/login**
2. **Email:** `support@torcanaai.com`
3. **Password:** `SouthAfrica91!`
4. Click **Sign in**.
5. You should be taken to the admin dashboard.

If it still says “Invalid email or password”, wait 1–2 minutes (Vercel can cache) and try again, or do **Option B** below.

---

## Option B: Seed the production database from your PC

Use this if bootstrap (Option A) doesn’t work or you prefer seeding.

### Step 1: Get your production database URL

1. In Vercel: **instant-teacher** → **Settings** → **Environment Variables**.
2. Find **DATABASE_URL** (the one used for Production).
3. Copy its **value** (starts with `postgresql://...`).  
   You’ll use it only in Step 3, and then remove it from your `.env`.

### Step 2: Open your project folder in Terminal

1. Open **Cursor** (or VS Code) and open the **InstantTeacher** folder.
2. Open the terminal (e.g. **Terminal** → **New Terminal**).

### Step 3: Seed the production database (one time)

1. In your project folder, open the **.env** file (create it if it doesn’t exist).
2. Set **only** this line (paste your real URL from Step 1):

```env
DATABASE_URL="postgresql://...paste your Neon/Vercel URL here..."
```

3. Save the file.
4. In the terminal, run:

```bash
npx prisma db push
npm run db:seed
```

5. You should see something like “Admin user created” or “Admin user updated”.
6. **Important:** In **.env**, remove the line with the production `DATABASE_URL` (or change it back to your local DB URL) so you don’t run other commands against production by mistake.

### Step 4: Log in

1. Go to **https://instant-teacher.vercel.app/admin/login**
2. **Email:** `support@torcanaai.com`
3. **Password:** `SouthAfrica91!`
4. Sign in.

---

## If you run the app locally (your own database)

1. Make sure **PostgreSQL** is running (e.g. Docker: `docker compose up -d`, or use a Neon URL in `.env`).
2. In the project folder, in the terminal:

```bash
npx prisma db push
npm run db:seed
```

3. Start the app: `npm run dev`
4. Open **http://localhost:3000/admin/login** and sign in with the same email and password.

---

## Checklist

- [ ] `ADMIN_BOOTSTRAP_SECRET=LetMeInNow123!` is set in Vercel (Option A).
- [ ] You ran the bootstrap call (Option A Step 2b) **or** ran `db:seed` with production `DATABASE_URL` (Option B).
- [ ] You’re using **support@torcanaai.com** and **SouthAfrica91!** (no extra spaces).
- [ ] You’re on **https://instant-teacher.vercel.app/admin/login** (not the main /login page).

If it still fails, check Vercel **Functions** logs for your deployment: you’ll see `[Auth]` messages that show whether the user was found and whether the password matched.
