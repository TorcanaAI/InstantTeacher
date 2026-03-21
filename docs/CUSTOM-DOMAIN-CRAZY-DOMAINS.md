# Link Your Crazy Domains Domain to Vercel (Step-by-Step)

This guide gets your InstantTeacher site live on your own domain (e.g. `instantteacher.com.au` or `www.yourdomain.com`) using **Crazy Domains** for DNS and **Vercel** for hosting.

**Time:** about 15–20 minutes (plus up to 48 hours for DNS to propagate; often much faster).

> **Struggling with Crazy Domains?** Use the **beginner-friendly version**: **[CRAZY-DOMAINS-DUMMY-GUIDE.md](./CRAZY-DOMAINS-DUMMY-GUIDE.md)** — step-by-step like a dummy, with both “domain only” and “cPanel” paths.

---

## Overview

1. **Add the domain in Vercel** → Vercel tells you which DNS records to create.
2. **Add those DNS records in Crazy Domains** → Your domain points to Vercel.
3. **Update environment variables in Vercel** → Login and redirects use your domain.
4. **Optional:** Update Stripe webhook and any other services to use your domain.

---

## Part 1: Add the domain in Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign in.
2. Open your **InstantTeacher** project (or whatever the project is called).
3. Click the **Settings** tab.
4. In the left sidebar, click **Domains**.
5. Under **Add**, type your domain in one of these forms:
   - **Apex (root):** e.g. `yourdomain.com` or `instantteacher.com.au`
   - **With www:** e.g. `www.yourdomain.com`
   - Add **both** if you want `yourdomain.com` and `www.yourdomain.com` to work.
6. Click **Add** for each domain you enter.
7. Vercel will show a status like **Invalid Configuration** or **Pending** and will display **exactly which DNS records you need**. Keep this page open — you’ll use it in Part 2.

   Typical values Vercel shows:
   - **Apex (root) domain:**  
     - Type: **A**  
     - Name: `@` (or your root domain)  
     - Value: **`76.76.21.21`**
   - **www subdomain:**  
     - Type: **CNAME**  
     - Name: `www`  
     - Value: **`cname.vercel-dns.com`**

   **Important:** Always use the **exact** values Vercel shows for your project; they can change.

---

## Part 2: Add DNS records in Crazy Domains

1. Log in to **[crazydomains.com](https://www.crazydomains.com)** (or your regional Crazy Domains site).
2. Go to **My Account** or **Dashboard** and find your domain.
3. Open the domain and look for **DNS**, **DNS Management**, **Manage DNS**, **Nameservers**, or **Zone File**.
   - If you see **Nameservers**: ensure the domain is using **Crazy Domains’ default nameservers** (so you can edit DNS there). If it’s pointing to another host’s nameservers, you manage DNS at that host instead.
4. Open **DNS / DNS Management / Zone Editor** (or the option that lists A, CNAME, MX records).
5. Add the records Vercel asked for:

   **For the apex/root domain (e.g. yourdomain.com):**
   - Click **Add Record** (or similar).
   - **Type:** A  
   - **Name / Host:** `@` or leave blank (depends on Crazy Domains; “@” usually means the root domain).  
   - **Value / Points to / IP:** `76.76.21.21`  
   - **TTL:** 3600 or default.  
   - Save.

   **For www (e.g. www.yourdomain.com):**
   - Click **Add Record**.
   - **Type:** CNAME  
   - **Name / Host:** `www`  
   - **Value / Points to / Target:** `cname.vercel-dns.com`  
   - **TTL:** 3600 or default.  
   - Save.

6. Remove any **old A or CNAME** records that point the same host to a different IP or hostname (e.g. old hosting), or they can override Vercel.
7. Save all changes. DNS can take from a few minutes up to 24–48 hours to propagate; often it’s 15–30 minutes.

---

## Part 3: Wait for Vercel to verify and issue SSL

1. Back in **Vercel → Project → Settings → Domains**, the domain status will change from **Invalid Configuration** / **Pending** to **Valid** (often with a green check) once DNS is correct.
2. Vercel will automatically issue an **SSL certificate** (HTTPS). No extra step needed.
3. If it stays invalid for more than an hour, double-check:
   - A record for apex: `76.76.21.21`
   - CNAME for `www`: `cname.vercel-dns.com`
   - No conflicting A/CNAME for the same name pointing elsewhere.

---

## Part 4: Set environment variables to your domain

So that login and redirects use your real domain (not `*.vercel.app`):

1. In **Vercel → Your project → Settings → Environment Variables**.
2. Add or update:

   | Name             | Value                          | Environments   |
   |------------------|--------------------------------|-----------------|
   | `NEXTAUTH_URL`   | `https://yourdomain.com`       | Production      |
   | `NEXT_PUBLIC_APP_URL` | `https://yourdomain.com` | Production      |

   Use your **actual** domain:
   - If you use **www**: `https://www.yourdomain.com`
   - If you use **apex only**: `https://yourdomain.com`
   - If both work, pick one as the “main” URL and use it in both variables.

3. Click **Save**.
4. **Redeploy** so the new values are used: **Deployments** → ⋮ on the latest deployment → **Redeploy**.

---

## Part 5: Optional — Stripe webhook

If you use Stripe (payments):

1. Go to **[Stripe Dashboard](https://dashboard.stripe.com)** → **Developers** → **Webhooks**.
2. Edit your existing webhook endpoint (or add one).
3. Set the URL to: **`https://yourdomain.com/api/stripe/webhook`** (use your real domain).
4. Save. Stripe will send a new **Signing secret**; update **`STRIPE_WEBHOOK_SECRET`** in Vercel → **Settings → Environment Variables** and redeploy.

---

## Part 6: Redirect www to apex (or vice versa) — optional

If you want **only** one URL (e.g. always use `www.yourdomain.com`):

- In **Vercel → Settings → Domains**, you can set which domain is **primary**. Vercel can redirect the other to the primary.
- Or use **only** the apex **or** only **www** in DNS and in `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL`.

---

## Checklist

- [ ] Added domain(s) in Vercel → Settings → Domains.
- [ ] Added **A** record for apex to `76.76.21.21` in Crazy Domains.
- [ ] Added **CNAME** for `www` to `cname.vercel-dns.com` in Crazy Domains (if using www).
- [ ] Domain shows **Valid** in Vercel (and SSL is active).
- [ ] Set **NEXTAUTH_URL** and **NEXT_PUBLIC_APP_URL** to `https://yourdomain.com` (or `https://www.yourdomain.com`).
- [ ] Redeployed the project after changing env vars.
- [ ] (Optional) Updated Stripe webhook URL and **STRIPE_WEBHOOK_SECRET**.

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| Domain stays **Invalid Configuration** in Vercel | Confirm A and CNAME match exactly what Vercel shows. Remove other A/CNAME for the same name. Wait up to 48 hours for DNS. |
| **SSL certificate** not ready | Vercel issues it automatically once DNS is valid. Wait 5–15 minutes after DNS is correct. |
| Login redirects to `vercel.app` | Set **NEXTAUTH_URL** and **NEXT_PUBLIC_APP_URL** to your custom domain and **redeploy**. |
| Can’t find DNS in Crazy Domains | Look for **DNS**, **Manage DNS**, **Zone Editor**, or **Nameservers**. If the domain uses another company’s nameservers, manage DNS there. |
| “Too many redirects” | Ensure you didn’t set both apex and www to different targets; use Vercel’s recommended A + CNAME and let Vercel handle redirects. |

---

Once DNS is valid and env vars are set, open **https://yourdomain.com** (or **https://www.yourdomain.com**) — your site is live on your domain.
