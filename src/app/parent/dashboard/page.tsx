import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SignOutButton from "@/components/SignOutButton";

export default async function ParentDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.PARENT) redirect("/login");

  type UserWithParent = Awaited<
    ReturnType<
      typeof prisma.user.findUnique<{
        where: { id: string };
        include: { parentProfile: { include: { students: true } } };
      }>
    >
  >;
  type RecentSessions = Awaited<
    ReturnType<
      typeof prisma.tutoringSession.findMany<{
        include: { student: true; teacher: { select: { name: true } } };
      }>
    >
  >;
  let user: UserWithParent = null;
  let recentSessions: RecentSessions = [];
  let dataError: string | null = null;

  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        parentProfile: {
          include: { students: true },
        },
      },
    });
    if (!user?.parentProfile) redirect("/signup/parent");

    recentSessions = await prisma.tutoringSession.findMany({
      where: { requestedByUserId: session.user.id },
      orderBy: { requestedAt: "desc" },
      take: 5,
      include: {
        student: true,
        teacher: { select: { name: true } },
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    dataError = message;
    console.error("[Parent dashboard] Prisma error:", err);
  }

  if (dataError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4">
        <h1 className="text-xl font-semibold text-slate-900">Could not load dashboard</h1>
        <p className="max-w-md text-center text-sm text-slate-600">
          A database error occurred. In production, check Vercel → Project → Settings → Environment Variables:
          <strong> DATABASE_URL</strong>, <strong>AUTH_SECRET</strong>, and <strong>NEXTAUTH_URL</strong> (e.g.{" "}
          <code className="rounded bg-slate-200 px-1">https://instant-teacher.vercel.app</code>).
        </p>
        <p className="text-xs text-slate-500">Error: {dataError}</p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/parent/dashboard">Try again</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!user?.parentProfile) redirect("/signup/parent");
  const { parentProfile } = user;
  const students = parentProfile.students;

  const canJoin = (status: string) =>
    ["PAID", "MATCHED", "ROOM_CREATED", "STUDENT_WAITING", "TEACHER_JOINED", "IN_PROGRESS"].includes(status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(173,58%,96%)] to-white">
      <header className="border-b border-teal-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/parent/dashboard" className="text-lg font-bold text-[hsl(var(--hero-teal))]">
            InstantTeacher
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/parent/sessions" className="text-sm text-slate-600 hover:text-slate-900">
              Session history
            </Link>
            <SignOutButton variant="ghost" size="sm" callbackUrl="/" />
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Hi, {parentProfile.fullName}</h1>
        <p className="text-muted-foreground">Get instant help for your child.</p>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your students</h2>
            <Button asChild>
              <Link href="/parent/students/new">Add student</Link>
            </Button>
          </div>
          {students.length === 0 ? (
            <Card className="mt-4">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No students yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/parent/students/new">Add your first student</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {students.map((s) => (
                <Card key={s.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{s.fullName}</CardTitle>
                    <CardDescription>
                      Year {s.schoolYear} · {s.schoolName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild size="sm" className="w-full">
                      <Link href="/">
                        Find teacher now
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {recentSessions.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold">Recent sessions</h2>
            <div className="mt-4 space-y-2">
              {recentSessions.map((s) => (
                <Card key={s.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-medium">{s.student.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.subject} · {s.durationMinutes} min · {s.teacher?.name ?? (s.teacherId ? "Teacher" : "Waiting for teacher")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={s.status === "ENDED" ? "secondary" : "default"}>
                        {s.status.replace("_", " ")}
                      </Badge>
                      {canJoin(s.status) && (
                        <>
                          <Button size="sm" asChild>
                            <Link href={`/session/${s.id}`}>Join</Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/session/${s.id}/video?role=student`}>Join video call</Link>
                          </Button>
                        </>
                      )}
                      {s.status === "ENDED" && !s.rating && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/session/${s.id}/rate`}>Rate</Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/parent/sessions">View all</Link>
            </Button>
          </section>
        )}
      </main>
    </div>
  );
}
