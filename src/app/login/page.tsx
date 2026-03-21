import { Suspense } from "react";
import LoginPageHeader from "./LoginPageHeader";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LoginPageHeader />
      <main className="flex-1 bg-gradient-to-b from-primary/5 to-background">
        <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
