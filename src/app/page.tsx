import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeaderPublic } from "@/components/SiteHeader";
import { Clock, MessageCircle } from "lucide-react";
import {
  SUNSHINE_AVATAR_URL,
  SUNSHINE_INTRODUCTION,
  JACK_AVATAR_URL,
  JACK_INTRODUCTION,
} from "@/lib/constants";
import SubjectSection from "./subject-section";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeaderPublic />

      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-primary">
            Homework help · Exam prep · School support
          </p>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Instant Teacher – Smart Support, Anytime.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Step-by-step homework help, practice questions and exam prep. Choose Sunshine or Jack, ask anything, upload a photo — get help in minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="min-w-[200px] rounded-full px-8 text-base" asChild>
              <Link href={session ? "/parent/dashboard" : "/signup"}>
                Get started
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="min-w-[180px] rounded-full border-2" asChild>
              <Link href="/how-it-works">How it works</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2 text-foreground/90">
              <MessageCircle className="h-5 w-5 text-primary" />
              Chat with Sunshine or Jack
            </span>
            <span className="flex items-center gap-2 text-foreground/90">
              <Clock className="h-5 w-5 text-primary" />
              Help in minutes
            </span>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/20 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
            Meet Sunshine & Jack
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground">
            Your friendly homework helpers. Pick who you’d like to work with when you start a session.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 md:max-w-4xl md:mx-auto">
            <div className="flex flex-col items-center rounded-2xl border-2 border-border bg-card p-8 text-center shadow-sm">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-primary/30">
                <Image src={SUNSHINE_AVATAR_URL} alt="Sunshine" fill className="object-cover" sizes="96px" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Sunshine</h3>
              <p className="mt-2 text-sm text-muted-foreground">{SUNSHINE_INTRODUCTION}</p>
            </div>
            <div className="flex flex-col items-center rounded-2xl border-2 border-border bg-card p-8 text-center shadow-sm">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-primary/30">
                <Image src={JACK_AVATAR_URL} alt="Jack" fill className="object-cover" sizes="96px" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Jack</h3>
              <p className="mt-2 text-sm text-muted-foreground">{JACK_INTRODUCTION}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
            Homework, NAPLAN & ATAR support
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
            All subjects. Upload a photo, ask a question, or practice for exams.
          </p>
          <SubjectSection />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
            How it works
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
            Simple, safe and available when you need it.
          </p>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <Card className="border-2 border-border text-center transition hover:border-primary/30 hover:shadow-md">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  1
                </div>
                <CardTitle className="text-lg">Sign up & add your child</CardTitle>
                <CardDescription>
                  Create an account and add your student. Choose a 15‑minute session or subscribe for unlimited help.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 border-border text-center transition hover:border-primary/30 hover:shadow-md">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  2
                </div>
                <CardTitle className="text-lg">Choose Sunshine or Jack</CardTitle>
                <CardDescription>
                  Sunshine is warm and encouraging; Jack is confident and motivating. Your child picks who they want to work with.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 border-border text-center transition hover:border-primary/30 hover:shadow-md">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  3
                </div>
                <CardTitle className="text-lg">Ask questions & get help</CardTitle>
                <CardDescription>
                  Type a question or upload a photo of homework. Get step-by-step explanations, practice for exams, and build learning streaks.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          <div className="mt-10 text-center">
            <Button size="lg" className="rounded-full" asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
