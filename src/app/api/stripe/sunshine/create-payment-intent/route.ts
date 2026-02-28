import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import {
  SUNSHINE_QUESTION_BLOCK_PRICE_CENTS,
  SUNSHINE_READING_SESSION_PRICE_CENTS,
} from "@/lib/constants";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Payments are not configured. Add STRIPE_SECRET_KEY in Vercel → Settings → Environment Variables.");
  }
  return new Stripe(key);
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      type: "question_block" | "reading_session";
      studentId: string;
    };
    const { type, studentId } = body;
    if (!type || !studentId) {
      return NextResponse.json(
        { error: "type and studentId required" },
        { status: 400 }
      );
    }
    if (type !== "question_block" && type !== "reading_session") {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const parent = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      include: { students: true },
    });
    if (!parent) {
      return NextResponse.json({ error: "Parent profile not found" }, { status: 403 });
    }
    const student = parent.students.find((s) => s.id === studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const stripe = getStripe();

    if (type === "question_block") {
      const amountCents = SUNSHINE_QUESTION_BLOCK_PRICE_CENTS;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: "aud",
        customer: parent.stripeCustomerId ?? undefined,
        metadata: {
          type: "sunshine_question_block",
          studentId: student.id,
          requestedByUserId: session.user.id,
        },
        automatic_payment_methods: { enabled: true },
      });
      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    }

    // reading_session: create PENDING_PAYMENT row first (idempotent: one per student per "purchase")
    const amountCents = SUNSHINE_READING_SESSION_PRICE_CENTS;
    const existing = await prisma.sunshineReadingSession.findFirst({
      where: {
        studentId: student.id,
        requestedByUserId: session.user.id,
        status: "PENDING_PAYMENT",
      },
      orderBy: { createdAt: "desc" },
    });

    let paymentIntentId: string;
    let clientSecret: string | null = null;

    if (existing?.stripePaymentIntentId) {
      const pi = await stripe.paymentIntents.retrieve(existing.stripePaymentIntentId);
      if (pi.status === "succeeded") {
        return NextResponse.json({ error: "Payment already completed" }, { status: 400 });
      }
      clientSecret = pi.client_secret;
      paymentIntentId = pi.id;
    } else {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: "aud",
        customer: parent.stripeCustomerId ?? undefined,
        metadata: {
          type: "sunshine_reading_session",
          studentId: student.id,
          requestedByUserId: session.user.id,
        },
        automatic_payment_methods: { enabled: true },
      });
      await prisma.sunshineReadingSession.create({
        data: {
          studentId: student.id,
          requestedByUserId: session.user.id,
          stripePaymentIntentId: paymentIntent.id,
          status: "PENDING_PAYMENT",
          amountCents,
        },
      });
      clientSecret = paymentIntent.client_secret;
      paymentIntentId = paymentIntent.id;
    }

    return NextResponse.json({
      clientSecret,
      paymentIntentId,
    });
  } catch (err) {
    console.error("Sunshine create-payment-intent error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment failed" },
      { status: 500 }
    );
  }
}
