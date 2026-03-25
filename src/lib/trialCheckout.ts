import { prisma } from "@/lib/prisma";

export const TRIAL_CODE_ERRORS = {
  INVALID: "Invalid code",
  LIMIT: "This code has reached its limit",
  ACCOUNT: "This code has already been used on this account",
  PAYMENT_METHOD: "This code has already been used with this payment method",
} as const;

export type TrialCheckoutValidation =
  | { ok: true; coupon: { id: string; expiryDays: number } }
  | { ok: false; message: string };

/**
 * Validates a trial code before Stripe Checkout (account + global cap).
 * Payment-method uniqueness is enforced in the webhook after the card is known.
 */
export async function validateTrialForCheckout(
  userId: string,
  normalizedCode: string
): Promise<TrialCheckoutValidation> {
  const coupon = await prisma.trialCoupon.findUnique({
    where: { code: normalizedCode },
  });
  if (!coupon) {
    return { ok: false, message: TRIAL_CODE_ERRORS.INVALID };
  }
  // Legacy single-use rows (pre–redemption table)
  if (coupon.usedAt) {
    return { ok: false, message: TRIAL_CODE_ERRORS.INVALID };
  }
  if (coupon.usedCount >= coupon.maxUses) {
    return { ok: false, message: TRIAL_CODE_ERRORS.LIMIT };
  }
  const existing = await prisma.trialCodeRedemption.findUnique({
    where: {
      trialCouponId_userId: { trialCouponId: coupon.id, userId },
    },
  });
  if (existing) {
    return { ok: false, message: TRIAL_CODE_ERRORS.ACCOUNT };
  }
  return { ok: true, coupon: { id: coupon.id, expiryDays: coupon.expiryDays } };
}
