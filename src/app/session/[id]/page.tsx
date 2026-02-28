import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
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
      <div className="flex items-center justify-end gap-2 border-b border-slate-700 bg-slate-800 px-4 py-2">
        <Button asChild size="sm" variant="secondary">
          <Link href={`/session/${sessionId}/video?role=${role}`}>Join video call</Link>
        </Button>
      </div>
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
