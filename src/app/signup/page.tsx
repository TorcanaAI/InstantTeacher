import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, GraduationCap } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(173,58%,96%)] to-white">
      <header className="border-b border-teal-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold text-[hsl(var(--hero-teal))]">
            InstantTeacher
          </Link>
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-[hsl(var(--hero-teal))]">
            Log in
          </Link>
        </div>
      </header>
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Create an account</h1>
            <p className="mt-1 text-slate-600">
              I&apos;m a parent or student looking for help — or I want to teach
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Link href="/signup/parent" className="block">
              <Card className="h-full cursor-pointer rounded-2xl border-2 border-slate-100 transition-all hover:border-[hsl(var(--hero-teal))] hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--hero-teal))]/10">
                    <BookOpen className="h-6 w-6 text-[hsl(var(--hero-teal))]" />
                  </div>
                  <CardTitle className="text-slate-900">Parent / Student</CardTitle>
                  <CardDescription className="text-slate-600">
                    Get instant tutoring for your child. Add students, book sessions, pay per session.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full rounded-full bg-[hsl(var(--hero-teal))] hover:bg-[hsl(var(--hero-teal))]/90">
                    Sign up as parent
                  </Button>
                </CardContent>
              </Card>
            </Link>
            <Link href="/signup/teacher" className="block">
              <Card className="h-full cursor-pointer rounded-2xl border-2 border-slate-100 transition-all hover:border-[hsl(var(--hero-teal))] hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--hero-amber))]/20">
                    <GraduationCap className="h-6 w-6 text-[hsl(var(--hero-amber))]" />
                  </div>
                  <CardTitle className="text-slate-900">Teacher</CardTitle>
                  <CardDescription className="text-slate-600">
                    Join as a student teacher or qualified teacher. Set your subjects and earn per session.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full rounded-full border-2 border-[hsl(var(--hero-teal))] text-[hsl(var(--hero-teal))] hover:bg-[hsl(var(--hero-teal))]/10">
                    Sign up as teacher
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[hsl(var(--hero-teal))] underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
