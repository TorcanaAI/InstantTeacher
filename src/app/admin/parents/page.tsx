"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function ParentsPage() {
  const [parents, setParents] = useState<ParentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/parents")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load parents");
        return r.json();
      })
      .then(setParents)
      .catch(() => {
        setError("Could not load parent registrations. You may need to sign in as admin.");
        setParents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
          ← Admin
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Parent Registrations</h1>
        <p className="mt-1 text-muted-foreground">
          Parents and their linked children (students). No payment data here.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button asChild className="mb-4">
        <a href="/api/admin/export-parents">Export CSV</a>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Parents</CardTitle>
          <CardDescription>All registered parents and their children.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : parents.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
              <p className="font-medium text-slate-700">No parent registrations yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Parents will appear here after they sign up and add their children.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {parents.map((p) => (
                <li key={p.id} className="rounded-lg border p-4">
                  <div className="font-semibold">{p.name}</div>
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
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
