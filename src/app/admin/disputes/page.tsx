import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminDisputesPage() {
  const disputes = await prisma.dispute.findMany({
    orderBy: { createdAt: "desc" },
    include: { session: true, raisedBy: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Disputes</h1>
      <p className="text-muted-foreground">Review and resolve</p>
      <Card className="mt-6">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">Session</th>
                <th className="p-3 text-left font-medium">Raised by</th>
                <th className="p-3 text-left font-medium">Reason</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {disputes.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No disputes</td></tr>
              ) : (
                disputes.map((d) => (
                  <tr key={d.id} className="border-b">
                    <td className="p-3 font-mono text-xs">{d.sessionId.slice(0, 8)}</td>
                    <td className="p-3">{d.raisedBy.name ?? d.raisedBy.email}</td>
                    <td className="p-3 max-w-xs truncate">{d.reason}</td>
                    <td className="p-3"><Badge>{d.status}</Badge></td>
                    <td className="p-3">{new Date(d.createdAt).toLocaleString("en-AU")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
