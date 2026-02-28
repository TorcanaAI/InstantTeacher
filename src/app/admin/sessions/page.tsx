/**
 * Admin Sessions tab.
 * Digest 1225262198: crash was caused by Prisma query for TutoringSession.section when
 * the column did not exist in the database. Fix: (1) run migration add_tutoring_session_section
 * or prisma db push; (2) auth check + try/catch + empty handling so the page never crashes.
 */

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { RefundButton } from "./refund-button";
import { DeleteSessionButton } from "./delete-session-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const PENDING_DELETABLE_STATUSES = ["REQUESTED", "PAYMENT_PENDING"];

const REFUNDABLE_STATUSES = [
  "PAID",
  "MATCHED",
  "ROOM_CREATED",
  "STUDENT_WAITING",
  "TEACHER_JOINED",
  "IN_PROGRESS",
  "ENDED",
];

export default async function AdminSessionsPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: Role }).role !== Role.ADMIN) {
    redirect("/auth/login");
  }

  let sessions: Awaited<
    ReturnType<
      typeof prisma.tutoringSession.findMany<{
        include: { student: true; teacher: true; extensions: true };
      }>
    >
  > = [];
  let dataError: string | null = null;

  try {
    sessions = await prisma.tutoringSession.findMany({
      orderBy: { requestedAt: "desc" },
      take: 100,
      include: {
        student: true,
        teacher: true,
        extensions: { where: { status: "SUCCEEDED" }, orderBy: { extendedAt: "desc" } },
      },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    dataError = error.message;
    console.error("[Admin sessions] Prisma error:", error.stack);
  }

  if (dataError) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Sessions</h1>
        <p className="text-muted-foreground">All tutoring sessions</p>
        <Card className="mt-6 border-amber-200 bg-amber-50">
          <CardContent className="py-6">
            <p className="font-medium text-amber-800">
              Could not load sessions. Database schema may be outdated.
            </p>
            <p className="mt-2 text-sm text-amber-700">
              Run: npx prisma migrate deploy (or npx prisma db push). Error: {dataError}
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/admin/sessions">Try again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Sessions</h1>
      <p className="text-muted-foreground">All tutoring sessions</p>
      <Card className="mt-6">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">ID</th>
                <th className="p-3 text-left font-medium">Student</th>
                <th className="p-3 text-left font-medium">Teacher</th>
                <th className="p-3 text-left font-medium">Subject</th>
                <th className="p-3 text-left font-medium">Section</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Extensions</th>
                <th className="p-3 text-left font-medium">Requested</th>
                <th className="p-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-muted-foreground">
                    No sessions yet.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => {
                  const canRefund =
                    s.stripePaymentIntentId &&
                    !s.stripeRefundId &&
                    REFUNDABLE_STATUSES.includes(s.status);
                  const canDeletePending = PENDING_DELETABLE_STATUSES.includes(s.status);
                  const extensionCount = s.extensions.length;
                  const totalExtended = s.extensions.reduce((sum, ext) => sum + ext.extensionMinutes, 0);
                  const totalExtensionPrice = s.extensions.reduce((sum, ext) => sum + ext.priceCents, 0);
                  return (
                    <tr key={s.id} className="border-b">
                      <td className="p-3 font-mono text-xs">{s.id.slice(0, 8)}</td>
                      <td className="p-3">{s.student.fullName}</td>
                      <td className="p-3">{s.teacher?.name ?? (s.teacherId ? "—" : "Waiting")}</td>
                      <td className="p-3">{s.subject}</td>
                      <td className="p-3">{s.section}</td>
                      <td className="p-3">{s.status}</td>
                      <td className="p-3">
                        {extensionCount > 0 ? (
                          <div className="text-xs">
                            <div className="font-medium text-[hsl(var(--hero-amber))]">
                              {extensionCount} extension{extensionCount !== 1 ? "s" : ""}
                            </div>
                            <div className="text-slate-600">
                              +{totalExtended} min (${(totalExtensionPrice / 100).toFixed(2)})
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3">{new Date(s.requestedAt).toLocaleString("en-AU")}</td>
                      <td className="p-3 flex flex-wrap items-center gap-2">
                        <RefundButton sessionId={s.id} disabled={!canRefund} />
                        <DeleteSessionButton sessionId={s.id} disabled={!canDeletePending} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
