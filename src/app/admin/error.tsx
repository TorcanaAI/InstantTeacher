"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
    console.error("Admin error digest:", error.digest);
    console.error("Admin error stack:", error.stack);
  }, [error]);

  const isDev = typeof window !== "undefined" && process.env.NODE_ENV === "development";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4">
      <h1 className="text-xl font-semibold text-slate-900">Admin error</h1>
      <p className="max-w-md text-center text-sm text-slate-600">
        Something went wrong loading this page. Check that DATABASE_URL and AUTH_SECRET are set
        correctly in Vercel, and that the database is reachable.
      </p>
      <p className="text-xs text-slate-500">
        Digest: {error.digest ?? "—"} (check server logs for exact stack trace)
      </p>
      {isDev && error.message && (
        <pre className="max-h-32 overflow-auto rounded bg-slate-200 p-2 text-xs">
          {error.message}
        </pre>
      )}
      {isDev && error.stack && (
        <pre className="max-h-48 overflow-auto rounded bg-slate-200 p-2 text-xs">
          {error.stack}
        </pre>
      )}
      <div className="flex gap-3">
        <Button onClick={reset} variant="default">
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/auth/login">Admin login</Link>
        </Button>
      </div>
    </div>
  );
}
