import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, BookOpen, CheckCircle, XCircle, Clock } from "lucide-react";

export default async function TeacherRegistrationPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.TEACHER) redirect("/login");

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) redirect("/signup/teacher");

  const status = profile.applicationStatus;
  const wwccOk = profile.wwccVerified;
  const trbOk = profile.teacherRegVerified;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(173,58%,96%)] to-white">
      <header className="border-b border-teal-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/teacher/dashboard" className="text-lg font-bold text-[hsl(var(--hero-teal))]">
            InstantTeacher
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/teacher/dashboard" className="text-sm font-medium text-slate-600 hover:text-[hsl(var(--hero-teal))]">
              Dashboard
            </Link>
            <form action="/api/auth/signout" method="POST">
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900">My registration</h1>
        <p className="mt-1 text-slate-600">
          Your application is reviewed by admin. We confirm WWCC and Teacher Registration (Register of Teachers) before approval.
        </p>

        <Card className="mt-8 rounded-2xl border-2 border-slate-100">
          <CardHeader>
            <CardTitle className="text-slate-900">Application status</CardTitle>
            <CardDescription>WWCC and Teacher Registration must be verified before you can be rostered.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${wwccOk ? "bg-green-100" : "bg-slate-100"}`}>
                  {wwccOk ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Shield className="h-5 w-5 text-slate-500" />}
                </div>
                <div>
                  <p className="font-medium text-slate-900">Working With Children Check (WWCC)</p>
                  <p className="text-sm text-slate-600">
                    {profile.wwccNumber ?? "—"} · Expires {profile.wwccExpiry ? new Date(profile.wwccExpiry).toLocaleDateString("en-AU") : "—"}
                  </p>
                </div>
              </div>
              <Badge variant={wwccOk ? "success" : "secondary"}>{wwccOk ? "Verified" : "Pending"}</Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${trbOk ? "bg-green-100" : "bg-slate-100"}`}>
                  {trbOk ? <CheckCircle className="h-5 w-5 text-green-600" /> : <BookOpen className="h-5 w-5 text-slate-500" />}
                </div>
                <div>
                  <p className="font-medium text-slate-900">Teacher Registration (Register of Teachers)</p>
                  <p className="text-sm text-slate-600">
                    {profile.teacherRegistrationNumber ?? "—"} · Expires {profile.teacherRegistrationExpiry ? new Date(profile.teacherRegistrationExpiry).toLocaleDateString("en-AU") : "—"}
                  </p>
                </div>
              </div>
              <Badge variant={trbOk ? "success" : "secondary"}>{trbOk ? "Verified" : "Pending"}</Badge>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                {status === "APPROVED" && (
                  <>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-semibold text-slate-900">Application approved</p>
                      <p className="text-sm text-slate-600">You can be rostered and take sessions. Go to Dashboard for shifts.</p>
                    </div>
                  </>
                )}
                {status === "REJECTED" && (
                  <>
                    <XCircle className="h-8 w-8 text-destructive" />
                    <div>
                      <p className="font-semibold text-slate-900">Application not approved</p>
                      {profile.applicationRejectedReason && (
                        <p className="text-sm text-slate-600">{profile.applicationRejectedReason}</p>
                      )}
                    </div>
                  </>
                )}
                {status === "PENDING" && (
                  <>
                    <Clock className="h-8 w-8 text-amber-500" />
                    <div>
                      <p className="font-semibold text-slate-900">Pending verification</p>
                      <p className="text-sm text-slate-600">Admin will confirm your WWCC and Teacher Registration. You will be notified when approved.</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Button asChild className="rounded-full bg-[hsl(var(--hero-teal))] hover:bg-[hsl(var(--hero-teal))]/90">
              <Link href="/teacher/dashboard">Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
