"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Shift = {
  id: string;
  shiftId: string;
  status: string;
  shift: {
    startAt: Date | string;
    endAt: Date | string;
    subjectFocus: string[];
  };
};

export function RosterCard({ ts }: { ts: Shift }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "checkout" | null>(null);
  const now = new Date();
  const start = new Date(ts.shift.startAt as string | Date);
  const end = new Date(ts.shift.endAt as string | Date);
  const isDuringShift = now >= start && now <= end;
  const canCheckIn = ts.status === "ACCEPTED" && isDuringShift;
  const canCheckOut = ts.status === "CHECKED_IN";

  async function acceptShift() {
    setLoading("accept");
    try {
      const res = await fetch("/api/teacher/accept-shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shiftId: ts.shiftId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed");
      }
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  async function checkOut() {
    setLoading("checkout");
    try {
      const res = await fetch("/api/teacher/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shiftId: ts.shiftId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed");
      }
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div>
          <p className="font-medium">
            {start.toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })}
            {" – "}
            {end.toLocaleTimeString("en-AU", { timeStyle: "short" })}
          </p>
          <p className="text-sm text-muted-foreground">
            {ts.shift.subjectFocus.join(", ") || "All subjects"}
          </p>
        </div>
        <Badge variant={ts.status === "CHECKED_IN" ? "success" : "secondary"}>
          {ts.status.replace("_", " ")}
        </Badge>
        <div className="flex gap-2">
          {ts.status === "ASSIGNED" && (
            <Button size="sm" variant="outline" onClick={acceptShift} disabled={loading !== null}>
              {loading === "accept" ? "Accepting…" : "Accept shift"}
            </Button>
          )}
          {canCheckIn && (
            <Button size="sm" asChild>
              <Link href={`/teacher/shifts/check-in?shiftId=${ts.shiftId}`}>Check in</Link>
            </Button>
          )}
          {canCheckOut && (
            <Button size="sm" variant="destructive" onClick={checkOut} disabled={loading !== null}>
              {loading === "checkout" ? "Checking out…" : "Check out"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
