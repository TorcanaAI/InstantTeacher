"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BookOpen, Sun, Loader2 } from "lucide-react";

type Student = { id: string; fullName: string };
type Book = { id: string; title: string; yearLevel: number };

export default function SunshineReadingTestClient({
  students,
  books,
}: {
  students: Student[];
  books: Book[];
}) {
  const [studentId, setStudentId] = useState("");
  const [bookId, setBookId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStartTest() {
    if (!studentId.trim()) {
      setError("Select a student.");
      return;
    }
    if (!bookId.trim()) {
      setError("Select a book.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/sunshine/start-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ studentId: studentId.trim(), bookId: bookId.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not start session");
        setLoading(false);
        return;
      }
      const sessionId = data.sessionId;
      if (sessionId) {
        // Full page navigation so the reading page gets sessionId/studentId in the URL on first load (avoids router.push + useSearchParams timing issues)
        const url = `/parent/sunshine/reading?sessionId=${encodeURIComponent(sessionId)}&studentId=${encodeURIComponent(studentId.trim())}`;
        window.location.href = url;
        return;
      }
      setError("No session ID returned");
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  }

  const booksByYear = books.reduce<Record<number, Book[]>>((acc, b) => {
    if (!acc[b.yearLevel]) acc[b.yearLevel] = [];
    acc[b.yearLevel].push(b);
    return acc;
  }, {});

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="student">Student</Label>
            <select
              id="student"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">Choose a student…</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                </option>
              ))}
            </select>
            {students.length === 0 && (
              <p className="mt-1 text-sm text-amber-600">No students in the system. Add one via Parents or signup.</p>
            )}
          </div>

          <div>
            <Label>Book</Label>
            <div className="mt-2 max-h-64 space-y-2 overflow-y-auto rounded border border-input bg-muted/30 p-3">
              {Object.keys(booksByYear)
                .sort((a, b) => Number(a) - Number(b))
                .map((year) => (
                  <div key={year}>
                    <p className="text-xs font-medium text-muted-foreground">Year {year}</p>
                    <ul className="mt-1 space-y-1">
                      {booksByYear[Number(year)].map((b) => (
                        <li key={b.id}>
                          <label className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-muted/50">
                            <input
                              type="radio"
                              name="book"
                              value={b.id}
                              checked={bookId === b.id}
                              onChange={() => setBookId(b.id)}
                              className="h-4 w-4"
                            />
                            <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="text-sm">{b.title}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
            {books.length === 0 && (
              <p className="mt-1 text-sm text-amber-600">No books in the library. Add books in Admin → Books.</p>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="button"
            className="w-full"
            disabled={loading || !studentId || !bookId}
            onClick={handleStartTest}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting…
              </>
            ) : (
              <>
                <Sun className="mr-2 h-4 w-4" />
                Start test reading session
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
