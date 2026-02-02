# InstantTeacher on Vercel — Step-by-Step (For Beginners)

This guide walks you through **hosting InstantTeacher on Vercel** and adding a **Postgres database** through Vercel. Vercel hosts your app; the database is provided by **Neon** and connected via Vercel’s Marketplace. You do everything from the Vercel dashboard.

**Time:** about 10 minutes.

---

## What you’ll do

1. Sign in to Vercel and import your project  
2. Add a Postgres database (Neon) from the Vercel Marketplace  
3. Copy the database URL into your local `.env` and run setup once  
4. Deploy and log in with your admin account  

---

## Step 1: Sign in to Vercel

1. Go to **https://vercel.com** in your browser.  
2. Click **Log In** (or **Sign Up** if you don’t have an account).  
3. Sign in with **GitHub**, **GitLab**, **Bitbucket**, or **Email** (e.g. the same email you use for InstantTeacher).  
4. If you sign up, verify your email when asked.

---

## Step 2: Import your InstantTeacher project

1. On the Vercel dashboard, click **Add New…** → **Project**.  
2. If your code is on **GitHub** (or GitLab/Bitbucket):
   - Choose **Import Git Repository**.  
   - Find **InstantTeacher** (or the repo name you used) and click **Import**.  
3. If your code is **only on your computer**:
   - Install the [Vercel CLI](https://vercel.com/docs/cli) and run `vercel` in your project folder, **or**  
   - Push your project to GitHub first, then import it as in the step above.  
4. On the import screen:
   - **Framework Preset:** leave as **Next.js** (Vercel usually detects it).  
   - **Root Directory:** leave as `.` unless your app is in a subfolder.  
   - **Build and Output Settings:** leave defaults for now.  
5. **Do not click Deploy yet.** First add the database (Step 3), then we’ll add the database URL to your project and run setup.

---

## Step 3: Add a Postgres database (Neon) via Vercel

1. In your Vercel project, go to the **Storage** tab (or **Integrations** / **Marketplace**).  
2. Click **Create Database** or **Browse Marketplace** and find **Neon** (Postgres).  
3. Click **Add** / **Install** for Neon.  
4. Follow the prompts:
   - **Connect to project:** choose your InstantTeacher project.  
   - **Database name:** e.g. `instantteacher` (or leave default).  
   - **Region:** pick one close to you (e.g. Sydney for Australia).  
5. After Neon is created, Vercel will add environment variables to your project. One of them will be **`DATABASE_URL`** (or **`POSTGRES_URL`**).  
6. Open your project **Settings** → **Environment Variables**.  
7. Find **`DATABASE_URL`**. If you see **`POSTGRES_URL`** instead, either:
   - Add a new variable **`DATABASE_URL`** with the **same value** as `POSTGRES_URL`, **or**  
   - Remember to use `POSTGRES_URL` in your app if your code reads that (InstantTeacher expects **`DATABASE_URL`**).  
8. **Copy** the value of `DATABASE_URL` (click to reveal, then copy). You’ll use it in Step 4.

---

## Step 4: Set up the database (tables + admin user) once

The database is empty until you create tables and the admin user. Do this **once** from your **local** project using the same `DATABASE_URL` Vercel has.

1. On your computer, open your **InstantTeacher** project folder.  
2. Open the **`.env`** file in the project root (create it if it doesn’t exist).  
3. Add or update this line (paste the value you copied from Vercel):

   ```env
   DATABASE_URL="postgresql://..."
   ```

   Use the **exact** connection string from Vercel (it might include `?sslmode=require` at the end).  
4. Save the file.  
5. Open a **terminal** in the project folder and run:

   ```bash
   npx prisma db push
   ```

   Wait until it says the database is in sync.  
6. Then run:

   ```bash
   npm run db:seed
   ```

   This creates the admin user. When it finishes without errors, your database has tables and you can log in.  
7. You can delete `DATABASE_URL` from your local `.env` later if you don’t want it on your machine; Vercel will still have it for deployments.

---

## Step 5: Deploy and log in

1. In Vercel, go to your project and click **Deployments**.  
2. If you hadn’t deployed yet, click **Deploy** (or push a commit to trigger a new deployment).  
3. When the deployment is **Ready**, open your app’s URL (e.g. `https://your-project.vercel.app`).  
4. Go to the **login** page (e.g. `https://your-project.vercel.app/login`).  
5. Log in with your **admin** email and password (the one created by the seed — e.g. the email you use for this project and the password you set in the seed or in `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`).

If login works, setup is complete.

---

## Optional: Use your own admin email and password

The seed script creates one admin user. You can control which email and password it uses:

- In your **local** `.env` (before running `npm run db:seed`), add:

  ```env
  ADMIN_EMAIL=your-email@example.com
  ADMIN_PASSWORD=your-secure-password
  ```

- Then run `npm run db:seed` again (if the user already exists, the seed will skip creating a duplicate).  
- For production, use strong passwords and never commit `.env` to Git.

---

## Troubleshooting

| Problem | What to try |
|--------|------------------|
| No **Storage** or **Neon** in Vercel | Look under **Integrations** or **Marketplace** and search for **Neon** or **Postgres**. |
| Build fails with “DATABASE_URL not found” | In Vercel → Project → **Settings** → **Environment Variables**, add `DATABASE_URL` with the same value as your Neon connection string. Redeploy. |
| Login doesn’t work after deploy | Make sure you ran `npx prisma db push` and `npm run db:seed` **after** adding `DATABASE_URL` (Step 4). The seed creates the admin user. |
| “Invalid connection string” | Ensure `DATABASE_URL` has no extra spaces, is in double quotes in `.env`, and includes `?sslmode=require` if your Neon URL has it. |

---

## Quick checklist

- [ ] Signed in to Vercel  
- [ ] Imported InstantTeacher project  
- [ ] Added Neon (Postgres) from Storage / Marketplace and linked it to the project  
- [ ] Copied `DATABASE_URL` from Vercel into local `.env`  
- [ ] Ran `npx prisma db push`  
- [ ] Ran `npm run db:seed`  
- [ ] Deployed (or re-deployed) the project  
- [ ] Logged in at your app’s login URL  

You’re done.
