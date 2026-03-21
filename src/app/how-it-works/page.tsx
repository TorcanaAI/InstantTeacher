import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeaderPublic } from "@/components/SiteHeader";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeaderPublic />
      <main className="flex-1 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-2xl px-4 py-16">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">How it works</h1>
          <p className="mt-2 text-muted-foreground">
            Homework help, exam prep and school support with Sunshine and Jack. Simple and safe for families.
          </p>
          <ol className="mt-12 space-y-8">
            <li className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">1</span>
              <div>
                <h2 className="font-semibold text-foreground">Sign up & add your child</h2>
                <p className="text-muted-foreground">Create an account and add your student(s) with their school and year level.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">2</span>
              <div>
                <h2 className="font-semibold text-foreground">Choose Sunshine or Jack</h2>
                <p className="text-muted-foreground">Start a 15‑minute session. Pay $7 once or subscribe for unlimited sessions. Your child picks who they want to work with.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">3</span>
              <div>
                <h2 className="font-semibold text-foreground">Ask questions & get help</h2>
                <p className="text-muted-foreground">Type a question or upload a photo of homework. Get step-by-step explanations. Build learning streaks and unlock badges.</p>
              </div>
            </li>
          </ol>
          <Button className="mt-12 rounded-full px-8" size="lg" asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
