import { Suspense } from "react";
import SignupFlow from "./SignupFlow";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-slate-500">Loading…</div>}>
      <SignupFlow />
    </Suspense>
  );
}
