"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import Stripe from "stripe";
import { PLATFORM_FEE_PERCENT } from "@/lib/constants";
import { updateDailyRoomExpiration } from "@/lib/daily";
import { sendExtensionEmail } from "@/lib/email";

const MAX_TOTAL_EXTENSION_MINUTES = 60;
const EXTENSION_DURATIONS = [10, 15, 30] as const;
const EXTENSION_RATE_PER_MINUTE = 200; // $2 per minute (200 cents)

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key);
}

/**
 * Calculate extension price based on minutes.
 * Uses $2/minute rate (200 cents/minute).
 */
function calculateExtensionPrice(minutes: number): { priceCents: number; platformFee: number; teacherPayout: number } {
  const priceCents = minutes * EXTENSION_RATE_PER_MINUTE;
  const platformFee = Math.round((priceCents * PLATFORM_FEE_PERCENT) / 100);
  const teacherPayout = priceCents - platformFee;
  return { priceCents, platformFee, teacherPayout };
}

/**
 * Extend a tutoring session with automatic Stripe charge.
 * Only works if:
 * - Teacher is authenticated and owns the session
 * - Session is IN_PROGRESS
 * - Parent consented to incremental charges
 * - Total extensions haven't exceeded MAX_TOTAL_EXTENSION_MINUTES
 * - Session has ≤5 minutes remaining
 */
export async function extendSession(sessionId: string, extensionMinutes: number) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.TEACHER) {
    return { error: "Unauthorized. Only teachers can extend sessions." };
  }

  if (!EXTENSION_DURATIONS.includes(extensionMinutes as (typeof EXTENSION_DURATIONS)[number])) {
    return { error: `Invalid extension duration. Must be one of: ${EXTENSION_DURATIONS.join(", ")} minutes.` };
  }

  // Fetch session with related data
  const t = await prisma.tutoringSession.findFirst({
    where: { id: sessionId, teacherId: session.user.id },
    include: {
      requestedBy: { include: { parentProfile: true } },
      student: true,
      extensions: { where: { status: "SUCCEEDED" } },
    },
  });

  if (!t) {
    return { error: "Session not found or you are not the assigned teacher." };
  }

  // Validate session status
  if (t.status !== "IN_PROGRESS") {
    return { error: "Session must be in progress to extend." };
  }

  // Check parent consent
  if (!t.allowsIncrementalCharges) {
    return {
      error:
        "This session cannot be extended. The parent did not consent to incremental charges at booking time.",
    };
  }

  // Check if payment method is saved
  if (!t.stripePaymentMethodId) {
    return {
      error: "No saved payment method found. Cannot process automatic charge.",
    };
  }

  // Check total extensions cap
  const totalExtended = t.extensions.reduce((sum, ext) => sum + ext.extensionMinutes, 0);
  if (totalExtended + extensionMinutes > MAX_TOTAL_EXTENSION_MINUTES) {
    return {
      error: `Cannot extend by ${extensionMinutes} minutes. Maximum total extensions (${MAX_TOTAL_EXTENSION_MINUTES} minutes) would be exceeded.`,
    };
  }

  // Check if session has ≤5 minutes remaining
  if (!t.startedAt) {
    return { error: "Session has not started yet." };
  }
  const originalEndTime = new Date(t.startedAt.getTime() + t.durationMinutes * 60 * 1000 + totalExtended * 60 * 1000);
  const now = new Date();
  const minutesRemaining = (originalEndTime.getTime() - now.getTime()) / (1000 * 60);
  if (minutesRemaining > 5) {
    return {
      error: `Session can only be extended when ≤5 minutes remain. Currently ${Math.ceil(minutesRemaining)} minutes remaining.`,
    };
  }

  // Get parent's Stripe customer ID
  const parent = t.requestedBy.parentProfile;
  if (!parent?.stripeCustomerId) {
    return { error: "Parent's Stripe customer not found." };
  }

  // Calculate pricing
  const { priceCents, platformFee, teacherPayout } = calculateExtensionPrice(extensionMinutes);

  // Create Stripe PaymentIntent with saved payment method (off_session = true)
  const stripe = getStripe();
  let paymentIntent: Stripe.PaymentIntent;

  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: priceCents,
      currency: "aud",
      customer: parent.stripeCustomerId,
      payment_method: t.stripePaymentMethodId,
      off_session: true,
      confirm: true,
      metadata: {
        tutoringSessionId: t.id,
        extensionMinutes: String(extensionMinutes),
        type: "extension",
      },
    });
  } catch (err) {
    if (err && typeof err === "object" && "type" in err && err.type === "card_error") {
      const stripeError = err as Stripe.errors.StripeCardError;
      return {
        error: `Payment failed: ${stripeError.message ?? "Card declined"}. Session was not extended.`,
      };
    }
    console.error("Stripe extension payment error:", err);
    return {
      error: "Payment processing failed. Please try again or contact support.",
    };
  }

  // If payment succeeded, update session and create extension record
  if (paymentIntent.status === "succeeded") {
    try {
      // Calculate new end time
      const newEndTime = new Date(originalEndTime.getTime() + extensionMinutes * 60 * 1000);

      // Update session in transaction
      await prisma.$transaction(async (tx) => {
        // Create extension record
        await tx.sessionExtension.create({
          data: {
            sessionId: t.id,
            extensionMinutes,
            priceCents,
            platformFee,
            teacherPayout,
            stripePaymentIntentId: paymentIntent.id,
            status: "SUCCEEDED",
          },
        });

        // Update session: extend end time and increment totalExtendedMinutes
        await tx.tutoringSession.update({
          where: { id: sessionId },
          data: {
            endedAt: newEndTime,
            totalExtendedMinutes: totalExtended + extensionMinutes,
          },
        });
      });

      // Update Daily room expiration
      if (t.dailyRoomName) {
        try {
          await updateDailyRoomExpiration(t.dailyRoomName, newEndTime);
        } catch (dailyErr) {
          console.error("Failed to update Daily room expiration:", dailyErr);
          // Don't fail the extension if Daily update fails
        }
      }

      // Send email notification to parent
      if (t.requestedBy.email && t.requestedBy.parentProfile) {
        try {
          await sendExtensionEmail({
            parentEmail: t.requestedBy.email,
            parentName: t.requestedBy.parentProfile.fullName,
            studentName: t.student.fullName,
            sessionId: t.id,
            extensionMinutes,
            priceCents,
            newEndTime,
          });
        } catch (emailErr) {
          console.error("Failed to send extension email:", emailErr);
          // Don't fail the extension if email fails
        }
      }

      return {
        success: true,
        extensionMinutes,
        newEndTime: newEndTime.toISOString(),
        priceCents,
      };
    } catch (dbErr) {
      console.error("Database error during extension:", dbErr);
      // Payment succeeded but DB update failed - this is a critical error
      // In production, you'd want to log this and potentially refund
      return {
        error: "Extension was charged but failed to update session. Please contact support with payment ID: " + paymentIntent.id,
      };
    }
  } else {
    return {
      error: `Payment status: ${paymentIntent.status}. Session was not extended.`,
    };
  }
}
