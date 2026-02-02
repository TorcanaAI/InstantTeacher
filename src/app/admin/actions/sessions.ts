"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key);
}

const REFUNDABLE_STATUSES = [
  "PAID",
  "MATCHED",
  "ROOM_CREATED",
  "STUDENT_WAITING",
  "TEACHER_JOINED",
  "IN_PROGRESS",
  "ENDED",
] as const;

export async function refundSession(sessionId: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { error: "Unauthorized" };
  }

  const t = await prisma.tutoringSession.findUnique({
    where: { id: sessionId },
  });
  if (!t) return { error: "Session not found" };
  if (!t.stripePaymentIntentId) return { error: "No payment to refund" };
  if (t.stripeRefundId) return { error: "Already refunded" };
  if (!REFUNDABLE_STATUSES.includes(t.status as (typeof REFUNDABLE_STATUSES)[number])) {
    return { error: "Session cannot be refunded" };
  }

  try {
    const stripe = getStripe();
    const refund = await stripe.refunds.create({
      payment_intent: t.stripePaymentIntentId,
      reason: "requested_by_customer",
    });

    await prisma.tutoringSession.update({
      where: { id: sessionId },
      data: { stripeRefundId: refund.id, status: "REFUNDED" },
    });
    return {};
  } catch (err) {
    console.error("Stripe refund error:", err);
    return {
      error: err instanceof Error ? err.message : "Refund failed",
    };
  }
}
