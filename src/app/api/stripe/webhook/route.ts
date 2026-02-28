import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

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

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const meta = paymentIntent.metadata || {};
    const type = meta.type;

    // Instant Sunshine: question block ($5) or reading session ($10)
    if (type === "sunshine_question_block") {
      const studentId = meta.studentId;
      const requestedByUserId = meta.requestedByUserId;
      if (studentId && requestedByUserId) {
        await prisma.sunshineQuestionBlock.create({
          data: {
            studentId,
            requestedByUserId,
            stripePaymentIntentId: paymentIntent.id,
            questionsTotal: 5,
            questionsRemaining: 5,
            amountCents: 500,
          },
        });
      }
      return NextResponse.json({ received: true });
    }
    if (type === "sunshine_reading_session") {
      const studentId = meta.studentId;
      const requestedByUserId = meta.requestedByUserId;
      if (studentId && requestedByUserId) {
        await prisma.sunshineReadingSession.updateMany({
          where: {
            studentId,
            requestedByUserId,
            status: "PENDING_PAYMENT",
            stripePaymentIntentId: paymentIntent.id,
          },
          data: { status: "PAID" },
        });
      }
      return NextResponse.json({ received: true });
    }

    // Extension payment (handled in extendSession action)
    if (type === "extension") {
      return NextResponse.json({ received: true });
    }

    // Regular tutoring session payment
    const tutoringSessionId = meta.tutoringSessionId;
    if (!tutoringSessionId) {
      return NextResponse.json({ received: true });
    }

    let paymentMethodId: string | null = null;
    if (paymentIntent.payment_method && typeof paymentIntent.payment_method === "string") {
      paymentMethodId = paymentIntent.payment_method;
    } else if (paymentIntent.payment_method && typeof paymentIntent.payment_method === "object") {
      paymentMethodId = (paymentIntent.payment_method as Stripe.PaymentMethod).id;
    }

    const allowsIncrementalCharges = meta.allowsIncrementalCharges === "true";
    await prisma.tutoringSession.update({
      where: { id: tutoringSessionId },
      data: {
        status: "PAID",
        ...(allowsIncrementalCharges && paymentMethodId
          ? { stripePaymentMethodId: paymentMethodId }
          : {}),
      },
    });

    return NextResponse.json({ received: true });
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const meta = paymentIntent.metadata || {};
    if (meta.type === "sunshine_reading_session" && meta.studentId && meta.requestedByUserId) {
      await prisma.sunshineReadingSession.updateMany({
        where: {
          studentId: meta.studentId,
          requestedByUserId: meta.requestedByUserId,
          stripePaymentIntentId: paymentIntent.id,
          status: "PENDING_PAYMENT",
        },
        data: { status: "PENDING_PAYMENT" }, // leave as is; no record may exist yet
      });
    }
    const tutoringSessionId = meta.tutoringSessionId;
    if (tutoringSessionId) {
      await prisma.tutoringSession.update({
        where: { id: tutoringSessionId },
        data: { status: "CANCELLED" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
