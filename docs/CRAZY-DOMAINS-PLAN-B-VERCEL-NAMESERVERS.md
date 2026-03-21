# Plan B: When Crazy Domains Won’t Accept the CNAME

If Crazy Domains rejects the CNAME target (`cname.vercel-dns.com` or anything else), **stop fighting their DNS**. Point your domain to **Vercel’s nameservers** instead. Then **Vercel** controls all DNS (A, CNAME, etc.) and Crazy Domains never validates your records.

---

## What you’re doing (in plain English)

- Right now: **Crazy Domains** is the “phone book” for your domain (DNS). They reject certain targets.
- After this: **Vercel** becomes the “phone book.” You change 2 nameservers at Crazy Domains; all DNS is then managed in Vercel. No more CNAME errors.

**Time:** about 10 minutes + up to 24–48 hours for nameserver changes to spread (often 1–2 hours).

---

## Step 1: Add the domain in Vercel (if you haven’t)

1. Go to **https://vercel.com** → your project → **Settings** → **Domains**.
2. Add your domain (e.g. `yourdomain.com` and `www.yourdomain.com`).
3. Leave the page open; you’ll need it in Step 3.

---

## Step 2: Turn on Vercel DNS for the domain

1. In **Vercel** → **Settings** → **Domains**, click your domain (the link with your domain name).
2. Look for **“Use Vercel DNS”** or **“Nameservers”** or **“Configure DNS”**.
3. If you see an option to **use Vercel’s nameservers** or **manage DNS with Vercel**, enable it.
4. Vercel will show you **two nameservers**, for example:
   - **ns1.vercel-dns.com**
   - **ns2.vercel-dns.com**
5. **Copy these** or keep the page open. You’ll paste them into Crazy Domains in Step 4.

*(If you don’t see this, add the domain in Vercel first; then open the domain and check again. Some projects show nameservers only after the domain is added.)*

---

## Step 3: In Vercel, add the DNS records (so they’re ready when DNS switches)

Once Vercel DNS is in use, Vercel may create records automatically. If you can **add records** in Vercel’s DNS view for this domain, add:

- **A** record: Name `@` (or your root domain), Value `76.76.21.21`
- **CNAME** record: Name `www`, Value `cname.vercel-dns.com`

If Vercel already shows these (or says they’ll be created when you use Vercel DNS), you don’t need to do anything here. The important part is **Step 4**.

---

## Step 4: Change nameservers at Crazy Domains

1. Log in to **Crazy Domains** (crazydomains.com or your regional site).
2. Go to **My Products** / **Domains** and **click your domain**.
3. Find **Nameservers** (or “Name Servers”, “DNS”, “Delegate DNS”).
4. Change from **Crazy Domains’ default** nameservers to **custom** / **own** nameservers.
5. Enter **exactly** (no typos, no extra dots):
   - **Nameserver 1:** `ns1.vercel-dns.com`
   - **Nameserver 2:** `ns2.vercel-dns.com`
   If there are more than 2 fields, leave the rest blank or remove old ones; 2 is enough.
6. **Save** / **Update**.

Crazy Domains may warn that “your email/DNS might be affected.” For a site hosted on Vercel, that’s expected. Confirm the change.

---

## Step 5: Wait for DNS to update

- Nameserver changes can take **up to 24–48 hours**; often 1–2 hours.
- In **Vercel** → **Settings** → **Domains**, your domain should eventually show **Valid** (green).
- When it does, Vercel has taken over DNS and issued SSL. No CNAME is entered at Crazy Domains anymore, so their “invalid target” error no longer applies.

---

## Step 6: Set your app URL in Vercel (if you haven’t)

1. **Vercel** → your project → **Settings** → **Environment Variables**.
2. Add or edit (for **Production**):
   - **NEXTAUTH_URL** = `https://yourdomain.com` (or `https://www.yourdomain.com` if you prefer www)
   - **NEXT_PUBLIC_APP_URL** = same
3. **Save**, then **Deployments** → ⋮ on latest → **Redeploy**.

---

## Checklist

- [ ] Domain added in Vercel (Settings → Domains).
- [ ] Vercel DNS / nameservers enabled for the domain; copied **ns1.vercel-dns.com** and **ns2.vercel-dns.com**.
- [ ] At Crazy Domains, nameservers changed to **ns1.vercel-dns.com** and **ns2.vercel-dns.com** (and saved).
- [ ] Waited until Vercel shows the domain as **Valid**.
- [ ] NEXTAUTH_URL and NEXT_PUBLIC_APP_URL set and project redeployed.

---

## If you use email on the same domain

If you have **email** at Crazy Domains (e.g. you@yourdomain.com) and you switch nameservers to Vercel, **Vercel does not handle email**. You must re-add your **MX records** (and any TXT for SPF/DKIM) **in Vercel’s DNS** so email keeps working. Get the MX values from Crazy Domains or your email provider and add them in Vercel → Domains → your domain → DNS. If you don’t use email on this domain, you can ignore this.
