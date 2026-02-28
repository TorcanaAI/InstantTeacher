"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBJECTS } from "@/lib/constants";
import type { SectionType } from "@/lib/constants";
import { BookOpen } from "lucide-react";

type Subject = (typeof SUBJECTS)[number];

const NAPLAN_YEARS = [3, 5, 7, 9];

function getSectionFromYear(year: number): SectionType {
  return NAPLAN_YEARS.includes(year) ? "NAPLAN" : "ATAR";
}

interface Props {
  defaultSubject: Subject | null;
  yearOptions: readonly number[];
}

export default function StudyFlowClient({ defaultSubject, yearOptions }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [yearLevel, setYearLevel] = useState<number | null>(null);
  const [subject, setSubject] = useState<Subject | null>(defaultSubject);

  const canProceedFromStep1 = yearLevel !== null;
  const canProceedFromStep2 = subject !== null;

  function handleContinue() {
    if (step === 1 && canProceedFromStep1) {
      setStep(2);
      return;
    }
    if (step === 2 && canProceedFromStep2 && yearLevel !== null) {
      const section = getSectionFromYear(yearLevel);
      const params = new URLSearchParams({
        section,
        yearLevel: String(yearLevel),
        subject: subject!,
      });
      router.push(`/parent/help?${params.toString()}`);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>What year group do you need help with?</CardTitle>
          <CardDescription>
            {step === 1
              ? "Select the year group you need help with."
              : "Select a subject."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Year group required</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {yearOptions.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYearLevel(y)}
                    className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
                      yearLevel === y
                        ? "border-[hsl(var(--hero-teal))] bg-[hsl(var(--hero-teal))]/10 text-[hsl(var(--hero-teal))]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    Year {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Subject</p>
              <div className="grid grid-cols-2 gap-3">
                {SUBJECTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSubject(s)}
                    className={`group flex flex-col items-center rounded-2xl border-2 p-4 text-center transition ${
                      subject === s
                        ? "border-[hsl(var(--hero-teal))] bg-[hsl(var(--hero-teal))]/10"
                        : "border-slate-200 bg-white hover:border-[hsl(var(--hero-teal))] hover:shadow-md"
                    }`}
                  >
                    <BookOpen className="h-8 w-8 text-[hsl(var(--hero-teal))]" />
                    <span className="mt-2 block font-medium text-slate-800">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {step === 2 && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
            )}
            <Button
              type="button"
              className="w-full bg-[hsl(var(--hero-teal))] hover:bg-[hsl(var(--hero-teal))]/90"
              disabled={step === 1 ? !canProceedFromStep1 : !canProceedFromStep2}
              onClick={handleContinue}
            >
              {step === 1 ? "Next" : "Find teacher"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-sm text-slate-600">
        <Link href="/" className="underline hover:text-[hsl(var(--hero-teal))]">
          Back to home
        </Link>
      </p>
    </div>
  );
}
