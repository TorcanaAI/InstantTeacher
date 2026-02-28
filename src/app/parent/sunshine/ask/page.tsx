"use client";

import { Suspense, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sun, Volume2, Loader2 } from "lucide-react";

function SunshineAskContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const subject = searchParams.get("subject") ?? "Subject";
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  async function handleAsk() {
    const q = question.trim();
    if (!q) {
      setError("Type your question above.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/sunshine/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: studentId ?? undefined,
          subject,
          question: q,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Request failed (${res.status})`);
        setLoading(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
      }
    } catch {
      setError("Something went wrong. Check your connection.");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md border-amber-200 bg-amber-50/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sun className="h-6 w-6 text-amber-500" />
            <CardTitle>Ask Sunshine a Question</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            {subject} — Sunshine answers by audio (calm, supportive). No audio is stored.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Your question</Label>
            <Input
              id="question"
              placeholder="e.g. How do I find the area of a triangle?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
              className="rounded-xl border-2"
            />
          </div>
          {error && (
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
          )}
          <audio ref={audioRef} controls className="w-full" />
          <Button
            type="button"
            className="w-full bg-amber-500 hover:bg-amber-600"
            onClick={handleAsk}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sunshine is thinking…
              </>
            ) : (
              <>
                <Volume2 className="mr-2 h-4 w-4" />
                Ask Sunshine
              </>
            )}
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={studentId ? `/parent/help?subject=${encodeURIComponent(subject)}` : "/parent/dashboard"}>
              Back to subject
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SunshineAskPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <SunshineAskContent />
    </Suspense>
  );
}
