import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import HelpRequestForm from "./help-request-form";
import { SESSION_DURATIONS, HELP_TYPES, SUBJECTS, YEAR_LEVELS } from "@/lib/constants";

export default async function ParentHelpPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.PARENT) redirect("/login");

  const { studentId: queryStudentId } = await searchParams;
  const parent = await prisma.parentProfile.findUnique({
    where: { userId: session.user.id },
    include: { students: true },
  });
  if (!parent) redirect("/signup/parent");

  const students = parent.students;
  if (students.length === 0) redirect("/parent/students/new");

  const selectedStudentId = queryStudentId ?? students[0].id;
  const selectedStudent = students.find((s) => s.id === selectedStudentId) ?? students[0];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold">Find a teacher now</h1>
        <p className="mt-1 text-muted-foreground">
          Choose subject, duration and describe what you need. We&apos;ll match you with an available teacher.
        </p>
        <HelpRequestForm
          students={students}
          selectedStudentId={selectedStudent.id}
          durations={SESSION_DURATIONS}
          helpTypes={HELP_TYPES}
          subjects={SUBJECTS}
          yearLevels={YEAR_LEVELS}
          defaultYearLevel={selectedStudent.schoolYear}
        />
      </div>
    </div>
  );
}
