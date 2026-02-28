import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminSunshinePage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: Role }).role !== Role.ADMIN) {
    redirect("/");
  }

  let questionUses: Awaited<
    ReturnType<typeof prisma.sunshineQuestionUse.findMany<{ include: { student: true } }>>
  > = [];
  let readingSessions: Awaited<
    ReturnType<
      typeof prisma.sunshineReadingSession.findMany<{
        include: { student: true };
      }>
    >
  > = [];
  let dataError: string | null = null;

  try {
    const [uses, readings] = await Promise.all([
      prisma.sunshineQuestionUse.findMany({
        orderBy: { usedAt: "desc" },
        take: 100,
        include: { student: true },
      }),
      prisma.sunshineReadingSession.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { student: true },
      }),
    ]);
    questionUses = uses;
    readingSessions = readings;
  } catch (err) {
    dataError = err instanceof Error ? err.message : String(err);
  }

  if (dataError) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Instant Sunshine</h1>
        <p className="text-muted-foreground">Question usage and reading sessions</p>
        <Card className="mt-6 border-amber-200 bg-amber-50">
          <CardContent className="py-6">
            <p className="text-amber-800">Error: {dataError}</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/admin/sunshine">Try again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Instant Sunshine</h1>
      <p className="text-muted-foreground">Question usage and reading sessions</p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Question uses (last 100)</h2>
        <Card className="mt-4">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Student</th>
                  <th className="p-3 text-left font-medium">Subject</th>
                  <th className="p-3 text-left font-medium">Used at</th>
                </tr>
              </thead>
              <tbody>
                {questionUses.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-muted-foreground">
                      No question uses yet.
                    </td>
                  </tr>
                ) : (
                  questionUses.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="p-3">{u.student.fullName}</td>
                      <td className="p-3">{u.subject}</td>
                      <td className="p-3">{new Date(u.usedAt).toLocaleString("en-AU")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Reading sessions (last 50)</h2>
        <Card className="mt-4">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Student</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Stripe PI</th>
                  <th className="p-3 text-left font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {readingSessions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted-foreground">
                      No reading sessions yet.
                    </td>
                  </tr>
                ) : (
                  readingSessions.map((r) => (
                    <tr key={r.id} className="border-b">
                      <td className="p-3">{r.student.fullName}</td>
                      <td className="p-3">{r.status}</td>
                      <td className="p-3 font-mono text-xs">{r.stripePaymentIntentId ?? "—"}</td>
                      <td className="p-3">{new Date(r.createdAt).toLocaleString("en-AU")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <div className="mt-6 flex flex-wrap gap-4">
        <Button variant="default" asChild>
          <Link href="/admin/sunshine-reading-test">Test Sunshine Reading</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
