# Instant Teacher — Final Pre-Launch Checklist

Use this to confirm **database**, **Sunshine**, **payments**, **auth**, **video**, and **notifications** are set up and working before going live.

**Build status:** ✅ Project builds successfully (`npm run build`).

---

## 1. Database (PostgreSQL)

| Check | Env / Action |
|-------|----------------|
| **DATABASE_URL** set in Vercel (and locally if you run dev) | Required. From Neon/Supabase or Vercel Storage. |
| Migrations applied in production | Run `npx prisma migrate deploy` against production DB (or use your deploy script). |
| Admin user exists | Seed has run (`npm run db:seed` with production `DATABASE_URL` once), or use bootstrap/setup flow. |

**Quick test:** Log in at `/admin/login` (or `/login` with admin email). If you see the admin dashboard, DB and auth are wired.

---

## 2. Auth (NextAuth)

| Check | Env / Action |
|-------|----------------|
| **AUTH_SECRET** set in production | Required. e.g. `openssl rand -base64 32`. |
| **NEXTAUTH_URL** set in production | Your live URL, e.g. `https://yourdomain.com`. Prevents redirect/cookie issues. |
| **NEXT_PUBLIC_APP_URL** | Same as NEXTAUTH_URL for links in emails and app. |

**Quick test:** Log in as parent and as teacher; confirm redirects and session persist.

---

## 3. Payments (Stripe)

| Check | Env / Action |
|-------|----------------|
| **STRIPE_SECRET_KEY** | Stripe Dashboard → API keys (secret key). |
| **STRIPE_WEBHOOK_SECRET** | Stripe Dashboard → Webhooks → endpoint for **your production URL** → signing secret. |
| **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** | Stripe Dashboard → API keys (publishable). |
| **STRIPE_CONNECT_CLIENT_ID** | If using Connect (teacher payouts); Stripe Connect settings. |
| Webhook endpoint in Stripe | `https://yourdomain.com/api/stripe/webhook` (or your Vercel URL). Events: `payment_intent.succeeded`, etc. |

**Quick test:** Create a test tutoring session and go through checkout (test card `4242 4242 4242 4242`). Session should move to confirmed after payment. Check Stripe Dashboard for the event and webhook delivery.

---

## 4. Sunshine (Voice + Reading)

| Check | Env / Action |
|-------|----------------|
| **ELEVENLABS_API_KEY** | ElevenLabs API key (TTS + STT for Sunshine). |
| **ELEVENLABS_VOICE_ID** | Optional; default voice is set in code. |
| **OPENAI_API_KEY** | For Sunshine comprehension questions (and any AI features). |
| Reading books have **contentText** | Admin → Books → each book used for reading must have pasted text (not placeholder). |

**Sunshine flows:**

- **Speak (TTS):** `/api/sunshine/speak` — needs **ELEVENLABS_API_KEY**.
- **Transcribe (STT):** `/api/sunshine/transcribe` — same key (ElevenLabs STT).
- **Reading:** Start session → reading page uses speak + transcribe + reading-context + reading-feedback. All require auth; book must have `contentText`.
- **Comprehension questions:** `/api/sunshine/comprehension-questions` — needs **OPENAI_API_KEY**.

**Quick test:** Admin → Sunshine reading test: start a session, open reading page, click “Start reading with Sunshine”. You should hear the intro and see “What Sunshine heard” when you speak.

---

## 5. Sunshine payments (Stripe)

| Check | Env / Action |
|-------|----------------|
| Same Stripe keys as above | Sunshine checkout uses **STRIPE_SECRET_KEY** and **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**. |
| Webhook handles Sunshine types | Webhook already handles `payment_intent.succeeded` with `metadata.type` = `sunshine_question_block` and `sunshine_reading_session`. |

**Quick test:** Parent → Sunshine checkout (question block or reading). Pay with test card; balance/session should update after webhook.

---

## 6. Video (Daily.co)

| Check | Env / Action |
|-------|----------------|
| **DAILY_API_KEY** | Daily.co dashboard. |
| **DAILY_DOMAIN** | e.g. `instantteacher.daily.co` (your Daily subdomain). |
| **DAILY_API_BASE_URL** | Usually `https://api.daily.co/v1`. |

**Quick test:** Admin → Video test: create a room, join. Or complete a tutoring session flow and join the session video link.

---

## 7. Teacher registration email (Resend)

| Check | Env / Action |
|-------|----------------|
| **ADMIN_NOTIFY_EMAIL** | Email that receives “new teacher registered” (e.g. support@torcanaai.com). |
| **RESEND_API_KEY** | Resend API key. |
| **RESEND_FROM** | Optional; default is Resend onboarding address. Use your own once domain is verified in Resend. |

**Quick test:** Register a new teacher (or use a test email). Check **ADMIN_NOTIFY_EMAIL** inbox for the notification.

---

## 8. Optional / legacy

| Item | Env | Notes |
|------|-----|--------|
| **Twilio** (video legacy) | TWILIO_* | Only if you still use Twilio video; Daily is primary. |
| **Redis (Upstash)** | UPSTASH_* | If used for rate limiting or queues; not required for core flows. |
| **ADMIN_BOOTSTRAP_SECRET** | Only if you use the bootstrap API to create admin. | Keep secret; use only in production if needed. |

---

## 9. Production URLs

- **Stripe webhook:** `https://yourdomain.com/api/stripe/webhook`
- **Admin:** `https://yourdomain.com/admin` (and `/admin/login`)
- **Parent dashboard:** `https://yourdomain.com/parent/dashboard`
- **Teacher dashboard:** `https://yourdomain.com/teacher/dashboard`
- **NEXTAUTH_URL / NEXT_PUBLIC_APP_URL:** `https://yourdomain.com`

---

## 10. One-line checklist (Vercel env vars)

In Vercel → Settings → Environment Variables (Production), confirm you have:

- **Required:** `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `ELEVENLABS_API_KEY`
- **Sunshine AI:** `OPENAI_API_KEY` (for comprehension questions)
- **Video:** `DAILY_API_KEY`, `DAILY_DOMAIN`
- **Teacher email:** `ADMIN_NOTIFY_EMAIL`, `RESEND_API_KEY`
- **Optional:** `STRIPE_CONNECT_CLIENT_ID`, `ELEVENLABS_VOICE_ID`, `RESEND_FROM`, `DAILY_API_BASE_URL`

After changing env vars, **redeploy** so the new build uses them.

---

If anything fails in a specific area (e.g. “Sunshine doesn’t speak” or “payment doesn’t complete”), check the corresponding section above and the server logs (Vercel → Deployments → Function logs) for the exact error.
