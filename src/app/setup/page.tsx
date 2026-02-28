import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

async function getSetupStatus(): Promise<{
  databaseOk: boolean;
  adminExists: boolean;
  authSecretSet: boolean;
  error?: string;
}> {
  const authSecretSet = !!process.env.AUTH_SECRET;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    return {
      databaseOk: false,
      adminExists: false,
      authSecretSet,
      error: e instanceof Error ? e.message : "Database connection failed",
    };
  }

  let adminExists = false;
  try {
    const admin = await prisma.user.findFirst({
      where: { role: Role.ADMIN },
      select: { id: true },
    });
    adminExists = !!admin;
  } catch {
    return { databaseOk: true, adminExists: false, authSecretSet, error: "Could not check admin user" };
  }

  return { databaseOk: true, adminExists, authSecretSet };
}

export default async function SetupPage() {
  const status = await getSetupStatus();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(173,58%,96%)] to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-lg rounded-2xl border-2 border-slate-100 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-slate-900">Admin login setup</CardTitle>
          <CardDescription className="text-slate-600">
            Get a free PostgreSQL database, set AUTH_SECRET, run the seed, then log in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm">
            <p className="font-medium text-slate-800">Status</p>
            <ul className="space-y-1 text-slate-600">
              <li>
                Database:{" "}
                {status.databaseOk ? (
                  <span className="text-green-600 font-medium">Connected</span>
                ) : (
                  <span className="text-destructive font-medium">Not connected</span>
                )}
              </li>
              <li>
                Admin user:{" "}
                {status.adminExists ? (
                  <span className="text-green-600 font-medium">Exists — you can log in</span>
                ) : (
                  <span className="text-amber-600 font-medium">Not found — run npm run db:seed</span>
                )}
              </li>
              <li>
                AUTH_SECRET (Vercel):{" "}
                {status.authSecretSet ? (
                  <span className="text-green-600 font-medium">Set</span>
                ) : (
                  <span className="text-amber-600 font-medium">Not set — add in Vercel env for production login</span>
                )}
              </li>
            </ul>
            {status.error && (
              <p className="text-destructive text-xs mt-2">{status.error}</p>
            )}
          </div>

          <ol className="list-decimal list-inside space-y-3 text-sm text-slate-700">
            <li>
              <strong>Get a free database</strong> — Neon.tech or Vercel Storage → Neon. Copy the connection string.
            </li>
            <li>
              <strong>Vercel env</strong> — In Vercel → Settings → Environment Variables add <code className="rounded bg-slate-100 px-1 py-0.5">AUTH_SECRET</code> (e.g. run <code className="rounded bg-slate-100 px-1">openssl rand -base64 32</code>) and ensure <code className="rounded bg-slate-100 px-1 py-0.5">DATABASE_URL</code> is set.
            </li>
            <li>
              <strong>Local .env</strong> — Set <code className="rounded bg-slate-100 px-1 py-0.5">DATABASE_URL</code> to the same value, then run: <code className="block mt-1 rounded bg-slate-100 p-2 text-xs">npx prisma db push &amp;&amp; npm run db:seed</code>
            </li>
            <li>
              <strong>Log in</strong> — Use the email and password from the seed (see <code className="rounded bg-slate-100 px-1">prisma/seed.ts</code> or set <code className="rounded bg-slate-100 px-1">ADMIN_EMAIL</code> / <code className="rounded bg-slate-100 px-1">ADMIN_PASSWORD</code> when running seed).
            </li>
          </ol>
          <p className="text-xs text-slate-500 text-center">
            <strong>Using Vercel?</strong> See <code className="rounded bg-slate-100 px-1">docs/VERCEL-SETUP.md</code>. Otherwise <code className="rounded bg-slate-100 px-1">docs/NEON-SETUP.md</code>.
          </p>

          {(!status.adminExists || status.error) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-medium">Login still not working? Reset admin on the server</p>
              <p className="mt-1 text-amber-700">
                1) In Vercel → Settings → Environment Variables, add <code className="rounded bg-amber-100 px-1">RESET_ADMIN_TOKEN</code> (e.g. <code className="rounded bg-amber-100 px-1">resetme</code>). 2) Redeploy. 3) Visit{" "}
                <code className="break-all rounded bg-amber-100 px-1">/api/setup/reset-admin?token=resetme</code> (use your app URL). 4) Log in with <strong>support@torcanaai.com</strong> / <strong>TempAdmin123</strong>. 5) Remove <code className="rounded bg-amber-100 px-1">RESET_ADMIN_TOKEN</code> from Vercel after.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button asChild className="w-full rounded-full bg-[hsl(var(--hero-teal))] hover:bg-[hsl(var(--hero-teal))]/90">
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
                Deploy with Vercel (add DB there)
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full rounded-full">
              <a href="https://neon.tech" target="_blank" rel="noopener noreferrer">
                Get free database at Neon.tech
              </a>
            </Button>
            <Button variant="ghost" asChild className="w-full rounded-full">
              <Link href="/login">Back to login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
