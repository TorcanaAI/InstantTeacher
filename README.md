# InstantTeacher

On-demand micro-tutoring for Western Australia. Students and parents connect instantly with qualified educators for short sessions—no subscription, no long-term commitment.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS, Shadcn/UI, React Hook Form + Zod, TanStack Query
- **Backend:** Next.js API routes / Server Actions, PostgreSQL (Prisma), Redis (Upstash), Auth.js (NextAuth)
- **Video:** Twilio Video
- **Payments:** Stripe (Checkout + Connect for teacher payouts)

## Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env` and fill in values.
   - Required: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, Stripe keys, Twilio credentials (see `.env.example`).

3. **Database**
   ```bash
   npx prisma generate   # generate client (stop dev server if you get a file-lock error)
   npx prisma db push
   npm run db:seed   # creates admin user (see ADMIN_EMAIL / ADMIN_PASSWORD in env)
   ```

4. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Key Flows

- **Parents:** Sign up → Add students (with school name for conflict-of-interest) → Request help (subject, duration, prompt) → Pay via Stripe → Join video session → Rate teacher.
- **Teachers:** Sign up (WWCC + Teacher Registration / TRB) → Admin verifies WWCC & TRB on **Admin → Registrations** → Approve → Get rostered → Check in to shifts → Accept sessions → Join video → Get paid (75% payout).
- **Admin:** Dashboard, **Registrations** (verify WWCC & Teacher Registration, approve/reject), teachers, sessions, shifts (create/assign), disputes, refunds.

## Pricing (fixed)

- 15 min: $30 | 30 min: $55 | 60 min: $90  
- Platform: 25% | Teacher: 75%

## Safety & Compliance

- Conflict-of-interest: teachers cannot tutor students from their own school; blocked schools list supported.
- **WWCC** and **Teacher Registration (Register of Teachers / TRB)** required for teachers. Admin confirms both on the Registrations page before approving an application.
- In-session communication only; report button; no sharing of personal contact info.

## Dashboard & Login

- **Dashboard** (`/dashboard`) redirects by role: Admin → `/admin`, Teacher → `/teacher/dashboard`, Parent → `/parent/dashboard`. Ensure `AUTH_SECRET` is set in `.env` or login/session and dashboard redirects will fail.
- Teachers can **log in** via `/login` (or “Log in as teacher” on the For Teachers page); after login they are sent to the teacher dashboard and can check **My registration** for application status.

## Scripts

- `npm run dev` — development
- `npm run build` — production build
- `npm run db:push` — push Prisma schema to DB
- `npm run db:seed` — seed admin user
- `npm run test` — run unit tests (e.g. matching / conflict-of-interest)

## Deployment

- **Web:** Vercel (or any Node host).
- **Database:** Supabase or Neon (PostgreSQL).
- **Redis:** Upstash for presence/queue (optional for MVP).
- Configure Stripe webhooks to `https://your-domain/api/stripe/webhook`.
- Set all env vars in your hosting dashboard.

## Video (Twilio)

- **Provider:** Twilio Video (not Daily.co).
- **Flow:** Parent requests → payment → session PAID → teacher accepts from dashboard (incoming requests, 30s countdown) → session MATCHED → parent/teacher join → token from `/api/session/[sessionId]/token` → room created on first join.
- **Admin video test:** `/admin/video-test` — create test room, join as Teacher or Student.
- **Session UI status:** "Waiting for teacher…", "Teacher joined", "Call connected", "Reconnecting…".

## Admin

- **Login:** `/admin/login` redirects to `/login?callbackUrl=/admin`. **Dashboard:** `/admin` and `/admin/dashboard` (redirects to `/admin`).
- **Seeded admin:** Email `support@torcanaai.com`, password `SouthAfrica91!` (override with `ADMIN_EMAIL` / `ADMIN_PASSWORD` in env).
- **Stripe:** See `docs/STRIPE.md` for checkout, webhooks, and refunds.

---

Built for Australia. No subscription, no lock-in.
