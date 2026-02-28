"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Sun } from "lucide-react";

const YEARS = [1, 2, 3, 4, 5] as const;

type BookItem = { id: string; title: string; yearLevel: number };

export function ReadingClient({
  books,
  studentId,
  initialBookId = null,
  isAdmin = false,
}: {
  books: BookItem[];
  studentId: string;
  initialBookId?: string | null;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"year" | "book" | "ready">("year");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When landing with bookId (e.g. after payment success), pre-select that book and show ready step
  useEffect(() => {
    if (!initialBookId || books.length === 0) return;
    const book = books.find((b) => b.id === initialBookId);
    if (book) {
      setSelectedYear(book.yearLevel);
      setSelectedBook(book);
      setStep("ready");
    }
  }, [initialBookId, books]);

  const booksForYear = selectedYear != null
    ? books.filter((b) => b.yearLevel === selectedYear)
    : [];

  async function handleStartReading() {
    if (!selectedBook) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sunshine/start-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, bookId: selectedBook.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not start session");
        setLoading(false);
        return;
      }
      const sessionId = data.sessionId;
      if (sessionId) {
        router.push(`/parent/sunshine/reading?sessionId=${sessionId}&studentId=${studentId}`);
        return;
      }
      setError("No session ID returned");
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Step 1: Year level */}
      {step === "year" && (
        <Card>
          <CardContent className="pt-6">
            <p className="mb-4 text-sm font-medium text-slate-600">Select your year level</p>
            <div className="flex flex-wrap gap-2">
              {YEARS.map((y) => (
                <Button
                  key={y}
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setSelectedYear(y);
                    setStep("book");
                  }}
                >
                  Year {y}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Book list */}
      {step === "book" && selectedYear != null && (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">Select your book</p>
              <Button variant="ghost" size="sm" onClick={() => { setStep("year"); setSelectedYear(null); setSelectedBook(null); }}>
                Change year
              </Button>
            </div>
            {booksForYear.length === 0 ? (
              <p className="text-muted-foreground">No books for Year {selectedYear} yet.</p>
            ) : (
              <ul className="space-y-2">
                {booksForYear.map((b) => (
                  <li key={b.id}>
                    <Button
                      variant={selectedBook?.id === b.id ? "secondary" : "outline"}
                      className="w-full justify-start text-left"
                      onClick={() => setSelectedBook(b)}
                    >
                      <BookOpen className="mr-2 h-4 w-4 shrink-0" />
                      {b.title}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {selectedBook && (
              <div className="mt-6">
                <Button
                  className="w-full"
                  onClick={() => {
                    if (isAdmin) {
                      setStep("ready");
                    } else {
                      // Redirect to Sunshine reading payment; after pay, success page links back to start reading with this book
                      router.push(
                        `/parent/sunshine/checkout?type=reading_session&studentId=${encodeURIComponent(studentId)}&bookId=${encodeURIComponent(selectedBook.id)}`
                      );
                    }
                  }}
                >
                  Continue with &quot;{selectedBook.title}&quot;
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Start Reading */}
      {step === "ready" && selectedBook && (
        <Card className="border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-700">
              <Sun className="h-6 w-6" />
              <span className="font-semibold">{selectedBook.title}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Ready to read with Sunshine. You can listen to the student read, encourage them, and answer comprehension questions at the end.
            </p>
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            <div className="mt-6 flex flex-col gap-2">
              <Button
                className="w-full"
                disabled={loading}
                onClick={handleStartReading}
              >
                {loading ? "Starting…" : "Start Reading with Sunshine"}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setStep("book")}>
                Choose a different book
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/parent/dashboard" className="underline hover:no-underline">Back to dashboard</Link>
      </p>
    </div>
  );
}
