import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeaderPublic } from "@/components/SiteHeader";
import {
  HOMEWORK_SESSION_MINUTES,
  HOMEWORK_SESSION_PRICE_CENTS,
  SUBSCRIPTION_WEEKLY_PRICE_CENTS,
  SUBSCRIPTION_MONTHLY_PRICE_CENTS,
} from "@/lib/constants";

export default function PricingPage() {
  const sessionPrice = (HOMEWORK_SESSION_PRICE_CENTS / 100).toFixed(0);
  const weeklyPrice = (SUBSCRIPTION_WEEKLY_PRICE_CENTS / 100).toFixed(0);
  const monthlyPrice = (SUBSCRIPTION_MONTHLY_PRICE_CENTS / 100).toFixed(0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeaderPublic />
      <main className="flex-1 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Pricing</h1>
          <p className="mt-2 text-muted-foreground">
            Homework help, exam prep & school support with Sunshine and Jack. Pay per session or subscribe for unlimited help.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <Card className="rounded-2xl border-2 border-border transition hover:border-primary/30 hover:shadow-md">
              <CardHeader className="text-center">
                <CardTitle className="text-foreground">{HOMEWORK_SESSION_MINUTES} min session</CardTitle>
                <CardContent className="p-0 pt-2">
                  <p className="text-2xl font-bold text-primary">${sessionPrice}</p>
                  <p className="text-sm text-muted-foreground">One-off · Sunshine or Jack</p>
                </CardContent>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-center text-xs text-muted-foreground">Ask questions, upload homework photos, get step-by-step help.</p>
                <Button asChild className="w-full rounded-full">
                  <Link href="/signup">Get started</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-2 border-primary/40 bg-secondary/30">
              <CardHeader className="text-center">
                <CardTitle className="text-foreground">Weekly</CardTitle>
                <CardContent className="p-0 pt-2">
                  <p className="text-2xl font-bold text-primary">${weeklyPrice}/week</p>
                  <p className="text-sm text-muted-foreground">Unlimited sessions</p>
                </CardContent>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-center text-xs text-muted-foreground">Best for short-term exam prep or trying out.</p>
                <Button asChild className="w-full rounded-full">
                  <Link href="/signup">Subscribe</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-2 border-border transition hover:border-primary/30 hover:shadow-md">
              <CardHeader className="text-center">
                <CardTitle className="text-foreground">Monthly</CardTitle>
                <CardContent className="p-0 pt-2">
                  <p className="text-2xl font-bold text-primary">${monthlyPrice}/month</p>
                  <p className="text-sm text-muted-foreground">Unlimited sessions</p>
                </CardContent>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-center text-xs text-muted-foreground">Best value for ongoing homework & exam support.</p>
                <Button asChild className="w-full rounded-full">
                  <Link href="/signup">Subscribe</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
