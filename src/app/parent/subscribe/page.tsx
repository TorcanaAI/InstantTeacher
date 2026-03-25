"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function ParentSubscribePage() {
  const [loading, setLoading] = useState<"weekly" | "monthly" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trialCode, setTrialCode] = useState("");

  async function handleSubscribe(plan: "weekly" | "monthly") {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/stripe/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          trialCode: trialCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(null);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setLoading(null);
    } catch {
      setError("Something went wrong");
      setLoading(null);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-background px-4 py-8">
      <Card className="w-full max-w-md border-2 border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Unlimited homework help</CardTitle>
          <CardDescription>
            Subscribers get unlimited 15‑minute sessions with Sunshine or Jack. No per-session fee.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-4">
            <Label htmlFor="trialCode" className="text-foreground">
              Trial code (optional)
            </Label>
            <Input
              id="trialCode"
              value={trialCode}
              onChange={(e) => setTrialCode(e.target.value)}
              placeholder="Enter your one-week trial code"
              className="font-mono uppercase"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Club codes are shared: each code has a set number of uses. You can redeem a code once per account; the
              same card cannot be used twice with that code. Trial runs for <strong>7 days</strong> from checkout.
            </p>
          </div>
          <div className="grid gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-1 py-4"
              onClick={() => handleSubscribe("weekly")}
              disabled={!!loading}
            >
              <span className="font-semibold">$10/week</span>
              <span className="text-sm font-normal text-muted-foreground">Billed weekly</span>
              {loading === "weekly" && <Loader2 className="absolute right-4 h-4 w-4 animate-spin" />}
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-1 py-4"
              onClick={() => handleSubscribe("monthly")}
              disabled={!!loading}
            >
              <span className="font-semibold">$30/month</span>
              <span className="text-sm font-normal text-muted-foreground">Billed monthly</span>
              {loading === "monthly" && <Loader2 className="absolute right-4 h-4 w-4 animate-spin" />}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button asChild variant="ghost" className="w-full">
            <Link href="/parent/homework">Back to homework</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
