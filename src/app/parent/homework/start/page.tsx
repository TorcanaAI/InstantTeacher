"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { SUNSHINE_AVATAR_URL, SUNSHINE_INTRODUCTION, JACK_AVATAR_URL, JACK_INTRODUCTION } from "@/lib/constants";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentForm({
  sessionId,
}: {
  clientSecret: string;
  sessionId: string;
  onSuccess: () => void;
}) {
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
        return_url: `${window.location.origin}/parent/homework/session/${sessionId}?payment=done`,
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
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Pay $7 for 15 minutes
      </Button>
    </form>
  );
}

function StartContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const studentId = searchParams.get("studentId");
  const [assistant, setAssistant] = useState<"SUNSHINE" | "JACK">("SUNSHINE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  async function handleStart() {
    if (!studentId) {
      setError("Missing student");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/homework/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, assistantType: assistant }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to start");
        setLoading(false);
        return;
      }
      setSessionId(data.session.id);
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        router.push(`/parent/homework/session/${data.session.id}`);
        return;
      }
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  }

  if (clientSecret && sessionId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Complete payment</CardTitle>
            <CardDescription>
            $7 for one 15‑minute session.{" "}
            <Link href="/parent/subscribe" className="underline">Subscribe</Link> for unlimited sessions.
          </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                clientSecret={clientSecret}
                sessionId={sessionId}
                onSuccess={() => router.push(`/parent/homework/session/${sessionId}`)}
              />
            </Elements>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md border-teal-100">
        <CardHeader>
          <CardTitle>Start homework session</CardTitle>
          <CardDescription>Choose Sunshine or Jack. Session lasts 15 minutes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!studentId && (
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              Missing student. <Link href="/parent/homework" className="underline">Back to homework</Link>
            </p>
          )}
          <div className="space-y-2">
            <p className="text-sm font-medium">Who’s helping today?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAssistant("SUNSHINE")}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                  assistant === "SUNSHINE" ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-amber-200 bg-amber-50">
                  <Image
                    src={SUNSHINE_AVATAR_URL}
                    alt="Sunshine"
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <span className="font-medium">Sunshine</span>
                <p className="text-center text-xs text-muted-foreground">{SUNSHINE_INTRODUCTION}</p>
              </button>
              <button
                type="button"
                onClick={() => setAssistant("JACK")}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                  assistant === "JACK" ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-blue-200 bg-blue-50">
                  <Image
                    src={JACK_AVATAR_URL}
                    alt="Jack"
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <span className="font-medium">Jack</span>
                <p className="text-center text-xs text-muted-foreground">{JACK_INTRODUCTION}</p>
              </button>
            </div>
          </div>
          {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/parent/homework">Back</Link>
            </Button>
            <Button onClick={handleStart} disabled={loading || !studentId}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Start session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ParentHomeworkStartPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <StartContent />
    </Suspense>
  );
}
