import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import HelpRequestForm from "./help-request-form";
import SunshineSection from "@/components/SunshineSection";
import { SESSION_DURATIONS, HELP_TYPES, SUBJECTS } from "@/lib/constants";
import { NAPLAN_YEARS, ATAR_YEARS } from "@/lib/constants";
import type { SectionType } from "@/lib/constants";

function isValidSection(s: string): s is SectionType {
  return s === "NAPLAN" || s === "ATAR";
}

function isValidYearForSection(section: SectionType, year: number): boolean {
  if (section === "NAPLAN") return (NAPLAN_YEARS as readonly number[]).includes(year);
  return (ATAR_YEARS as readonly number[]).includes(year);
}

export default async function ParentHelpPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string; section?: string; yearLevel?: string; subject?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const { section: querySection, yearLevel: queryYearLevel, subject: querySubject } = params;

  // New flow: section + yearLevel + subject required from URL (from /help/naplan or /help/atar).
  const hasFlowParams = querySection && queryYearLevel && querySubject;
  if (hasFlowParams) {
    if (!session?.user || session.user.role !== Role.PARENT) {
      const callbackUrl = `/parent/help?section=${encodeURIComponent(querySection)}&yearLevel=${encodeURIComponent(queryYearLevel)}&subject=${encodeURIComponent(querySubject)}`;
      redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    if (!isValidSection(querySection)) redirect("/");
    const yearLevel = parseInt(queryYearLevel, 10);
    if (!Number.isFinite(yearLevel) || !isValidYearForSection(querySection, yearLevel)) redirect("/");
    if (!SUBJECTS.includes(querySubject as (typeof SUBJECTS)[number])) redirect("/");

    const parent = await prisma.parentProfile.findUnique({
      where: { userId: session!.user!.id },
      include: { students: true },
    });
    if (!parent) redirect("/signup/parent");
    const students = parent.students;
    if (students.length === 0) redirect("/parent/students/new");

    const selectedStudentId = params.studentId ?? students[0].id;
    const selectedStudent = students.find((s) => s.id === selectedStudentId) ?? students[0];

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-lg">
          <h1 className="text-2xl font-bold">Complete your request</h1>
          <p className="mt-1 text-muted-foreground">
            You chose {querySection} · Year {yearLevel} · {querySubject}. Select student, help type and duration.
          </p>
          <div className="mt-6 space-y-6">
            <SunshineSection
              students={students.map((s) => ({ id: s.id, fullName: s.fullName, schoolYear: s.schoolYear }))}
              selectedStudentId={selectedStudent.id}
              subject={querySubject as (typeof SUBJECTS)[number]}
              yearLevel={yearLevel}
            />
            <HelpRequestForm
              students={students}
              selectedStudentId={selectedStudent.id}
              section={querySection as SectionType}
              yearLevel={yearLevel}
              subject={querySubject}
              preFilledFromFlow
              durations={SESSION_DURATIONS}
              helpTypes={HELP_TYPES}
              subjects={SUBJECTS}
              defaultYearLevel={selectedStudent.schoolYear}
            />
          </div>
        </div>
      </div>
    );
  }

  // No flow params: must come from home tiles. Redirect to home.
  if (!session?.user || session.user.role !== Role.PARENT) redirect("/login");
  redirect("/");
}
