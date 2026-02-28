"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ sessionId }: { sessionId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/parent/checkout/success?sessionId=${sessionId}`,
        receipt_email: undefined,
      },
    });
    if (submitError) {
      setError(submitError.message ?? "Payment failed");
      setLoading(false);
      return;
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={!stripe || loading}>
        {loading ? "Processing…" : "Pay now"}
      </Button>
    </form>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [allowsIncrementalCharges, setAllowsIncrementalCharges] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setErr("Missing session");
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, allowsIncrementalCharges }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErr(data.error ?? "Failed to start payment");
          return;
        }
        setClientSecret(data.clientSecret);
      } catch {
        setErr("Something went wrong");
      }
    })();
  }, [sessionId, allowsIncrementalCharges]);

  if (!sessionId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Missing session. Go back to dashboard.</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{err}</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/parent/dashboard")}>
              Back to dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading checkout…</p>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: { theme: "stripe" as const },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete payment</CardTitle>
          <p className="text-sm text-muted-foreground">
            You&apos;ll join the session right after payment.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={allowsIncrementalCharges}
                onChange={(e) => setAllowsIncrementalCharges(e.target.checked)}
                className="mt-0.5"
              />
              <div className="text-sm">
                <p className="font-medium text-slate-900">Allow session extensions</p>
                <p className="mt-1 text-slate-600">
                  If your teacher needs more time, they can extend the session (up to 60 minutes total) and your saved payment method will be charged automatically. You&apos;ll receive an email notification for each extension.
                </p>
              </div>
            </label>
          </div>
          {clientSecret && (
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm sessionId={sessionId} />
            </Elements>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
