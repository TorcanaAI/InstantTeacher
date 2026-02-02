import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminTeachersPage() {
  const teachers = await prisma.teacherProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Teachers</h1>
      <p className="text-muted-foreground">Verify and manage teachers</p>
      <Card className="mt-6">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">Name</th>
                <th className="p-3 text-left font-medium">Email</th>
                <th className="p-3 text-left font-medium">Type</th>
                <th className="p-3 text-left font-medium">WWCC</th>
                <th className="p-3 text-left font-medium">School</th>
                <th className="p-3 text-left font-medium">Sessions</th>
                <th className="p-3 text-left font-medium">Rating</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="p-3">{t.fullName}</td>
                  <td className="p-3">{t.user.email}</td>
                  <td className="p-3">{t.teacherType.replace("_", " ")}</td>
                  <td className="p-3">
                    <Badge variant={t.wwccVerified ? "success" : "secondary"}>
                      {t.wwccVerified ? "Verified" : "Pending"}
                    </Badge>
                  </td>
                  <td className="p-3">{t.schoolName ?? "—"}</td>
                  <td className="p-3">{t.totalSessions}</td>
                  <td className="p-3">{t.ratingAvg != null ? t.ratingAvg.toFixed(1) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
