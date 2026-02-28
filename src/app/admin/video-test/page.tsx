"use client";

import { useState } from "react";
import Link from "next/link";
import { createTestVideoSession } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VideoTestPage() {
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setLoading(true);
    setError(null);
    setRoomUrl(null);
    try {
      const res = await createTestVideoSession();
      setRoomUrl(res.roomUrl);
    } catch {
      setError("Failed to create video session. Check server logs.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
          ← Admin
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Video Test</h1>
        <p className="mt-1 text-muted-foreground">
          Create a Daily room (server-only). No DB, no Stripe. Room URL is for joining only.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create test session</CardTitle>
          <CardDescription>Uses Daily API on the server. Restart dev server after changing env.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating…" : "Create Test Video Session"}
          </Button>

          {error && (
            <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {roomUrl && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="font-medium text-green-800">Room created</p>
              <a
                href={roomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-primary underline hover:no-underline"
              >
                Join Video Room
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
