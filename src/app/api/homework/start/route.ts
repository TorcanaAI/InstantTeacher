import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import Stripe from "stripe";
import {
  HOMEWORK_SESSION_MINUTES,
  HOMEWORK_SESSION_PRICE_CENTS,
} from "@/lib/constants";

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

    const body = (await req.json()) as {
      studentId: string;
      assistantType: "SUNSHINE" | "JACK";
    };
    const { studentId, assistantType } = body;
    if (!studentId || !assistantType) {
      return NextResponse.json(
        { error: "studentId and assistantType required" },
        { status: 400 }
      );
    }
    if (assistantType !== "SUNSHINE" && assistantType !== "JACK") {
      return NextResponse.json({ error: "Invalid assistantType" }, { status: 400 });
    }

    const role = (session.user as { role?: Role }).role;
    const isAdmin = role === Role.ADMIN;

    const parent = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      include: { students: true },
    });
    if (!parent && !isAdmin) {
      return NextResponse.json({ error: "Parent profile not found" }, { status: 403 });
    }
    const student = parent?.students.find((s) => s.id === studentId);
    if (!student && !isAdmin) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    const requestedByUserId = session.user.id;

    const subscription = await prisma.subscription.findUnique({
      where: { userId: requestedByUserId },
    });
    const hasActiveSubscription =
      subscription?.status === "ACTIVE" &&
      subscription?.currentPeriodEnd &&
      new Date(subscription.currentPeriodEnd) > new Date();

    if (hasActiveSubscription) {
      const now = new Date();
      const endsAt = new Date(now.getTime() + HOMEWORK_SESSION_MINUTES * 60 * 1000);
      const homeworkSession = await prisma.homeworkSession.create({
        data: {
          studentId,
          requestedByUserId,
          assistantType,
          status: "ACTIVE",
          startedAt: now,
          endsAt,
          stripeSubscriptionId: subscription?.stripeSubscriptionId ?? null,
          pricePaidCents: 0,
        },
      });
      return NextResponse.json({
        session: {
          id: homeworkSession.id,
          status: homeworkSession.status,
          assistantType: homeworkSession.assistantType,
          startedAt: homeworkSession.startedAt,
          endsAt: homeworkSession.endsAt,
        },
        clientSecret: null,
      });
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: HOMEWORK_SESSION_PRICE_CENTS,
      currency: "aud",
      customer: parent?.stripeCustomerId ?? undefined,
      metadata: {
        type: "homework_session",
        studentId,
        requestedByUserId,
        assistantType,
      },
      automatic_payment_methods: { enabled: true },
    });

    const homeworkSession = await prisma.homeworkSession.create({
      data: {
        studentId,
        requestedByUserId,
        assistantType,
        status: "PENDING_PAYMENT",
        stripePaymentIntentId: paymentIntent.id,
        pricePaidCents: HOMEWORK_SESSION_PRICE_CENTS,
      },
    });

    return NextResponse.json({
      session: {
        id: homeworkSession.id,
        status: homeworkSession.status,
        assistantType: homeworkSession.assistantType,
        startedAt: null,
        endsAt: null,
      },
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("Homework start error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to start session" },
      { status: 500 }
    );
  }
}
