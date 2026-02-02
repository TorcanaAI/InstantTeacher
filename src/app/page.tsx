import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBJECTS } from "@/lib/constants";
import { BookOpen, Shield, Clock, Star } from "lucide-react";
import SubjectSection from "./subject-section";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-teal-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-[hsl(var(--hero-teal))]">
              InstantTeacher
            </span>
            <Image src="/eucalyptus.svg" alt="" width={24} height={24} className="h-6 w-6 text-[hsl(var(--hero-teal))]" aria-hidden />
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-slate-600 transition hover:text-[hsl(var(--hero-teal))]"
            >
              How it works
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-slate-600 transition hover:text-[hsl(var(--hero-teal))]"
            >
              Pricing
            </Link>
            <Link
              href="/safety"
              className="text-sm font-medium text-slate-600 transition hover:text-[hsl(var(--hero-teal))]"
            >
              Safety
            </Link>
            <Link
              href="/teachers"
              className="text-sm font-medium text-slate-600 transition hover:text-[hsl(var(--hero-teal))]"
            >
              For teachers
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            {session ? (
              <Button asChild size="sm" className="rounded-full bg-[hsl(var(--hero-teal))] hover:bg-[hsl(var(--hero-teal))]/90">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" className="rounded-full bg-[hsl(var(--hero-teal))] hover:bg-[hsl(var(--hero-teal))]/90" asChild>
                  <Link href="/signup">Get help now</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero — Australia's instant tutoring */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[hsl(173,58%,96%)] to-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-[hsl(var(--hero-teal))]">
            Qualified educators here when you need them
          </p>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Australia&apos;s go-to for{" "}
            <span className="text-[hsl(var(--hero-teal))]">instant tutoring</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Homework SOS and exam help in minutes. No subscription, no lock-in — just real help from real teachers across Australia.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="min-w-[200px] rounded-full bg-[hsl(var(--hero-teal))] px-8 text-base hover:bg-[hsl(var(--hero-teal))]/90"
              asChild
            >
              <Link href={session ? "/parent/dashboard" : "/signup"}>
                Find a teacher now
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="min-w-[180px] rounded-full border-2" asChild>
              <Link href="/how-it-works">How it works</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-[hsl(var(--hero-amber))] text-[hsl(var(--hero-amber))]" />
              Rated by families
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-[hsl(var(--hero-teal))]" />
              WWCC verified
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-[hsl(var(--hero-teal))]" />
              Help in minutes
            </span>
          </div>
        </div>
      </section>

      {/* Get help with — subject cards with modal */}
      <section className="border-t border-slate-100 bg-slate-50/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900 md:text-3xl">
            Get help with
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-600">
            Choose a subject — we&apos;ll match you with a qualified teacher in minutes.
          </p>
          <SubjectSection subjects={[...SUBJECTS]} isLoggedIn={!!session} />
        </div>
      </section>

      {/* How it works — 3 steps like InstantScripts */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900 md:text-3xl">
            How it works
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-600">
            Fast, simple, and safe — for parents and kids alike.
          </p>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <Card className="border-2 border-slate-100 text-center transition hover:border-[hsl(var(--hero-teal))]/30">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--hero-teal))]/10 text-xl font-bold text-[hsl(var(--hero-teal))]">
                  1
                </div>
                <CardTitle className="text-lg">Tell us what you need</CardTitle>
                <CardDescription>
                  Pick your child, subject, and how long you need. Add a quick note or photo of the worksheet.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 border-slate-100 text-center transition hover:border-[hsl(var(--hero-teal))]/30">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--hero-teal))]/10 text-xl font-bold text-[hsl(var(--hero-teal))]">
                  2
                </div>
                <CardTitle className="text-lg">We find a teacher</CardTitle>
                <CardDescription>
                  Our matching finds a qualified, available teacher. You pay securely — then join the video room.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 border-slate-100 text-center transition hover:border-[hsl(var(--hero-teal))]/30">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--hero-teal))]/10 text-xl font-bold text-[hsl(var(--hero-teal))]">
                  3
                </div>
                <CardTitle className="text-lg">Help in minutes</CardTitle>
                <CardDescription>
                  Your child and the teacher meet in a safe video session. When it&apos;s done, you can rate the session.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          <div className="mt-10 text-center">
            <Button size="lg" className="rounded-full bg-[hsl(var(--hero-teal))] hover:bg-[hsl(var(--hero-teal))]/90" asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-t border-slate-100 bg-[hsl(var(--hero-teal))] py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            <span className="flex items-center gap-2 font-medium">
              <Shield className="h-5 w-5" /> Safe for kids
            </span>
            <span className="flex items-center gap-2 font-medium">
              <BookOpen className="h-5 w-5" /> Qualified educators
            </span>
            <span className="flex items-center gap-2 font-medium">
              Pay per session — no subscription
            </span>
            <span className="flex items-center gap-2 font-medium">
              Australia
            </span>
          </div>
        </div>
      </section>

      {/* Footer — InstantScripts-style */}
      <footer className="border-t bg-slate-50 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <Link href="/" className="font-bold text-[hsl(var(--hero-teal))]">
              InstantTeacher
            </Link>
            <nav className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/how-it-works" className="text-slate-600 hover:text-slate-900">
                How it works
              </Link>
              <Link href="/pricing" className="text-slate-600 hover:text-slate-900">
                Pricing
              </Link>
              <Link href="/safety" className="text-slate-600 hover:text-slate-900">
                Safety
              </Link>
              <Link href="/teachers" className="text-slate-600 hover:text-slate-900">
                For teachers
              </Link>
              <Link href="/login" className="text-slate-600 hover:text-slate-900">
                Log in
              </Link>
            </nav>
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} InstantTeacher. Australia. Safe, simple tutoring when you need it.
          </p>
        </div>
      </footer>
    </div>
  );
}
