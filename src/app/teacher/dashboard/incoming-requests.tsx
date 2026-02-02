"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MATCH_TIMEOUT_SECONDS } from "@/lib/constants";

type RequestItem = {
  id: string;
  subject: string;
  yearLevel: number;
  durationMinutes: number;
  studentPrompt: string | null;
  studentName: string;
  requestedAt: string;
};

export default function IncomingRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [countdowns, setCountdowns] = useState<Record<string, number>>({});
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/teacher/incoming-requests");
        const data = await res.json();
        if (res.ok && Array.isArray(data.requests)) {
          setRequests(data.requests);
          setCountdowns((prev) => {
            const next = { ...prev };
            data.requests.forEach((r: RequestItem) => {
              const elapsed = (Date.now() - new Date(r.requestedAt).getTime()) / 1000;
              const left = Math.max(0, MATCH_TIMEOUT_SECONDS - Math.floor(elapsed));
              next[r.id] = left;
            });
            return next;
          });
        }
      } catch {
        // ignore
      }
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdowns((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach((id) => {
          if (next[id] > 0) {
            next[id] = next[id] - 1;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  async function accept(sessionId: string) {
    setAccepting(sessionId);
    try {
      const res = await fetch("/api/teacher/accept-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      router.push(`/session/${sessionId}`);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to accept");
    } finally {
      setAccepting(null);
    }
  }

  const visible = requests.filter((r) => (countdowns[r.id] ?? 0) > 0);

  if (visible.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">Incoming requests</h2>
      <p className="text-sm text-muted-foreground mt-1">Accept within 30 seconds to take the session.</p>
      <div className="mt-4 space-y-2">
        {visible.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium">{r.subject} · Year {r.yearLevel} · {r.durationMinutes} min</p>
                <p className="text-sm text-muted-foreground">{r.studentName}{r.studentPrompt ? ` · ${r.studentPrompt.slice(0, 60)}${r.studentPrompt.length > 60 ? "…" : ""}` : ""}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono tabular-nums text-amber-600">{countdowns[r.id] ?? 0}s</span>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => accept(r.id)}
                  disabled={accepting !== null}
                >
                  {accepting === r.id ? "Accepting…" : "Accept"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
