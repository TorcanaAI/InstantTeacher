# Crazy Domains → Vercel: Step-by-Step (No Experience Needed)

Do exactly these steps in order. Don’t skip steps.

---

## BEFORE YOU START

- You need: a **domain** at Crazy Domains (e.g. `mysite.com.au`) and your **InstantTeacher** site already deployed on **Vercel** (e.g. `instant-teacher.vercel.app`).
- Replace **yourdomain.com** in this guide with your real domain (e.g. `instantteacher.com.au`).

---

# PART A: Tell Vercel Your Domain (5 minutes)

**Goal:** Vercel will then tell you exactly what to type into Crazy Domains.

## Step A1: Open Vercel

1. Open your web browser.
2. Go to: **https://vercel.com**
3. Log in (e.g. with GitHub if that’s how you signed up).

## Step A2: Open your project

1. On the Vercel dashboard you’ll see a list of projects.
2. Click the project that is your InstantTeacher app (the name you gave it when you imported it).

## Step A3: Go to Domains

1. At the top of the project page, click **Settings**.
2. In the **left** sidebar, click **Domains**.

## Step A4: Add your domain

1. You’ll see a box that says something like “Add” or “Add domain”.
2. In the text field, type your domain **exactly** as you want people to open it:
   - For **just** the main name (no “www”): type e.g. **yourdomain.com**
   - For **www**: type e.g. **www.yourdomain.com**
   - You can add **both** (one at a time) so both addresses work.
3. Click **Add** (or the button next to the box).
4. Add the second one too if you want both (e.g. yourdomain.com and www.yourdomain.com).

## Step A5: See what Vercel wants

1. After adding, the domain will show as **Invalid Configuration** or **Pending**. That’s normal.
2. **Click on the domain** you added (the text that’s a link).
3. Vercel will show the **DNS records** you need. It will look something like:

   **Record 1 (root/apex):**
   - Type: **A**
   - Name: **@** (or your domain name)
   - Value: **76.76.21.21**

   **Record 2 (www):**
   - Type: **CNAME**
   - Name: **www**
   - Value: **cname.vercel-dns.com**

4. **Keep this Vercel page open** or write these down. You’ll type them into Crazy Domains next.

---

# PART B: Log in to Crazy Domains (2 minutes)

## Step B1: Open Crazy Domains

1. Open a **new tab** in your browser (or a new window).
2. Go to: **https://www.crazydomains.com** (or **crazydomains.com.au** if you’re in Australia).
3. Click **Login** or **Sign In** (usually top right).
4. Enter your Crazy Domains email and password and log in.

## Step B2: Find your domain

1. After login you’ll see a dashboard (e.g. “My Products”, “Account”, “Domains”).
2. Find the section that lists your **domains** (your domain name will be there).
3. **Click on your domain name** (the one you added in Vercel, e.g. yourdomain.com).

---

# PART C: Open DNS / Zone Editor in Crazy Domains

Crazy Domains has **two** possible ways to get to DNS. Try **Option 1** first. If you don’t see it, use **Option 2**.

---

## OPTION 1: You only have a domain (no web hosting with Crazy Domains)

1. After clicking your domain (Step B2), you should see a **domain management** page.
2. Look for one of these:
   - **DNS**
   - **Manage DNS**
   - **DNS Settings**
   - **DNS Management**
   - **Advanced DNS**
   - **Zone File**
3. **Click that link.** You’ll see a list of DNS records (maybe A, CNAME, MX, etc.) or a button like **Add Record** / **Add DNS Record**.
4. If you see that, you’re in the right place. **Skip Option 2** and go to **Part D**.

---

## OPTION 2: You have web hosting with Crazy Domains (cPanel)

1. From your Crazy Domains dashboard, find **Hosting** or **Web Hosting** or **cPanel**.
2. Click to open your **hosting** product (not the domain).
3. Look for **Open cPanel** or **Login to cPanel** or **Control Panel** and click it. (You might need to open cPanel in a new tab.)
4. Inside **cPanel**, find the **Domains** section.
5. Click **Zone Editor**.
6. You’ll see a table with your domain(s). Next to **your domain**, click **Manage** (or the link that lets you edit that domain’s records).
7. You’ll now see the list of DNS records (A, CNAME, etc.) or an **Add Record**-style button.
8. You’re in the right place. Go to **Part D**.

---

## If you still can’t find DNS

- Look for **Nameservers**. If it says your domain is using **Crazy Domains** nameservers (e.g. ns1.crazydomains.com), then DNS is managed in Crazy Domains and one of the two options above should work.
- If it says your domain uses **another company’s** nameservers, you must add the records **at that company** (whoever’s nameservers are listed), not in Crazy Domains.
- You can also use Crazy Domains **Help** or **Contact support** and say: “I need to add an A record and a CNAME record for my domain to point to Vercel. Where do I edit DNS records?”

---

# PART D: Add the A record (root domain)

