import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(173,58%,96%)] to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-lg rounded-2xl border-2 border-slate-100 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-slate-900">Option B — Admin login setup</CardTitle>
          <CardDescription className="text-slate-600">
            Get a free PostgreSQL database, then run the seed to create the admin user.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ol className="list-decimal list-inside space-y-3 text-sm text-slate-700">
            <li>
              <strong>Get a free database</strong> — Click the button below to open Neon.tech, sign up, create a project, and copy the connection string.
            </li>
            <li>
              <strong>Paste in .env</strong> — In your project root, open <code className="rounded bg-slate-100 px-1 py-0.5">.env</code> and set <code className="rounded bg-slate-100 px-1 py-0.5">DATABASE_URL=&quot;your-copied-connection-string&quot;</code> (replace the placeholder).
            </li>
            <li>
              <strong>Run setup</strong> — In the terminal run: <code className="block mt-1 rounded bg-slate-100 p-2 text-xs">npx prisma db push &amp;&amp; npm run db:seed</code>
            </li>
            <li>
              <strong>Log in</strong> — Go to <Link href="/login" className="font-medium text-[hsl(var(--hero-teal))] underline">/login</Link> with your admin email and password (the one created by the seed — default is jkritzinger92@gmail.com).
            </li>
          </ol>
          <p className="text-xs text-slate-500 text-center">
            <strong>Using Vercel?</strong> See <code className="rounded bg-slate-100 px-1">docs/VERCEL-SETUP.md</code>. Otherwise open <code className="rounded bg-slate-100 px-1">docs/NEON-SETUP.md</code> for Neon-only steps.
          </p>
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
