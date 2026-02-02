# Stripe integration — InstantTeacher

## Goal

Implement Stripe payments for session purchases with clean tracking: checkout, webhooks, and refunds.

## Environment variables

Add to `.env`:

- `STRIPE_SECRET_KEY` — Stripe secret key (test: `sk_test_...`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Publishable key (test: `pk_test_...`)
- `STRIPE_WEBHOOK_SECRET` — Webhook signing secret (`whsec_...`) from Stripe Dashboard → Webhooks

## Setup (test mode)

1. Create a [Stripe account](https://dashboard.stripe.com/register) and enable **Test mode**.
2. In Stripe Dashboard → Developers → API keys, copy **Secret key** and **Publishable key**.
3. Create products/prices (or use existing):
   - 15 min = $30 (3000 cents)
   - 30 min = $55 (5500 cents)
   - 60 min = $90 (9000 cents)
4. Add a webhook endpoint: `https://your-domain.com/api/stripe/webhook` (or use Stripe CLI for local: `stripe listen --forward-to localhost:3000/api/stripe/webhook`).
5. Copy the **Webhook signing secret** into `STRIPE_WEBHOOK_SECRET`.

## Checkout flow

1. Parent requests help → session created with status `REQUESTED` (no teacher yet).
2. Parent is redirected to `/parent/checkout?sessionId=...`.
3. Frontend calls `POST /api/stripe/create-payment-intent` with `{ sessionId }`.
4. Backend creates a Stripe Payment Intent with metadata `tutoringSessionId`, `studentId`, `requestedByUserId`, and returns `clientSecret`.
5. Parent completes payment with Stripe Payment Element; on success, redirect to `/parent/checkout/success?sessionId=...`.
6. Webhook `payment_intent.succeeded` marks session as `PAID`. Teacher can then accept from incoming requests; when they do, session becomes `MATCHED`. Video room is created when first participant joins.

## Webhook handling (required)

- **`payment_intent.succeeded`**  
  - Read `metadata.tutoringSessionId`.  
  - Update session status to `PAID`.  
  - (Video room is created when user joins via `/api/session/[sessionId]/token`.)

- **`payment_intent.payment_failed`**  
  - Optionally set session to `CANCELLED` if you track by metadata.

Always verify signature using `STRIPE_WEBHOOK_SECRET` and return 200 quickly; do heavy work asynchronously if needed.

## Stored payment references

- **TutoringSession**: `stripePaymentIntentId` (set when creating Payment Intent), `stripeRefundId` (set when issuing refund).
- **Amounts**: `pricePaid`, `platformFee`, `teacherPayout` (all in cents).

## Refund handling

- Admin can issue refund from admin panel (e.g. dispute resolution).
- Use Stripe API: `stripe.refunds.create({ payment_intent: session.stripePaymentIntentId, ... })`.
- Store `refund.id` in session and set session status to `REFUNDED`.

## Test mode

Keep Stripe in **test mode** until end-to-end testing is complete. Use test cards (e.g. `4242 4242 4242 4242`) and test webhooks via Stripe CLI.
