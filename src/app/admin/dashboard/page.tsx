import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  TrendingUp,
  CreditCard,
  Sun,
  Zap,
  AlertCircle,
} from "lucide-react";

// Ensure this dashboard always hits the live DB on request.
// Otherwise Vercel can prerender it during build and cache the "Data unavailable"
// state from earlier missing tables.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const role = (session.user as { role?: Role }).role;
  if (role !== Role.ADMIN) {
    redirect("/");
  }

  let homeworkSessionCount = 0;
  let subscriptionUserCount = 0;
  let streakAvg = 0;
  let totalSessionRevenueCents = 0;
  let popularSubjects: { subject: string; count: number }[] = [];
  let assistantPreference: { assistantType: string; count: number }[] = [];
  let recentHomeworkSessions: {
    id: string;
    student: { fullName: string };
    assistantType: string;
    subject: string | null;
    status: string;
    pricePaidCents: number;
    createdAt: Date;
  }[] = [];
  let subscriptions: {
    id: string;
    plan: string;
    status: string;
    currentPeriodEnd: Date | null;
    user: { email: string | null; name: string | null };
  }[] = [];
  let dataError: string | null = null;

  try {
    const [
      hwCount,
      subCount,
      streakAgg,
      subjectAgg,
      assistantAgg,
      revenueAgg,
      recent,
      subList,
    ] = await Promise.all([
      prisma.homeworkSession.count({ where: { status: { in: ["ACTIVE", "ENDED"] } } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.studentProfile.aggregate({ _avg: { streakCurrent: true }, _count: { id: true } }),
      prisma.homeworkSession.groupBy({
        by: ["subject"],
        where: { status: { in: ["ACTIVE", "ENDED"] }, subject: { not: null } },
        _count: { subject: true },
        orderBy: { _count: { subject: "desc" } },
        take: 5,
      }),
      prisma.homeworkSession.groupBy({
        by: ["assistantType"],
        where: { status: { in: ["ACTIVE", "ENDED"] } },
        _count: { assistantType: true },
      }),
      prisma.homeworkSession.aggregate({
        where: { status: { in: ["ACTIVE", "ENDED"] } },
        _sum: { pricePaidCents: true },
      }),
      prisma.homeworkSession.findMany({
        where: { status: { in: ["ACTIVE", "ENDED"] } },
        orderBy: { createdAt: "desc" },
        take: 15,
        include: { student: { select: { fullName: true } } },
      }),
      prisma.subscription.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, name: true } } },
      }),
    ]);

    homeworkSessionCount = hwCount;
    subscriptionUserCount = subCount;
    streakAvg = streakAgg._count.id > 0 ? Math.round((streakAgg._avg.streakCurrent ?? 0) * 10) / 10 : 0;
    totalSessionRevenueCents = revenueAgg._sum.pricePaidCents ?? 0;
    popularSubjects = subjectAgg.map((s) => ({ subject: s.subject ?? "", count: s._count.subject }));
    assistantPreference = assistantAgg.map((s) => ({ assistantType: s.assistantType, count: s._count.assistantType }));
    recentHomeworkSessions = recent.map((s) => ({
      id: s.id,
      student: s.student,
      assistantType: s.assistantType,
      subject: s.subject,
      status: s.status,
      pricePaidCents: s.pricePaidCents,
      createdAt: s.createdAt,
    }));
    subscriptions = subList.map((s) => ({
      id: s.id,
      plan: s.plan,
      status: s.status,
      currentPeriodEnd: s.currentPeriodEnd,
      user: s.user,
    }));
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    dataError = error.message;
    console.error("[Admin dashboard] Prisma error:", error.stack);
  }

  const totalSessionRevenueDollars = (totalSessionRevenueCents / 100).toFixed(2);
  const sunshineCount = assistantPreference.find((a) => a.assistantType === "SUNSHINE")?.count ?? 0;
  const jackCount = assistantPreference.find((a) => a.assistantType === "JACK")?.count ?? 0;
  const totalPreference = sunshineCount + jackCount;
  const sunshinePct = totalPreference > 0 ? Math.round((sunshineCount / totalPreference) * 100) : 0;
  const jackPct = totalPreference > 0 ? Math.round((jackCount / totalPreference) * 100) : 0;

  if (dataError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Smart Support, Anytime — admin overview</p>
        </div>
        <Card className="border-2 border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Data unavailable
            </CardTitle>
            <CardDescription className="space-y-2">
              <span>
                The database is missing tables that match the app (e.g. <code className="rounded bg-muted px-1">HomeworkSession</code>
                ). Production deploys now run <code className="rounded bg-muted px-1">prisma db push</code> during build —{" "}
                <strong>redeploy on Vercel</strong> with <code className="rounded bg-muted px-1">DATABASE_URL</code> set to your
                Postgres.
              </span>
              <span className="block">
                Or run locally:{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">npx prisma db push</code> with your production{" "}
                <code className="rounded bg-muted px-1">DATABASE_URL</code>. See{" "}
                <code className="rounded bg-muted px-1">docs/PRODUCTION-DATABASE.md</code> in the repo.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Error: {dataError}</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/admin/dashboard">Try again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Subscriptions, sales, and how families use Sunshine & Jack</p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-border transition hover:border-primary/20 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Homework sessions</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{homeworkSessionCount}</p>
            <p className="text-xs text-muted-foreground">Total completed</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-border transition hover:border-primary/20 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{subscriptionUserCount}</p>
            <p className="text-xs text-muted-foreground">Weekly or monthly</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-border transition hover:border-primary/20 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Session revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">${totalSessionRevenueDollars}</p>
            <p className="text-xs text-muted-foreground">From one-off sessions</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-border transition hover:border-primary/20 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg learning streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{streakAvg}</p>
            <p className="text-xs text-muted-foreground">Days per student</p>
          </CardContent>
        </Card>
      </div>

      {/* Jack vs Sunshine preference */}
      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Who do families prefer?</CardTitle>
          <CardDescription>Session count by assistant (Sunshine vs Jack)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-border bg-secondary/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Sun className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Sunshine</p>
                  <p className="text-2xl font-bold text-primary">{sunshineCount}</p>
                  <p className="text-sm text-muted-foreground">{sunshinePct}% of sessions</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border-2 border-border bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Jack</p>
                  <p className="text-2xl font-bold text-primary">{jackCount}</p>
                  <p className="text-sm text-muted-foreground">{jackPct}% of sessions</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription details */}
      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Subscription details</CardTitle>
          <CardDescription>Active subscribers — plan, status, and period end</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {subscriptions.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No active subscriptions yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3 text-left font-medium text-foreground">Email</th>
                    <th className="p-3 text-left font-medium text-foreground">Name</th>
                    <th className="p-3 text-left font-medium text-foreground">Plan</th>
                    <th className="p-3 text-left font-medium text-foreground">Status</th>
                    <th className="p-3 text-left font-medium text-foreground">Period ends</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-border last:border-0">
                      <td className="p-3 text-foreground">{sub.user.email ?? "—"}</td>
                      <td className="p-3 text-muted-foreground">{sub.user.name ?? "—"}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {sub.plan}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{sub.status}</td>
                      <td className="p-3 text-muted-foreground">
                        {sub.currentPeriodEnd
                          ? sub.currentPeriodEnd.toLocaleDateString("en-AU", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popular subjects + Recent sessions side by side on large screens */}
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="border-2 border-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Popular subjects</CardTitle>
            <CardDescription>Most-used subjects in sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {popularSubjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ul className="space-y-2">
                {popularSubjects.map((s) => (
                  <li
                    key={s.subject}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-foreground">{s.subject}</span>
                    <span className="text-muted-foreground">{s.count} sessions</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Recent homework sessions</CardTitle>
            <CardDescription>Latest sessions with student, assistant, and amount</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3 text-left font-medium text-foreground">Student</th>
                    <th className="p-3 text-left font-medium text-foreground">Assistant</th>
                    <th className="p-3 text-left font-medium text-foreground">Subject</th>
                    <th className="p-3 text-left font-medium text-foreground">Amount</th>
                    <th className="p-3 text-left font-medium text-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentHomeworkSessions.map((s) => (
                    <tr key={s.id} className="border-b border-border last:border-0">
                      <td className="p-3 text-foreground">{s.student?.fullName ?? "—"}</td>
                      <td className="p-3">
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                          {s.assistantType}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{s.subject ?? "—"}</td>
                      <td className="p-3 text-foreground">
                        ${((s.pricePaidCents || 0) / 100).toFixed(2)}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {s.createdAt.toLocaleString("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {recentHomeworkSessions.length === 0 && (
              <div className="p-6 text-center text-muted-foreground">No sessions yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
