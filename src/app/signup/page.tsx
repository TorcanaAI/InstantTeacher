import { Suspense } from "react";
import { SiteHeaderPublic } from "@/components/SiteHeader";
import SignupFlow from "./SignupFlow";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeaderPublic />
      <main className="flex-1 bg-gradient-to-b from-primary/5 to-background">
        <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">Loading…</div>}>
          <SignupFlow />
        </Suspense>
      </main>
    </div>
  );
}
