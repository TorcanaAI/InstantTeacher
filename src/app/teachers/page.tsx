import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function TeachersRecruitmentPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-teal-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-[hsl(var(--hero-teal))]">
            InstantTeacher
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-[hsl(var(--hero-teal))]">Home</Link>
            <Button asChild size="sm" className="rounded-full bg-[hsl(var(--hero-teal))] hover:bg-[hsl(var(--hero-teal))]/90">
              <Link href="/signup">Get help now</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="relative overflow-hidden bg-gradient-to-b from-[hsl(173,58%,96%)] to-white">
        <div className="container mx-auto max-w-2xl px-4 py-16">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--hero-amber))]/20">
              <GraduationCap className="h-6 w-6 text-[hsl(var(--hero-amber))]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Teach with InstantTeacher</h1>
              <p className="mt-1 text-slate-600">
                Student teachers and qualified teachers welcome. Earn per session, set your own availability — across Australia.
              </p>
            </div>
          </div>
          <Card className="mt-10 rounded-2xl border-2 border-slate-100">
            <CardHeader>
              <CardTitle className="text-slate-900">What we need</CardTitle>
              <CardContent className="p-0 pt-2">
                <ul className="list-inside list-disc space-y-1 text-slate-600">
                  <li>Valid WWCC (Working With Children Check)</li>
                  <li>Subjects and year levels you can teach</li>
                  <li>Availability for rostered shifts (Phase 1)</li>
                </ul>
              </CardContent>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                You keep 75% of each session. We handle payments and matching.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button className="rounded-full bg-[hsl(var(--hero-teal))] hover:bg-[hsl(var(--hero-teal))]/90" asChild>
                  <Link href="/signup/teacher">Sign up as teacher</Link>
                </Button>
                <Button variant="outline" className="rounded-full border-2" asChild>
                  <Link href="/login?callbackUrl=/teacher/dashboard">Log in as teacher</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
