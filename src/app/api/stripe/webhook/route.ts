import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { HOMEWORK_SESSION_MINUTES } from "@/lib/constants";
import { processTrialAfterSubscriptionCreated } from "@/lib/trialRedemptionWebhook";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key);
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET not configured" }, { status: 500 });
  }
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const raw = event.data.object as {
      id: string;
      metadata?: { userId?: string; trialCouponId?: string };
      items?: { data?: Array<{ price?: { id?: string; recurring?: { interval?: string } } }> };
      status?: string;
      current_period_end?: number;
    };
    const userId = raw.metadata?.userId;
    if (!userId) return NextResponse.json({ received: true });
    const plan = raw.items?.data?.[0]?.price?.recurring?.interval === "month" ? "MONTHLY" : "WEEKLY";
    const currentPeriodEnd =
      typeof raw.current_period_end === "number"
        ? new Date(raw.current_period_end * 1000)
        : null;
    const stripeStatus = raw.status ?? "";
    const status =
      stripeStatus === "active" || stripeStatus === "trialing"
        ? "ACTIVE"
        : stripeStatus === "past_due"
          ? "PAST_DUE"
          : "CANCELED";

    const trialCouponId = raw.metadata?.trialCouponId;
    if (trialCouponId && event.type === "customer.subscription.created") {
      const stripe = getStripe();
      const sub = await stripe.subscriptions.retrieve(raw.id, {
        expand: ["default_payment_method", "latest_invoice.payment_intent.payment_method"],
      });
      await processTrialAfterSubscriptionCreated(stripe, sub, userId, trialCouponId);
    }

    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeSubscriptionId: raw.id,
        stripePriceId: raw.items?.data?.[0]?.price?.id ?? null,
        plan,
        status,
        currentPeriodEnd,
      },
      update: {
        stripeSubscriptionId: raw.id,
        stripePriceId: raw.items?.data?.[0]?.price?.id ?? null,
        plan,
        status,
        currentPeriodEnd,
      },
    });
    return NextResponse.json({ received: true });
  }

  if (event.type === "customer.subscription.deleted") {
    const raw = event.data.object as { id: string };
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: raw.id },
      data: { status: "CANCELED" },
    });
    return NextResponse.json({ received: true });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const meta = paymentIntent.metadata || {};
    const type = meta.type;

    if (type === "homework_session") {
      const homeworkSession = await prisma.homeworkSession.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
      });
      if (homeworkSession) {
        const now = new Date();
        const endsAt = new Date(now.getTime() + HOMEWORK_SESSION_MINUTES * 60 * 1000);
        await prisma.homeworkSession.update({
          where: { id: homeworkSession.id },
          data: { status: "ACTIVE", startedAt: now, endsAt },
        });
      }
    }

    return NextResponse.json({ received: true });
  }

  if (event.type === "payment_intent.payment_failed") {
    // Optional: log or handle failed homework_session if needed
  }

  return NextResponse.json({ received: true });
}