**What we’re doing:** Point “yourdomain.com” (no www) to Vercel.

1. On the DNS / Zone Editor page, click **Add Record** (or **+ Add**, **Create Record**, **Add DNS Record** — whatever Crazy Domains calls it).
2. Choose record type **A** (from a dropdown or list).
3. Fill in **exactly** as below (labels may be slightly different):

   | Field name (approx.) | What to enter |
   |----------------------|----------------|
   | **Name** / **Host** / **Hostname** | `@` **or** leave blank (if it says “leave blank for root”, leave it blank) |
   | **Value** / **Points to** / **IP Address** / **Answer** | `76.76.21.21` |
   | **TTL** | Leave default (e.g. 3600) or leave as is |

4. Click **Save** / **Add Record** / **Submit**.

---

# PART E: Add the CNAME record (www)

**What we’re doing:** Point “www.yourdomain.com” to Vercel.

1. Click **Add Record** again (same as in Part D).
2. Choose record type **CNAME**.
3. Fill in **exactly** as below:

   | Field name (approx.) | What to enter |
   |----------------------|----------------|
   | **Name** / **Host** / **Hostname** | `www` (only the letters www, nothing else) |
   | **Value** / **Points to** / **Target** / **Answer** | `cname.vercel-dns.com` |
   | **TTL** | Leave default or as is |

4. Click **Save** / **Add Record** / **Submit**.

---

# PART F: Remove old records that might conflict (important)

If your domain used to point to another website or “parked page”:

1. On the same DNS page, look at the **list** of existing records.
2. Find any **A** or **CNAME** record where:
   - **Name** is `@` or blank or your domain name, **or**
   - **Name** is `www`
3. If the **Value** is **not** `76.76.21.21` (for A) or `cname.vercel-dns.com` (for CNAME), that record is pointing somewhere else.
4. **Delete** or **Remove** those old records (there’s usually a trash icon or “Delete” next to each row).
5. **Keep** the two records you just added in Part D and Part E.

---

# PART G: Wait and check in Vercel (5 minutes to 48 hours)

1. DNS can take from **a few minutes** to **24–48 hours** to update. Often it’s 15–30 minutes.
2. Go back to **Vercel** → your project → **Settings** → **Domains**.
3. Refresh the page every so often. The domain status should change from **Invalid Configuration** / **Pending** to **Valid** (with a green tick when it’s working).
4. When it says **Valid**, Vercel has also set up **HTTPS** for you. You don’t need to do anything else for SSL.

---

# PART H: Set your app URL in Vercel (so login works)

1. In **Vercel** → your project → **Settings** → **Environment Variables**.
2. Add or edit these (use **Production**):

   | Name | Value |
   |------|--------|
   | **NEXTAUTH_URL** | `https://yourdomain.com` (or `https://www.yourdomain.com` if you use www) |
   | **NEXT_PUBLIC_APP_URL** | Same as above |

   Use your **real** domain and **https://** — no spaces, no slash at the end.

3. Click **Save**.
4. Go to **Deployments**, click the **three dots** on the latest deployment, and click **Redeploy** so the new URL is used.

---

# PART I: Open your site

1. In your browser, go to **https://yourdomain.com** (or **https://www.yourdomain.com**).
2. You should see your InstantTeacher site. If it loads, you’re live.

---

# Quick checklist

- [ ] Added domain in Vercel (Settings → Domains).
- [ ] Logged into Crazy Domains and opened DNS / Zone Editor.
- [ ] Added **A** record: Name `@` (or blank), Value `76.76.21.21`.
- [ ] Added **CNAME** record: Name `www`, Value `cname.vercel-dns.com`.
- [ ] Removed any old A/CNAME that pointed somewhere else.
- [ ] Waited until Vercel shows domain as **Valid**.
- [ ] Set **NEXTAUTH_URL** and **NEXT_PUBLIC_APP_URL** in Vercel and **Redeployed**.
- [ ] Opened https://yourdomain.com in the browser and saw the site.

---

# If something goes wrong

| What you see | What to do |
|--------------|------------|
| Can’t find DNS / Zone Editor in Crazy Domains | Try both Option 1 (domain page) and Option 2 (cPanel). Or contact Crazy Domains support and ask where to add A and CNAME records. |
| Vercel still says Invalid after 1 hour | Double-check: A record = `76.76.21.21`, CNAME = `cname.vercel-dns.com`. Remove any other A or CNAME for the same name. Wait up to 48 hours. |
| Site loads on vercel.app but not my domain | Make sure you completed Part H (NEXTAUTH_URL, NEXT_PUBLIC_APP_URL, and Redeploy). |
| “Too many redirects” or blank page | Don’t point both @ and www to different IPs; use exactly the A and CNAME above and let Vercel handle redirects. |

If you tell me exactly what you see on screen (e.g. “I’m on the domain page but I only see Renew and Nameservers”), I can tell you the next click.
