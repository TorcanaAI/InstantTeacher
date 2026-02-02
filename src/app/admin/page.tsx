import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const [sessionCount, teacherCount, recentSessions] = await Promise.all([
    prisma.tutoringSession.count(),
    prisma.teacherProfile.count(),
    prisma.tutoringSession.findMany({
      orderBy: { requestedAt: "desc" },
      take: 10,
      include: { student: true, teacher: true },
    }),
  ]);

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
                    <td className="p-3">{s.student.fullName}</td>
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
