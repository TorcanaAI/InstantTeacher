import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeTrialCode } from "@/lib/trialCoupon";
import Stripe from "stripe";

const TRIAL_DAYS = 7;

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key);
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { plan: "weekly" | "monthly"; trialCode?: string };
    const priceId =
      body.plan === "monthly"
        ? process.env.STRIPE_PRICE_MONTHLY
        : process.env.STRIPE_PRICE_WEEKLY;
    if (!priceId) {
      return NextResponse.json(
        { error: "Subscription pricing not configured. Set STRIPE_PRICE_WEEKLY and STRIPE_PRICE_MONTHLY." },
        { status: 503 }
      );
    }

    let trialCouponId: string | undefined;
    let trialPeriodDays = 0;
    const rawTrial = (body.trialCode ?? "").trim();
    if (rawTrial) {
      const code = normalizeTrialCode(rawTrial);
      const coupon = await prisma.trialCoupon.findUnique({ where: { code } });
      if (!coupon || coupon.usedAt) {
        return NextResponse.json(
          { error: "That trial code is not valid or has already been used." },
          { status: 400 }
        );
      }
      trialCouponId = coupon.id;
      trialPeriodDays = TRIAL_DAYS;
    }

    const parent = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
    });
    let customerId = parent?.stripeCustomerId;

    const stripe = getStripe();
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email ?? undefined,
        name: session.user.name ?? undefined,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;
      if (parent) {
        await prisma.parentProfile.update({
          where: { id: parent.id },
          data: { stripeCustomerId: customerId },
        });
      }
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? req.headers.get("origin") ?? "http://localhost:3000";
    const subscriptionMetadata: Record<string, string> = { userId: session.user.id };
    if (trialCouponId) subscriptionMetadata.trialCouponId = trialCouponId;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/parent/homework?subscribed=1`,
      cancel_url: `${origin}/parent/subscribe?canceled=1`,
      client_reference_id: session.user.id,
      subscription_data: {
        metadata: subscriptionMetadata,
        trial_period_days: trialPeriodDays,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create checkout" },
      { status: 500 }
    );
  }
}
