"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function CheckInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const shiftId = searchParams.get("shiftId");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckIn() {
    if (!shiftId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/teacher/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shiftId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to check in");
        setLoading(false);
        return;
      }
      router.push("/teacher/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  }

  if (!shiftId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Missing shift</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Check in to shift</CardTitle>
          <p className="text-sm text-muted-foreground">
            You&apos;ll appear as available for matching once checked in.
          </p>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
          <Button className="w-full" onClick={handleCheckIn} disabled={loading}>
            {loading ? "Checking in…" : "Check in now"}
          </Button>
          <Button variant="outline" className="mt-4 w-full" onClick={() => router.push("/teacher/dashboard")}>
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TeacherCheckInPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <CheckInContent />
    </Suspense>
  );
}
