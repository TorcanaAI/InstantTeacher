"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
      <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        A server error occurred. This is often due to a missing or incorrect environment variable
        (e.g. DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL) in production.
      </p>
      <p className="text-xs text-muted-foreground">
        Digest: {error.digest ?? "—"} (check server logs for details)
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="default">
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
