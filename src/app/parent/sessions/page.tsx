import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ParentSessionsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.PARENT) redirect("/login");

  const sessions = await prisma.tutoringSession.findMany({
    where: { requestedByUserId: session.user.id },
    orderBy: { requestedAt: "desc" },
    include: { student: true, teacher: true },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(173,58%,96%)] to-white">
      <header className="border-b border-teal-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/parent/dashboard" className="text-lg font-bold text-[hsl(var(--hero-teal))]">
            InstantTeacher
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/parent/dashboard">Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Session history</h1>
        <p className="text-muted-foreground">All your tutoring sessions</p>

        {sessions.length === 0 ? (
          <Card className="mt-8">
            <CardContent className="py-12 text-center text-muted-foreground">
              No sessions yet. Book your first from the dashboard.
            </CardContent>
          </Card>
        ) : (
          <div className="mt-8 space-y-4">
            {sessions.map((s) => (
              <Card key={s.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium">{s.student.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.subject} · Year {s.yearLevel} · {s.durationMinutes} min · {s.teacher?.name ?? (s.teacherId ? "Teacher" : "Waiting for teacher")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.requestedAt).toLocaleString("en-AU")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.status === "ENDED" ? "secondary" : "default"}>
                      {s.status.replace("_", " ")}
                    </Badge>
                    {(s.status === "PAID" || s.status === "MATCHED" || s.status === "ROOM_CREATED" || s.status === "STUDENT_WAITING" || s.status === "TEACHER_JOINED" || s.status === "IN_PROGRESS") && (
                      <Button size="sm" asChild>
                        <Link href={`/session/${s.id}`}>Join</Link>
                      </Button>
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
        )}
      </main>
    </div>
  );
}
