"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUBJECTS, YEAR_LEVELS } from "@/lib/constants";
import { registerTeacher } from "@/app/actions/auth";

export default function SignupTeacherPage() {
  const router = useRouter();
  const [error, setError] = useState<Record<string, string[]>>({});
  const [teacherType, setTeacherType] = useState<string>("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [yearLevels, setYearLevels] = useState<number[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError({});
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("teacherType", teacherType);
    formData.set("subjects", JSON.stringify(subjects));
    formData.set("yearLevels", JSON.stringify(yearLevels));
    const result = await registerTeacher(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/teacher/dashboard");
  }

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
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md rounded-2xl border-2 border-slate-100 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-slate-900">Teacher sign up</CardTitle>
            <CardDescription className="text-slate-600">
              Join as a student teacher or qualified teacher. You&apos;ll complete verification next.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" name="fullName" placeholder="Alex Teacher" required className="rounded-xl border-2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="alex@example.com" required className="rounded-xl border-2" />
                {error.email && <p className="text-sm text-destructive">{error.email[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" minLength={8} required className="rounded-xl border-2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input id="mobile" name="mobile" type="tel" required className="rounded-xl border-2" />
              </div>
              <div className="space-y-2">
                <Label>Teacher type</Label>
                <Select value={teacherType} onValueChange={setTeacherType} required>
                  <SelectTrigger className="rounded-xl border-2">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT_TEACHER">Student teacher</SelectItem>
                    <SelectItem value="PROFESSIONAL_TEACHER">Professional teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {teacherType === "STUDENT_TEACHER" && (
                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Input id="university" name="university" placeholder="e.g. UWA" className="rounded-xl border-2" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="schoolName">Current school (if employed)</Label>
                <Input id="schoolName" name="schoolName" placeholder="Used for conflict-of-interest" className="rounded-xl border-2" />
              </div>
              <div className="space-y-2">
                <Label>Subjects you can teach</Label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => (
                    <label key={s} className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={subjects.includes(s)}
                        onChange={(e) =>
                          setSubjects((prev) =>
                            e.target.checked ? [...prev, s] : prev.filter((x) => x !== s)
                          )
                        }
                      />
                      {s}
                    </label>
                  ))}
                </div>
                {subjects.length === 0 && (
                  <p className="text-sm text-muted-foreground">Select at least one</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Year levels you teach</Label>
                <div className="flex flex-wrap gap-2">
                  {YEAR_LEVELS.map((y) => (
                    <label key={y} className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={yearLevels.includes(y)}
                        onChange={(e) =>
                          setYearLevels((prev) =>
                            e.target.checked ? [...prev, y] : prev.filter((x) => x !== y)
                          )
                        }
                      />
                      Year {y}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wwccNumber">WWCC number</Label>
                <Input id="wwccNumber" name="wwccNumber" placeholder="Working With Children Check" className="rounded-xl border-2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wwccExpiry">WWCC expiry (YYYY-MM-DD)</Label>
                <Input id="wwccExpiry" name="wwccExpiry" type="date" className="rounded-xl border-2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacherRegistrationNumber">Teacher Registration number (TRB / Register of Teachers)</Label>
                <Input id="teacherRegistrationNumber" name="teacherRegistrationNumber" placeholder="e.g. TRBWA registration number" className="rounded-xl border-2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacherRegistrationExpiry">Teacher Registration expiry (YYYY-MM-DD)</Label>
                <Input id="teacherRegistrationExpiry" name="teacherRegistrationExpiry" type="date" className="rounded-xl border-2" />
              </div>
              <p className="text-sm text-slate-600">
                Your application will be reviewed by admin. We will confirm your WWCC and Teacher Registration before approving you to take sessions.
              </p>
              <Button
                type="submit"
                className="w-full rounded-full bg-[hsl(var(--hero-teal))] py-6 hover:bg-[hsl(var(--hero-teal))]/90"
              >
                Create account
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">
              <Link href="/login" className="font-medium text-[hsl(var(--hero-teal))] underline">
                Already have an account? Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
