import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  verifyWwcc,
  verifyTeacherRegistration,
  approveTeacherApplication,
  rejectTeacherApplication,
} from "../actions/registrations";
import { Shield, BookOpen, CheckCircle, XCircle } from "lucide-react";

export default async function AdminRegistrationsPage() {
  const teachers = await prisma.teacherProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  const pending = teachers.filter((t) => t.applicationStatus === "PENDING");

  return (
    <div>
      <h1 className="text-2xl font-bold">Teacher registrations</h1>
      <p className="text-muted-foreground">
        Confirm WWCC and Teacher Registration (Register of Teachers), then approve applications.
      </p>

      {pending.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-0">
            <div className="border-b bg-amber-50/50 px-4 py-2 font-medium text-amber-900">
              Pending verification ({pending.length})
            </div>
            <div className="divide-y">
              {pending.map((t) => (
                <RegistrationRow
                  key={t.id}
                  teacher={t}
                  onVerifyWwcc={verifyWwcc}
                  onVerifyTrb={verifyTeacherRegistration}
                  onApprove={approveTeacherApplication}
                  onReject={rejectTeacherApplication}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">All teachers</h2>
        <Card className="mt-4">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Name</th>
                  <th className="p-3 text-left font-medium">Email</th>
                  <th className="p-3 text-left font-medium">WWCC</th>
                  <th className="p-3 text-left font-medium">TRB / Reg.</th>
                  <th className="p-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id} className="border-b">
                    <td className="p-3">{t.fullName}</td>
                    <td className="p-3">{t.user.email}</td>
                    <td className="p-3">
                      <Badge variant={t.wwccVerified ? "success" : "secondary"}>
                        {t.wwccVerified ? "Verified" : "Pending"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={t.teacherRegVerified ? "success" : "secondary"}>
                        {t.teacherRegVerified ? "Verified" : "Pending"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          t.applicationStatus === "APPROVED"
                            ? "success"
                            : t.applicationStatus === "REJECTED"
                              ? "destructive"
                              : "warning"
                        }
                      >
                        {t.applicationStatus}
                      </Badge>
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

function RegistrationRow({
  teacher,
  onVerifyWwcc,
  onVerifyTrb,
  onApprove,
  onReject,
}: {
  teacher: { id: string; fullName: string; wwccNumber: string | null; wwccExpiry: Date | null; wwccVerified: boolean; teacherRegistrationNumber: string | null; teacherRegistrationExpiry: Date | null; teacherRegVerified: boolean; user: { email: string | null } };
  onVerifyWwcc: (formData: FormData) => void | Promise<void>;
  onVerifyTrb: (formData: FormData) => void | Promise<void>;
  onApprove: (formData: FormData) => void | Promise<void>;
  onReject: (formData: FormData) => void | Promise<void>;
}) {
  const canApprove = teacher.wwccVerified && teacher.teacherRegVerified;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4">
      <div>
        <p className="font-medium">{teacher.fullName}</p>
        <p className="text-sm text-muted-foreground">{teacher.user.email}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>WWCC: {teacher.wwccNumber ?? "—"} · Exp {teacher.wwccExpiry ? new Date(teacher.wwccExpiry).toLocaleDateString("en-AU") : "—"}</span>
          <span>TRB: {teacher.teacherRegistrationNumber ?? "—"} · Exp {teacher.teacherRegistrationExpiry ? new Date(teacher.teacherRegistrationExpiry).toLocaleDateString("en-AU") : "—"}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {!teacher.wwccVerified && (
          <form action={onVerifyWwcc}>
            <input type="hidden" name="teacherProfileId" value={teacher.id} />
            <Button type="submit" size="sm" variant="outline" className="gap-1">
              <Shield className="h-3.5 w-3.5" /> Verify WWCC
            </Button>
          </form>
        )}
        {!teacher.teacherRegVerified && (
          <form action={onVerifyTrb}>
            <input type="hidden" name="teacherProfileId" value={teacher.id} />
            <Button type="submit" size="sm" variant="outline" className="gap-1">
              <BookOpen className="h-3.5 w-3.5" /> Verify TRB
            </Button>
          </form>
        )}
        {canApprove && (
          <form action={onApprove}>
            <input type="hidden" name="teacherProfileId" value={teacher.id} />
            <Button type="submit" size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-3.5 w-3.5" /> Approve
            </Button>
          </form>
        )}
        <form action={onReject}>
          <input type="hidden" name="teacherProfileId" value={teacher.id} />
          <Button type="submit" size="sm" variant="destructive" className="gap-1">
            <XCircle className="h-3.5 w-3.5" /> Reject
          </Button>
        </form>
      </div>
    </div>
  );
}
