/**
 * Admin dashboard — server component.
 * Digest 1585636880: crash was caused by unguarded Prisma calls and/or session.user.role undefined.
 * Exact error (from server logs when reproduced): PrismaClientInitializationError or
 * "Can't reach database server" when DATABASE_URL missing/unreachable; or TypeError when
 * session.user.role was undefined and compared to Role.ADMIN.
 * Fix applied: (1) auth() + role check + redirect before any Prisma; (2) session callback
 * sets session.user.role = token.role ?? "PARENT"; (3) Prisma wrapped in try/catch with
 * fallback UI and console.error of full stack trace; (4) /admin/error.tsx error boundary.
 */

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const role = (session.user as { role?: Role }).role;
  if (role !== Role.ADMIN) {
    redirect("/");
  }

  let sessionCount = 0;
  let teacherCount = 0;
  type SessionWithRelations = Awaited<
    ReturnType<
      typeof prisma.tutoringSession.findMany<{
        include: { student: true; teacher: true };
      }>
    >
  >[number];
  let recentSessions: SessionWithRelations[] = [];
  let dataError: string | null = null;

  let sunshineQuestionBlocks = 0;
  let sunshineReadingSessions = 0;
  let sunshineRevenueCents = 0;

  try {
    const [count, teachers, sessions, qBlocks, rSessions] = await Promise.all([
      prisma.tutoringSession.count(),
      prisma.teacherProfile.count(),
      prisma.tutoringSession.findMany({
        orderBy: { requestedAt: "desc" },
        take: 10,
        include: { student: true, teacher: true },
      }),
      prisma.sunshineQuestionBlock.count(),
      prisma.sunshineReadingSession.findMany({
        where: { status: { in: ["PAID", "IN_PROGRESS", "COMPLETED"] } },
      }),
    ]);
    sessionCount = count;
    teacherCount = teachers;
    recentSessions = sessions;
    sunshineQuestionBlocks = qBlocks;
    sunshineReadingSessions = rSessions.length;
    sunshineRevenueCents =
      (await prisma.sunshineQuestionBlock.aggregate({ _sum: { amountCents: true } }))._sum.amountCents ?? 0;
    sunshineRevenueCents += rSessions.reduce((sum, r) => sum + r.amountCents, 0);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    dataError = error.message;
    console.error("[Admin dashboard] Prisma error — full stack trace:", error.stack);
    console.error("[Admin dashboard] Prisma error message:", error.message);
  }

  if (dataError) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <p className="mt-2 text-muted-foreground">Operations overview</p>
        <Card className="mt-6 border-amber-200 bg-amber-50">
          <CardContent className="py-6">
            <p className="font-medium text-amber-800">
              Admin dashboard loaded, but data could not be fetched.
            </p>
            <p className="mt-2 text-sm text-amber-700">
              Common causes: DATABASE_URL missing/wrong, DB unreachable, or schema outdated (e.g.
              missing TutoringSession.section). Run: <code className="rounded bg-amber-100 px-1">npx prisma migrate deploy</code> or <code className="rounded bg-amber-100 px-1">npx prisma db push</code> then redeploy.
            </p>
            <p className="mt-2 text-xs text-slate-500">Error: {dataError}</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/admin/dashboard">Try again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin dashboard</h1>
      <p className="text-muted-foreground">Operations overview</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{sessionCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{teacherCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sunshine question blocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{sunshineQuestionBlocks}</p>
            <p className="text-xs text-muted-foreground">($5 each)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sunshine reading sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{sunshineReadingSessions}</p>
            <p className="text-xs text-muted-foreground">($10 each)</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Instant Sunshine revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${(sunshineRevenueCents / 100).toFixed(2)}</p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/admin/sunshine">View Sunshine usage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent sessions</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/sessions">View all</Link>
          </Button>
        </div>
        <Card className="mt-4">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Student</th>
                  <th className="p-3 text-left font-medium">Teacher</th>
                  <th className="p-3 text-left font-medium">Subject</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Requested</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="p-3">{s.student?.fullName ?? "—"}</td>
                    <td className="p-3">{s.teacher?.name ?? (s.teacherId ? "—" : "Waiting")}</td>
                    <td className="p-3">{s.subject}</td>
                    <td className="p-3">{s.status}</td>
                    <td className="p-3">
                      {new Date(s.requestedAt).toLocaleString("en-AU")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
