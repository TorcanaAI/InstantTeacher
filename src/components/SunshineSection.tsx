"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, BookOpen, MessageCircle } from "lucide-react";
import { SUBJECTS, SUNSHINE_READING_YEARS, SUNSHINE_DESCRIPTION } from "@/lib/constants";

type Subject = (typeof SUBJECTS)[number];

interface Student {
  id: string;
  fullName: string;
  schoolYear: number;
}

interface SunshineSectionProps {
  students: Student[];
  selectedStudentId: string;
  subject: Subject;
  yearLevel: number;
}

interface Balance {
  questionsRemaining: number;
  hasPaidReadingSession: boolean;
  readingSessionId: string | null;
}

export default function SunshineSection({
  students,
  selectedStudentId,
  subject,
  yearLevel,
}: SunshineSectionProps) {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const isReadingEligible =
    subject === "English" &&
    (SUNSHINE_READING_YEARS as readonly number[]).includes(yearLevel);

  useEffect(() => {
    if (!selectedStudentId) {
      setBalance(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/sunshine/balance?studentId=${encodeURIComponent(selectedStudentId)}`);
        if (!res.ok) {
          if (!cancelled) setBalance({ questionsRemaining: 0, hasPaidReadingSession: false, readingSessionId: null });
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setBalance({
            questionsRemaining: data.questionsRemaining ?? 0,
            hasPaidReadingSession: !!data.hasPaidReadingSession,
            readingSessionId: data.readingSessionId ?? null,
          });
        }
      } catch {
        if (!cancelled) setBalance({ questionsRemaining: 0, hasPaidReadingSession: false, readingSessionId: null });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedStudentId]);

  const questionsRemaining = balance?.questionsRemaining ?? 0;
  const hasReading = balance?.hasPaidReadingSession ?? false;

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50/80 to-orange-50/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Sun className="h-6 w-6 text-amber-500" />
          <CardTitle className="text-lg">Instant Sunshine</CardTitle>
        </div>
        <CardDescription>{SUNSHINE_DESCRIPTION}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-amber-300 bg-white hover:bg-amber-50"
              >
                {questionsRemaining > 0 ? (
                  <Link
                    href={`/parent/sunshine/ask?studentId=${selectedStudentId}&subject=${encodeURIComponent(subject)}`}
                  >
                    <MessageCircle className="mr-1.5 h-4 w-4" />
                    Ask Sunshine a Question
                  </Link>
                ) : (
                  <Link href={`/parent/sunshine/checkout?type=question_block&studentId=${selectedStudentId}`}>
                    Buy 5 questions ($5)
                  </Link>
                )}
              </Button>
              {questionsRemaining > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  {questionsRemaining} left
                </span>
              )}
            </div>

            {isReadingEligible && (
              <div className="flex flex-wrap gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-amber-300 bg-white hover:bg-amber-50"
                >
                  <Link href={`/reading?studentId=${selectedStudentId}`}>
                    <BookOpen className="mr-1.5 h-4 w-4" />
                    Explore Reading with Sunshine
                  </Link>
                </Button>
                {!hasReading && (
                  <Button asChild variant="outline" size="sm" className="border-amber-300 bg-white hover:bg-amber-50">
                    <Link href={`/parent/sunshine/checkout?type=reading_session&studentId=${selectedStudentId}`}>
                      Buy reading session ($10)
                    </Link>
                  </Button>
                )}
              </div>
            )}

            {selectedStudent && (
              <p className="text-xs text-slate-500">
                For {selectedStudent.fullName} (Year {yearLevel})
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
