import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SessionEndPage({
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

  if (!isParent && !isTeacher && !isStudent) redirect("/dashboard");

  if (t.status === "IN_PROGRESS" || t.status === "TEACHER_JOINED") {
    await prisma.tutoringSession.update({
      where: { id: sessionId },
      data: { status: "ENDED", endedAt: new Date() },
    });
  }

  const isParentOrStudent = isParent || isStudent;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Session ended</CardTitle>
          <CardContent className="p-0 pt-2 text-muted-foreground">
            Thanks for using InstantTeacher.
          </CardContent>
        </CardHeader>
        <CardContent className="space-y-4">
          {isParentOrStudent && (
            <Button asChild>
              <Link href={`/session/${sessionId}/rate`}>Rate this session</Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={isTeacher ? "/teacher/dashboard" : "/parent/dashboard"}>
              Back to dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
