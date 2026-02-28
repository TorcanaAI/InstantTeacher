import Link from "next/link";
import { SUBJECTS, YEAR_LEVELS } from "@/lib/constants";
import StudyFlowClient from "../study-flow-client";

export default async function HelpStudyPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject: querySubject } = await searchParams;
  const subjectFromQuery =
    querySubject && SUBJECTS.includes(querySubject as (typeof SUBJECTS)[number])
      ? (querySubject as (typeof SUBJECTS)[number])
      : null;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="container mx-auto">
        <Link href="/" className="text-sm text-slate-600 underline hover:text-[hsl(var(--hero-teal))]">
          ← Home
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Homework, projects or study</h1>
        <p className="mt-1 text-slate-600">
          Choose your year group and subject — we&apos;ll match you with a qualified teacher.
        </p>
        <div className="mt-8">
          <StudyFlowClient
            defaultSubject={subjectFromQuery}
            yearOptions={[...YEAR_LEVELS]}
          />
        </div>
      </div>
    </div>
  );
}
