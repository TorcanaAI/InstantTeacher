import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteTrialCoupon } from "@/app/admin/actions/trials";
import CreateTrialForm from "./CreateTrialForm";
import { Ticket } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminTrialsPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: Role }).role !== Role.ADMIN) {
    redirect("/auth/login");
  }

  const coupons = await prisma.trialCoupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← Dashboard
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold text-foreground">
          <Ticket className="h-8 w-8 text-primary" />
          Trial codes
        </h1>
        <p className="mt-1 text-muted-foreground">
          One-time codes parents enter at checkout for a <strong>7-day free trial</strong> on weekly or monthly
          membership. Each code works once.
        </p>
      </div>

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Add a trial code</CardTitle>
          <CardDescription>
            Enter the reference / coupon code you want (e.g. SCHOOL2026 or OPEN-DAY). It will be stored in capitals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTrialForm />
        </CardContent>
      </Card>

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All trial codes</CardTitle>
          <CardDescription>Unused codes can be deleted. Used codes are kept for your records.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-3 text-left font-medium text-foreground">Code</th>
                  <th className="p-3 text-left font-medium text-foreground">Note</th>
                  <th className="p-3 text-left font-medium text-foreground">Status</th>
                  <th className="p-3 text-left font-medium text-foreground">Used</th>
                  <th className="p-3 text-right font-medium text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground">
                      No trial codes yet. Add one above.
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="p-3 font-mono font-semibold text-foreground">{c.code}</td>
                      <td className="p-3 text-muted-foreground">{c.referenceNote ?? "—"}</td>
                      <td className="p-3">
                        {c.usedAt ? (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs">Used</span>
                        ) : (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Available
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {c.usedAt
                          ? c.usedAt.toLocaleString("en-AU", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="p-3 text-right">
                        {!c.usedAt ? (
                          <form action={deleteTrialCoupon}>
                            <input type="hidden" name="id" value={c.id} />
                            <Button type="submit" variant="outline" size="sm" className="rounded-full">
                              Delete
                            </Button>
                          </form>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
