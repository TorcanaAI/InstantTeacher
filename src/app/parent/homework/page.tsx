import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeaderParent } from "@/components/SiteHeader";
import Image from "next/image";
import { BADGES, SUNSHINE_AVATAR_URL, SUNSHINE_INTRODUCTION, JACK_AVATAR_URL, JACK_INTRODUCTION } from "@/lib/constants";

export default async function ParentHomeworkPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.PARENT) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      parentProfile: {
        include: {
          students: {
            include: {
              badges: { orderBy: { unlockedAt: "asc" } },
            },
          },
        },
      },
    },
  });
  if (!user?.parentProfile) redirect("/signup/parent");
  const students = user.parentProfile.students;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeaderParent logoHref="/parent/dashboard" />

      <main className="flex-1 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground">Homework help</h1>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-4 rounded-xl border-2 border-border bg-secondary/30 p-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-primary/30">
                <Image src={SUNSHINE_AVATAR_URL} alt="Sunshine" fill className="object-cover" sizes="56px" />
              </div>
              <div>
                <p className="font-medium text-foreground">Meet Sunshine</p>
                <p className="text-sm text-muted-foreground">{SUNSHINE_INTRODUCTION}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border-2 border-border bg-muted/50 p-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-primary/30">
                <Image src={JACK_AVATAR_URL} alt="Jack" fill className="object-cover" sizes="56px" />
              </div>
              <div>
                <p className="font-medium text-foreground">Meet Jack</p>
                <p className="text-sm text-muted-foreground">{JACK_INTRODUCTION}</p>
              </div>
            </div>
          </div>

        {students.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Add a student first.</p>
              <Button asChild className="mt-4">
                <Link href="/parent/students/new">Add student</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((s) => (
              <Card key={s.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{s.fullName}</CardTitle>
                  <CardDescription>
                    Year {s.schoolYear} · Streak: {s.streakCurrent} day{s.streakCurrent !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {s.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {s.badges.slice(0, 5).map((b) => {
                        const def = BADGES.find((x) => x.id === b.badgeId);
                        return (
                          <span
                            key={b.id}
                            className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                            title={def?.description}
                          >
                            {def?.emoji} {def?.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button asChild className="flex-1" size="sm">
                      <Link href={`/parent/homework/start?studentId=${encodeURIComponent(s.id)}`}>
                        Start session
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/parent/student/${s.id}/activity`}>Activity</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
