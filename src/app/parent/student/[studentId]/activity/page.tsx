import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BADGES } from "@/lib/constants";

export default async function ParentStudentActivityPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.PARENT) redirect("/login");

  const { studentId } = await params;

  const parent = await prisma.parentProfile.findUnique({
    where: { userId: session.user.id },
    include: { students: { include: { badges: { orderBy: { unlockedAt: "asc" } } } } },
  });
  if (!parent) redirect("/signup/parent");
  const student = parent.students.find((s) => s.id === studentId);
  if (!student) notFound();

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setUTCHours(0, 0, 0, 0);

  const [questionsThisWeek, subjectsRows] = await Promise.all([
    prisma.homeworkSessionMessage.count({
      where: {
        session: { studentId },
        role: "USER",
        createdAt: { gte: startOfWeek },
      },
    }),
    prisma.homeworkSession.findMany({
      where: { studentId, status: { in: ["ACTIVE", "ENDED"] }, subject: { not: null } },
      select: { subject: true },
      distinct: ["subject"],
    }),
  ]);
    const subjectsPracticed = Array.from(new Set(subjectsRows.map((s) => s.subject).filter((x): x is string => Boolean(x))));

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{student.fullName} — Activity</h1>
          <Button asChild variant="outline" size="sm">
            <Link href="/parent/homework">Back to homework</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">This week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold">Questions asked: {questionsThisWeek}</p>
            <p className="text-muted-foreground">Learning streak: {student.streakCurrent} day{student.streakCurrent !== 1 ? "s" : ""}</p>
            <p className="text-muted-foreground">
              Subjects practiced: {subjectsPracticed.length ? subjectsPracticed.join(", ") : "None yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Badges earned ({student.badges.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {student.badges.length === 0 ? (
              <p className="text-sm text-muted-foreground">No badges yet. Ask questions and keep your streak to unlock them!</p>
            ) : (
              <ul className="space-y-2">
                {student.badges.map((b) => {
                  const def = BADGES.find((x) => x.id === b.badgeId);
                  return (
                    <li key={b.id} className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
                      <span>{def?.emoji ?? "🏅"}</span>
                      <span className="font-medium">{def?.name ?? b.badgeId}</span>
                      <span className="text-xs text-muted-foreground">{def?.description}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Button asChild>
          <Link href={`/parent/homework/start?studentId=${encodeURIComponent(student.id)}`}>
            Start new session
          </Link>
        </Button>
      </div>
    </div>
  );
}
