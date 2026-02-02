import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

function getStripe() {
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

    const { sessionId } = (await req.json()) as { sessionId: string };
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const t = await prisma.tutoringSession.findFirst({
      where: { id: sessionId, requestedByUserId: session.user.id },
      include: { student: true },
    });
    if (!t) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (t.status !== "REQUESTED" && t.status !== "PAYMENT_PENDING") {
      return NextResponse.json({ error: "Session cannot be paid" }, { status: 400 });
    }

    const stripe = getStripe();

    // If payment intent already exists (e.g. user refreshed checkout), return its client_secret
    if (t.status === "PAYMENT_PENDING" && t.stripePaymentIntentId) {
      const existing = await stripe.paymentIntents.retrieve(t.stripePaymentIntentId);
      if (existing.status === "succeeded") {
        return NextResponse.json({ error: "Payment already completed" }, { status: 400 });
      }
      return NextResponse.json({
        clientSecret: existing.client_secret,
        paymentIntentId: existing.id,
      });
    }

    const parent = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
    });
    const customerId = parent?.stripeCustomerId;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: t.pricePaid,
      currency: "aud",
      customer: customerId ?? undefined,
      metadata: {
        tutoringSessionId: t.id,
        studentId: t.studentId,
        requestedByUserId: t.requestedByUserId,
      },
      automatic_payment_methods: { enabled: true },
    });

    await prisma.tutoringSession.update({
      where: { id: sessionId },
      data: {
        status: "PAYMENT_PENDING",
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("Stripe create-payment-intent error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment failed" },
      { status: 500 }
    );
  }
}
