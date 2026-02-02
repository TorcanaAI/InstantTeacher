import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import IncomingRequests from "./incoming-requests";
import { RosterCard } from "./roster-card";

export default async function TeacherDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.TEACHER) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      teacherProfile: {
        include: {
          shifts: {
            where: { shift: { startAt: { gte: new Date() } } },
            include: { shift: true },
            orderBy: { shift: { startAt: "asc" } },
            take: 20,
          },
        },
      },
      sessionsAsTeacher: {
        where: {
          status: { in: ["MATCHED", "ROOM_CREATED", "STUDENT_WAITING", "TEACHER_JOINED", "IN_PROGRESS"] },
        },
        include: { student: true },
        take: 5,
      },
    },
  });

  if (!user?.teacherProfile) redirect("/signup/teacher");

  const profile = user.teacherProfile;
  const upcomingShifts = user.teacherProfile.shifts;
  const activeSessions = user.sessionsAsTeacher;

  const now = new Date();
  const checkedInShift = upcomingShifts.find(
    (ts) => ts.status === "CHECKED_IN" && new Date(ts.shift.startAt) <= now && new Date(ts.shift.endAt) >= now
  );
  const acceptedShiftDuringWindow = upcomingShifts.find(
    (ts) => ts.status === "ACCEPTED" && new Date(ts.shift.startAt) <= now && new Date(ts.shift.endAt) >= now
  );
  const teacherStatus = activeSessions.length > 0 ? "IN_SESSION" : checkedInShift ? "ON_SHIFT" : "OFFLINE";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/teacher/dashboard" className="font-semibold">
            InstantTeacher
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/teacher/registration" className="text-sm text-slate-600 hover:text-slate-900">
              My registration
            </Link>
            <Link href="/teacher/shifts" className="text-sm text-slate-600 hover:text-slate-900">
              My shifts
            </Link>
            <form action="/api/auth/signout" method="POST">
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Hi, {profile.fullName}</h1>
            <p className="text-muted-foreground">
              {profile.ratingAvg != null ? `Rating: ${profile.ratingAvg.toFixed(1)} · ` : ""}
              {profile.totalSessions} sessions
              {profile.applicationStatus !== "APPROVED" && (
                <> · <Link href="/teacher/registration" className="text-[hsl(var(--hero-teal))] underline">Check registration status</Link></>
              )}
            </p>
          </div>
          <Badge
            variant={teacherStatus === "ON_SHIFT" ? "success" : teacherStatus === "IN_SESSION" ? "default" : "secondary"}
            className="text-sm"
          >
            {teacherStatus === "OFFLINE" ? "OFFLINE" : teacherStatus === "ON_SHIFT" ? "ON SHIFT" : "IN SESSION"}
          </Badge>
        </div>
        {acceptedShiftDuringWindow && !checkedInShift && (
          <div className="mt-4">
            <Button asChild size="sm" className="rounded-full bg-[hsl(var(--hero-teal))] hover:bg-[hsl(var(--hero-teal))]/90">
              <Link href={`/teacher/shifts/check-in?shiftId=${acceptedShiftDuringWindow.shiftId}`}>Go online</Link>
            </Button>
          </div>
        )}

        <IncomingRequests />

        {activeSessions.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Session queue</h2>
            <div className="mt-4 space-y-2">
              {activeSessions.map((s) => (
                <Card key={s.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{s.student.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.subject} · Year {s.yearLevel} · {s.durationMinutes} min
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/session/${s.id}`}>Join</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-semibold">My roster</h2>
          <p className="text-sm text-muted-foreground mt-1">Accept shift, check in during your window, and check out when done. You only receive requests when checked in.</p>
          {upcomingShifts.length === 0 ? (
            <Card className="mt-4">
              <CardContent className="py-8 text-center text-muted-foreground">
                No upcoming shifts. Contact admin to get rostered.
              </CardContent>
            </Card>
          ) : (
            <div className="mt-4 space-y-2">
              {upcomingShifts.map((ts) => (
                <RosterCard key={ts.id} ts={ts} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
