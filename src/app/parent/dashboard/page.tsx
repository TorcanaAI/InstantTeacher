import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeaderParent } from "@/components/SiteHeader";

export default async function ParentDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.PARENT) redirect("/login");

  type UserWithParent = Awaited<
    ReturnType<
      typeof prisma.user.findUnique<{
        where: { id: string };
        include: { parentProfile: { include: { students: { include: { badges: true } } } } };
      }>
    >
  >;
  let user: UserWithParent = null;
  let dataError: string | null = null;

  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        parentProfile: {
          include: { students: { include: { badges: true } } },
        },
      },
    });
    if (!user?.parentProfile) redirect("/signup/parent");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    dataError = message;
    console.error("[Parent dashboard] Prisma error:", err);
  }

  if (dataError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 px-4">
        <h1 className="text-xl font-semibold text-foreground">Could not load dashboard</h1>
        <p className="max-w-md text-center text-sm text-muted-foreground">
          A database error occurred. Check DATABASE_URL and try again.
        </p>
        <p className="text-xs text-muted-foreground">Error: {dataError}</p>
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeaderParent logoHref="/parent/dashboard" />

      <main className="flex-1 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground">Hi, {parentProfile.fullName}</h1>
          <p className="text-muted-foreground">Homework help, exam prep & learning support with Sunshine and Jack.</p>

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
                      {(s.streakCurrent > 0 || (s.badges?.length ?? 0) > 0) && (
                        <span className="mt-1 block">
                          {s.streakCurrent > 0 && <>Streak: {s.streakCurrent} day{s.streakCurrent !== 1 ? "s" : ""}</>}
                          {(s.badges?.length ?? 0) > 0 && <> · {s.badges?.length} badge{(s.badges?.length ?? 0) !== 1 ? "s" : ""}</>}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <Button asChild size="sm" className="w-full">
                      <Link href={`/parent/homework/start?studentId=${encodeURIComponent(s.id)}`}>
                        Homework help (Sunshine & Jack)
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/parent/student/${s.id}/activity`}>View activity</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
        </div>
      </main>
    </div>
  );
}
