import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function HowItWorksPage() {
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
        <div className="container mx-auto max-w-2xl px-4 py-16">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">How it works</h1>
          <p className="mt-2 text-slate-600">
            Get help in minutes. No subscription, no long-term commitment — for families across Australia.
          </p>
          <ol className="mt-12 space-y-8">
            <li className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--hero-teal))]/10 text-lg font-bold text-[hsl(var(--hero-teal))]">1</span>
              <div>
                <h2 className="font-semibold text-slate-900">Add your child</h2>
                <p className="text-slate-600">Create a parent account and add your student(s) with their school and year level.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--hero-teal))]/10 text-lg font-bold text-[hsl(var(--hero-teal))]">2</span>
              <div>
                <h2 className="font-semibold text-slate-900">Request help</h2>
                <p className="text-slate-600">Choose subject, duration (15, 30 or 60 min), and describe what you need. We match you with an available teacher.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--hero-teal))]/10 text-lg font-bold text-[hsl(var(--hero-teal))]">3</span>
              <div>
                <h2 className="font-semibold text-slate-900">Pay & join</h2>
                <p className="text-slate-600">Pay securely, then join the video session. Your child gets help right away.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--hero-teal))]/10 text-lg font-bold text-[hsl(var(--hero-teal))]">4</span>
              <div>
                <h2 className="font-semibold text-slate-900">Rate & done</h2>
                <p className="text-slate-600">After the session, rate the teacher. No recurring fees—book again whenever you need.</p>
              </div>
            </li>
          </ol>
          <Button className="mt-12 rounded-full bg-[hsl(var(--hero-teal))] px-8 hover:bg-[hsl(var(--hero-teal))]/90" size="lg" asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
