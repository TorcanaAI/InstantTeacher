"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function SunshineCheckoutForm({
  type,
  studentId,
  bookId,
}: { type: "question_block" | "reading_session"; studentId: string; bookId?: string | null }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    let returnUrl = `${window.location.origin}/parent/sunshine/checkout/success?type=${type}&studentId=${encodeURIComponent(studentId)}`;
    if (bookId) returnUrl += `&bookId=${encodeURIComponent(bookId)}`;
    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl, receipt_email: undefined },
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

function SunshineCheckoutContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") as "question_block" | "reading_session" | null;
  const studentId = searchParams.get("studentId");
  const bookId = searchParams.get("bookId");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!type || !studentId || (type !== "question_block" && type !== "reading_session")) {
      setErr("Invalid checkout. Need type=question_block or reading_session and studentId.");
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/stripe/sunshine/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, studentId }),
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
  }, [type, studentId]);

  if (err || !type || !studentId) {
    const isStripeConfig = err?.toLowerCase().includes("stripe") || err?.toLowerCase().includes("not configured") || err?.toLowerCase().includes("payments are not");
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Instant Sunshine checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-destructive">{err ?? "Missing type or student. Use the links from a subject portal (e.g. Buy 5 questions or Buy reading session)."}</p>
            {isStripeConfig && (
              <p className="text-sm text-muted-foreground">
                To enable payments, add <strong>STRIPE_SECRET_KEY</strong> and <strong>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</strong> in Vercel → Project → Settings → Environment Variables, then redeploy.
              </p>
            )}
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/parent/dashboard">Back to dashboard</Link>
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

  const label = type === "question_block" ? "5 questions ($5)" : "Reading session ($10)";
  const options = { clientSecret, appearance: { theme: "stripe" as const } };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Instant Sunshine — {label}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Pay once. No subscription. No audio stored.
          </p>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise} options={options}>
            <SunshineCheckoutForm type={type} studentId={studentId} bookId={bookId} />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SunshineCheckoutPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <SunshineCheckoutContent />
    </Suspense>
  );
}
