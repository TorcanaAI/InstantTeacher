# Neon Database Setup — Step-by-Step (For Beginners)

This guide walks you through getting a **free PostgreSQL database** from Neon and connecting it to InstantTeacher. No prior database experience needed.

---

## What you’ll do

1. Create a free Neon account  
2. Create a project and get a connection string  
3. Put that string in your project’s `.env` file  
4. Run two commands so the app can use the database  

**Time:** about 5 minutes.

---

## Step 1: Open Neon and sign up

1. Go to **https://neon.tech** in your browser.  
2. Click **Sign Up** (top right).  
3. Sign up with **GitHub** or **Email** — whichever you prefer.  
   - If you use email, check your inbox and click the link to verify.

---

## Step 2: Create a project

1. After logging in, you’ll see the Neon **Console** (dashboard).  
2. Click the green **Create a project** button (or **New Project**).  
3. Fill in:
   - **Project name:** e.g. `instantteacher` (anything you like).  
   - **Region:** pick one close to you (e.g. **Australia (Sydney)** if you’re in AU).  
   - **PostgreSQL version:** leave the default (e.g. 16).  
4. Click **Create project**.

---

## Step 3: Copy the connection string

1. When the project is created, Neon shows a **Connection string** (a long line of text).  
2. It looks like:
   ```text
   postgresql://username:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
   ```
3. Click **Copy** next to it (or select the whole string and copy with Ctrl+C).  
   - If you don’t see it, open your project → **Connection details** (or **Dashboard**) and copy the **connection string** (not the “pooled” one unless you know you want it).

**Important:** Keep this string private. Don’t share it or put it in public code.

---

## Step 4: Paste the connection string into your project

1. Open your **InstantTeacher** project folder in your editor (e.g. Cursor / VS Code).  
2. In the **root** of the project (same folder as `package.json`), find the file named **`.env`**.  
   - If you don’t see it: it might be hidden. In the file explorer, look for “Show hidden files” or similar, or create a new file named `.env` in the project root.  
3. Open **`.env`** and find the line that says something like:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/instantteacher?schema=public"
   ```
4. **Replace** that whole line with (paste your copied string inside the quotes):
   ```env
   DATABASE_URL="postgresql://your-username:your-password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require"
   ```
   So it’s exactly one line: `DATABASE_URL="..."` with your Neon string inside the quotes.  
5. **Save** the file (Ctrl+S).

---

## Step 5: Run the database setup commands

1. Open a **terminal** in your project folder (e.g. Terminal → New Terminal in Cursor, or open PowerShell/Command Prompt and `cd` to the project folder).  
2. Run these two commands **one after the other**:

   **Command 1 — create/update tables:**
   ```bash
   npx prisma db push
   ```
   Wait until it says something like “Your database is now in sync with your schema.”

   **Command 2 — add the default admin user:**
   ```bash
   npm run db:seed
   ```
   Wait until it finishes without errors.

3. If both commands run without errors, your Neon database is set up and the admin user exists.

---

## Step 6: Log in to InstantTeacher (admin)

1. Start your app if it’s not running (e.g. `npm run dev`).  
2. In the browser, go to your app’s **login** page (e.g. `http://localhost:3000/login`).  
3. Log in with:
   - **Email:** `support@torcanaai.com`  
   - **Password:** `SouthAfrica91!`  

If that works, Neon setup is complete.

---

## Troubleshooting

| Problem | What to try |
|--------|------------------|
| “Can’t find `.env`” | Create a new file named `.env` in the project root (same folder as `package.json`) and add the line `DATABASE_URL="your-neon-connection-string"`. |
| “Invalid connection string” | Make sure there are no extra spaces, the whole string is inside double quotes, and you didn’t remove `?sslmode=require` from the end. |
| `npx prisma db push` fails | Check that `DATABASE_URL` in `.env` is correct and that you have internet. Run `npx prisma generate` first, then `npx prisma db push` again. |
| `npm run db:seed` fails | Run `npx prisma db push` first. If it still fails, check the terminal error; it often says which part of the seed failed. |
| Login still doesn’t work | Make sure `db:seed` finished without errors. The seed creates the admin user; if the seed didn’t run, the user won’t exist. |

---

## Quick checklist

- [ ] Signed up at neon.tech  
- [ ] Created a project and copied the connection string  
- [ ] Pasted it into `.env` as `DATABASE_URL="..."`  
- [ ] Ran `npx prisma db push`  
- [ ] Ran `npm run db:seed`  
- [ ] Logged in with `support@torcanaai.com` / `SouthAfrica91!`  

If all boxes are ticked, you’re done.
