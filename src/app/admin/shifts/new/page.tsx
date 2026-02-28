"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminNewShiftPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const startAt = formData.get("startAt") as string;
    const endAt = formData.get("endAt") as string;
    const requiredTeacherCount = parseInt(formData.get("requiredTeacherCount") as string, 10);
    const subjectFocus = (formData.get("subjectFocus") as string)?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

    try {
      const res = await fetch("/api/admin/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startAt: new Date(startAt).toISOString(),
          endAt: new Date(endAt).toISOString(),
          requiredTeacherCount,
          subjectFocus,
          yearFocus: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create shift");
        setLoading(false);
        return;
      }
      router.push("/admin/shifts");
      router.refresh();
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Create shift</CardTitle>
          <p className="text-sm text-muted-foreground">Add a roster block for teachers to check in.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startAt">Start (local)</Label>
              <Input id="startAt" name="startAt" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endAt">End (local)</Label>
              <Input id="endAt" name="endAt" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requiredTeacherCount">Min teachers</Label>
              <Input id="requiredTeacherCount" name="requiredTeacherCount" type="number" min={1} defaultValue={1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subjectFocus">Subjects (comma-separated)</Label>
              <Input id="subjectFocus" name="subjectFocus" placeholder="English, Mathematics, HASS, Science" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating…" : "Create shift"}
            </Button>
          </form>
          <Button variant="outline" className="mt-4 w-full" asChild>
            <Link href="/admin/shifts">Cancel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
