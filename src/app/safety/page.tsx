import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-teal-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-[hsl(var(--hero-teal))]">
            InstantTeacher
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-[hsl(var(--hero-teal))]">Home</Link>
            <Button asChild size="sm" className="rounded-full bg-[hsl(var(--hero-teal))] hover:bg-[hsl(var(--hero-teal))]/90">
              <Link href="/signup">Get help now</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="relative overflow-hidden bg-gradient-to-b from-[hsl(173,58%,96%)] to-white">
        <div className="container mx-auto max-w-2xl px-4 py-16">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--hero-teal))]/10">
              <Shield className="h-6 w-6 text-[hsl(var(--hero-teal))]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Safety & WWCC</h1>
              <p className="mt-1 text-slate-600">
                We take safety seriously, especially for minors.
              </p>
            </div>
          </div>
          <ul className="mt-10 list-inside list-disc space-y-3 text-slate-600">
            <li>All teachers must have a valid Working With Children Check (WWCC) before they can accept sessions.</li>
            <li>Conflict-of-interest: teachers cannot tutor students from their own school.</li>
            <li>Communication happens only inside the session—no direct messaging outside.</li>
            <li>Report button is always available during sessions.</li>
            <li>We do not share personal contact details between students and teachers.</li>
          </ul>
          <Button className="mt-12 rounded-full bg-[hsl(var(--hero-teal))] px-8 hover:bg-[hsl(var(--hero-teal))]/90" size="lg" asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
