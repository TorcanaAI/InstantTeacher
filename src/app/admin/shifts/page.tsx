import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteShiftButton } from "./delete-shift-button";

export default async function AdminShiftsPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: Role }).role !== Role.ADMIN) {
    redirect("/auth/login");
  }

  const shifts = await prisma.shift.findMany({
    orderBy: { startAt: "desc" },
    take: 50,
    include: {
      teacherShifts: { include: { teacher: { include: { user: true } } } },
      createdBy: true,
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shifts</h1>
          <p className="text-muted-foreground">Roster and attendance</p>
        </div>
        <Button asChild><Link href="/admin/shifts/new">Create shift</Link></Button>
      </div>
      <Card className="mt-6">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">Start – End</th>
                <th className="p-3 text-left font-medium">Required</th>
                <th className="p-3 text-left font-medium">Teachers</th>
                <th className="p-3 text-left font-medium">Created by</th>
                <th className="p-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-3">
                    {new Date(s.startAt).toLocaleString("en-AU", { dateStyle: "short", timeStyle: "short" })}
                    {" – "}
                    {new Date(s.endAt).toLocaleTimeString("en-AU", { timeStyle: "short" })}
                  </td>
                  <td className="p-3">{s.requiredTeacherCount}</td>
                  <td className="p-3">
                    {s.teacherShifts.map((ts) => (
                      <span key={ts.id} className="mr-2">
                        <Badge variant={ts.status === "CHECKED_IN" ? "success" : "secondary"}>
                          {ts.teacher.user.name} ({ts.status})
                        </Badge>
                      </span>
                    ))}
                  </td>
                  <td className="p-3">{s.createdBy.name ?? "—"}</td>
                  <td className="p-3">
                    <DeleteShiftButton shiftId={s.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
