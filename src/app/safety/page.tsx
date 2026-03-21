import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeaderPublic } from "@/components/SiteHeader";
import { Shield } from "lucide-react";

export default function SafetyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeaderPublic />
      <main className="flex-1 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-2xl px-4 py-16">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">Safety & WWCC</h1>
              <p className="mt-1 text-muted-foreground">
                We take safety seriously, especially for minors.
              </p>
            </div>
          </div>
          <ul className="mt-10 list-inside list-disc space-y-3 text-muted-foreground">
            <li>All teachers must have a valid Working With Children Check (WWCC) before they can accept sessions.</li>
            <li>Conflict-of-interest: teachers cannot tutor students from their own school.</li>
            <li>Communication happens only inside the session—no direct messaging outside.</li>
            <li>Report button is always available during sessions.</li>
            <li>We do not share personal contact details between students and teachers.</li>
          </ul>
          <Button className="mt-12 rounded-full px-8" size="lg" asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
