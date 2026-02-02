"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function RateSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/session/${sessionId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, feedbackText: feedback }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to submit");
        setLoading(false);
        return;
      }
      toast.success("Thanks for your feedback!");
      router.push("/parent/dashboard");
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Rate this session</CardTitle>
          <p className="text-sm text-muted-foreground">
            Your feedback helps us and the teacher.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Rating (1–5)</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`h-10 w-10 rounded-full border-2 text-sm font-medium ${
                      rating === n
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback (optional)</Label>
              <Input
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="How did it go?"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || rating === 0}>
              Submit
            </Button>
          </form>
          <p className="mt-4 text-center">
            <Link href="/parent/dashboard" className="text-sm text-muted-foreground underline">
              Skip and go to dashboard
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
