import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SessionRoom from "./session-room";

export default async function SessionRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id: sessionId } = await params;
  const t = await prisma.tutoringSession.findFirst({
    where: { id: sessionId },
    include: { student: true, teacher: true },
  });

  if (!t) notFound();

  const isParent = t.requestedByUserId === session.user.id;
  const isTeacher = t.teacherId === session.user.id;
  const isStudent = t.student.userId === session.user.id;

  if (!isParent && !isTeacher && !isStudent) {
    redirect("/dashboard");
  }

  // If no teacher assigned yet, only parent/student can join (to wait); teacher cannot
  if (!t.teacherId && isTeacher) {
    redirect("/teacher/dashboard");
  }

  const role = isTeacher ? "teacher" : "student";
  const teacherName = t.teacher?.name ?? "Teacher";

  return (
    <div className="min-h-screen bg-slate-900">
      <SessionRoom
        sessionId={sessionId}
        role={role}
        durationMinutes={t.durationMinutes}
        studentName={t.student.fullName}
        teacherName={teacherName}
        waitingForTeacher={!t.teacherId}
      />
    </div>
  );
}
