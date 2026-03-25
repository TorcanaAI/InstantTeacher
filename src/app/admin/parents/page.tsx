"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Child = { id: string; name: string; yearLevel: number };
type ParentRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  children: Child[];
};

function loadParents(): Promise<ParentRow[]> {
  return fetch("/api/admin/parents").then((r) => {
    if (!r.ok) throw new Error("Failed to load parents");
    return r.json();
  });
}

export default function ParentsPage() {
  const [parents, setParents] = useState<ParentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    loadParents()
      .then(setParents)
      .catch(() => {
        setError("Could not load parent registrations. You may need to sign in as admin.");
        setParents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(p: ParentRow) {
    const ok = window.confirm(
      `Delete parent "${p.name}" (${p.email}) and all linked student profiles? This cannot be undone.`
    );
    if (!ok) return;

    setDeletingId(p.id);
    setError(null);
    try {
      const r = await fetch(`/api/admin/parents/${encodeURIComponent(p.id)}`, { method: "DELETE" });
      const data = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) {
        throw new Error(data.error ?? "Delete failed");
      }
      setParents((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete parent.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Parent registrations</h1>
        <p className="mt-1 text-muted-foreground">
          Parents and their linked children (students).
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button asChild className="mb-4 rounded-full">
        <a href="/api/admin/export-parents">Export CSV</a>
      </Button>

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Parents</CardTitle>
          <CardDescription>All registered parents and their children.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : parents.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-8 text-center">
              <p className="font-medium text-foreground">No parent registrations yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Parents will appear here after they sign up and add their children.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {parents.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-3 rounded-xl border-2 border-border bg-card p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground">{p.name}</div>
                    <div className="text-sm text-muted-foreground">Email: {p.email}</div>
                    <div className="text-sm text-muted-foreground">Phone: {p.phone ?? "—"}</div>
                    <div className="mt-2">
                      <strong className="text-sm">Children:</strong>
                      <ul className="ml-6 list-disc text-sm">
                        {p.children.length === 0 ? (
                          <li className="text-muted-foreground">None</li>
                        ) : (
                          p.children.map((c) => (
                            <li key={c.id}>
                              {c.name} — Year {c.yearLevel}
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={deletingId !== null}
                    onClick={() => handleDelete(p)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deletingId === p.id ? "Deleting…" : "Delete"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
