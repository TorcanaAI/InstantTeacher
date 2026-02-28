import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SESSION_DURATIONS } from "@/lib/constants";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-teal-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-[hsl(var(--hero-teal))]">
            InstantTeacher
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-[hsl(var(--hero-teal))]">Home</Link>
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-[hsl(var(--hero-teal))]">Sign in</Link>
            <Link href="/auth/login" className="text-sm font-medium text-slate-500 hover:text-slate-700">Admin</Link>
            <Button asChild size="sm" className="rounded-full bg-[hsl(var(--hero-teal))] hover:bg-[hsl(var(--hero-teal))]/90">
              <Link href="/signup">Get help now</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="relative overflow-hidden bg-gradient-to-b from-[hsl(173,58%,96%)] to-white">
        <div className="container mx-auto max-w-3xl px-4 py-16">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Pricing</h1>
          <p className="mt-2 text-slate-600">
            Pay per session. No subscription. No lock-in.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {SESSION_DURATIONS.map((d) => (
              <Card key={d.minutes} className="rounded-2xl border-2 border-slate-100 transition hover:border-[hsl(var(--hero-teal))]/30">
                <CardHeader className="text-center">
                  <CardTitle className="text-slate-900">{d.label}</CardTitle>
                  <CardContent className="p-0 pt-2">
                    <p className="text-2xl font-bold text-[hsl(var(--hero-teal))]">{d.priceLabel}</p>
                    <p className="text-sm text-slate-600">One-off</p>
                  </CardContent>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full rounded-full bg-[hsl(var(--hero-teal))] hover:bg-[hsl(var(--hero-teal))]/90">
                    <Link href="/signup">Book now</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
