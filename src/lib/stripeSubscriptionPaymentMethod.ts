import Stripe from "stripe";

/**
 * Best-effort: resolve Stripe payment method id (pm_…) for a subscription after checkout.
 */
export async function getSubscriptionPaymentMethodId(
  stripe: Stripe,
  subscriptionId: string
): Promise<string | null> {
  const sub = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method", "latest_invoice.payment_intent.payment_method"],
  });

  const dm = sub.default_payment_method;
  if (typeof dm === "string" && dm.startsWith("pm_")) return dm;
  if (dm && typeof dm === "object" && "id" in dm) {
    const id = (dm as Stripe.PaymentMethod).id;
    if (typeof id === "string" && id.startsWith("pm_")) return id;
  }

  const inv = sub.latest_invoice;
  if (inv && typeof inv === "object") {
    // Stripe SDK typings omit `payment_intent` on some Invoice variants; runtime includes it when expanded.
    const pi = (inv as Stripe.Invoice & { payment_intent?: string | Stripe.PaymentIntent | null })
      .payment_intent;
    if (pi && typeof pi === "object" && "payment_method" in pi) {
      const pm = (pi as Stripe.PaymentIntent).payment_method;
      if (typeof pm === "string" && pm.startsWith("pm_")) return pm;
      if (pm && typeof pm === "object" && "id" in pm) {
        const id = (pm as Stripe.PaymentMethod).id;
        if (typeof id === "string" && id.startsWith("pm_")) return id;
      }
    }
  }

  return null;
}
