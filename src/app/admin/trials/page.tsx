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

  const couponRows = await prisma.trialCoupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const coupons = await Promise.all(
    couponRows.map(async (c) => {
      const [lastRedemption, activeTrials] = await Promise.all([
        prisma.trialCodeRedemption.findFirst({
          where: { trialCouponId: c.id },
          orderBy: { redeemedAt: "desc" },
          select: { redeemedAt: true },
        }),
        prisma.trialCodeRedemption.count({
          where: { trialCouponId: c.id, trialEndDate: { gt: now } },
        }),
      ]);
      const remaining = Math.max(0, c.maxUses - c.usedCount);
      const pctUsed = c.maxUses > 0 ? Math.round((c.usedCount / c.maxUses) * 1000) / 10 : 0;
      const exhausted = c.usedCount >= c.maxUses;
      const legacyUsed = Boolean(c.usedAt) && c.usedCount === 0;
      return {
        ...c,
        lastUsed: lastRedemption?.redeemedAt ?? null,
        activeTrials,
        remaining,
        pctUsed,
        exhausted,
        legacyUsed,
      };
    })
  );

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
          Shared club codes: global redemption cap, <strong>one redemption per account</strong>, and{" "}
          <strong>one per payment method</strong> (card). Trial length runs from checkout (default 7 days).
        </p>
      </div>

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Add a trial code</CardTitle>
          <CardDescription>
            Codes are stored in capitals. Parents enter them on the subscribe page for a free trial before billing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTrialForm />
        </CardContent>
      </Card>

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All trial codes</CardTitle>
          <CardDescription>
            Delete only works for codes with zero redemptions. Payment-method checks apply when Stripe confirms the
            subscription.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-3 text-left font-medium text-foreground">Code</th>
                  <th className="p-3 text-left font-medium text-foreground">Note</th>
                  <th className="p-3 text-right font-medium text-foreground">Max</th>
                  <th className="p-3 text-right font-medium text-foreground">Used</th>
                  <th className="p-3 text-right font-medium text-foreground">Left</th>
                  <th className="p-3 text-right font-medium text-foreground">% used</th>
                  <th className="p-3 text-left font-medium text-foreground">Status</th>
                  <th className="p-3 text-left font-medium text-foreground">Last used</th>
                  <th className="p-3 text-right font-medium text-foreground">Active trials</th>
                  <th className="p-3 text-right font-medium text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-6 text-center text-muted-foreground">
                      No trial codes yet. Add one above.
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="p-3 font-mono font-semibold text-foreground">{c.code}</td>
                      <td className="p-3 text-muted-foreground">{c.referenceNote ?? "—"}</td>
                      <td className="p-3 text-right tabular-nums">{c.maxUses}</td>
                      <td className="p-3 text-right tabular-nums">{c.usedCount}</td>
                      <td className="p-3 text-right tabular-nums">{c.remaining}</td>
                      <td className="p-3 text-right tabular-nums">{c.pctUsed}%</td>
                      <td className="p-3">
                        {c.exhausted || c.legacyUsed ? (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs">Exhausted</span>
                        ) : (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {c.lastUsed
                          ? c.lastUsed.toLocaleString("en-AU", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : c.usedAt
                            ? c.usedAt.toLocaleString("en-AU", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                      </td>
                      <td className="p-3 text-right tabular-nums">{c.activeTrials}</td>
                      <td className="p-3 text-right">
                        {c.usedCount === 0 && !c.usedAt ? (
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
