import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getSubscriptionPaymentMethodId } from "@/lib/stripeSubscriptionPaymentMethod";
import { TRIAL_CODE_ERRORS } from "@/lib/trialCheckout";

/**
 * After Stripe confirms a subscription with a trial code, record redemption (1/account, 1/card, global cap).
 * Idempotent on stripeSubscriptionId. Cancels subscription if validation fails.
 */
export async function processTrialAfterSubscriptionCreated(
  stripe: Stripe,
  subscription: Stripe.Subscription,
  userId: string,
  trialCouponId: string
): Promise<void> {
  const subscriptionId = subscription.id;

  const existing = await prisma.trialCodeRedemption.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });
  if (existing) return;

  const pmId = await getSubscriptionPaymentMethodId(stripe, subscriptionId);
  if (!pmId) {
    await stripe.subscriptions.cancel(subscriptionId);
    console.error(
      `[trial] No payment method for subscription ${subscriptionId}; subscription cancelled.`
    );
    return;
  }

  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end * 1000)
    : new Date();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        SELECT 1 FROM "TrialCoupon" WHERE id = ${trialCouponId} FOR UPDATE
      `;

      const c = await tx.trialCoupon.findUnique({ where: { id: trialCouponId } });
      if (!c) {
        throw new Error("NO_COUPON");
      }
      if (c.usedCount >= c.maxUses) {
        throw new Error("LIMIT");
      }

      const dupUser = await tx.trialCodeRedemption.findUnique({
        where: {
          trialCouponId_userId: { trialCouponId, userId },
        },
      });
      if (dupUser) {
        throw new Error("DUP_USER");
      }

      const dupPm = await tx.trialCodeRedemption.findUnique({
        where: {
          trialCouponId_paymentMethodId: { trialCouponId, paymentMethodId: pmId },
        },
      });
      if (dupPm) {
        throw new Error("DUP_PM");
      }

      await tx.trialCoupon.update({
        where: { id: trialCouponId },
        data: { usedCount: { increment: 1 } },
      });

      await tx.trialCodeRedemption.create({
        data: {
          trialCouponId,
          userId,
          paymentMethodId: pmId,
          trialEndDate: trialEnd,
          stripeSubscriptionId: subscriptionId,
        },
      });
    });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    const userMessage =
      err === "DUP_PM"
        ? TRIAL_CODE_ERRORS.PAYMENT_METHOD
        : err === "DUP_USER"
          ? TRIAL_CODE_ERRORS.ACCOUNT
          : err === "LIMIT"
            ? TRIAL_CODE_ERRORS.LIMIT
            : err === "NO_COUPON"
              ? TRIAL_CODE_ERRORS.INVALID
              : err;
    await stripe.subscriptions.cancel(subscriptionId);
    console.error(
      `[trial] Redemption failed (${userMessage}); subscription ${subscriptionId} cancelled.`,
      e
    );
  }
}
