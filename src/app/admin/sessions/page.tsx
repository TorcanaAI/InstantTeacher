import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { RefundButton } from "./refund-button";

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
  const sessions = await prisma.tutoringSession.findMany({
    orderBy: { requestedAt: "desc" },
    take: 100,
    include: { student: true, teacher: true },
  });

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
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Requested</th>
                <th className="p-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const canRefund =
                  s.stripePaymentIntentId &&
                  !s.stripeRefundId &&
                  REFUNDABLE_STATUSES.includes(s.status);
                return (
                  <tr key={s.id} className="border-b">
                    <td className="p-3 font-mono text-xs">{s.id.slice(0, 8)}</td>
                    <td className="p-3">{s.student.fullName}</td>
                    <td className="p-3">{s.teacher?.name ?? (s.teacherId ? "—" : "Waiting")}</td>
                    <td className="p-3">{s.subject}</td>
                    <td className="p-3">{s.status}</td>
                    <td className="p-3">{new Date(s.requestedAt).toLocaleString("en-AU")}</td>
                    <td className="p-3">
                      <RefundButton sessionId={s.id} disabled={!canRefund} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
