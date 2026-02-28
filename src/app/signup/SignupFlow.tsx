"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { registerTeacher, registerParent } from "@/app/actions/auth";
import { BookOpen, GraduationCap } from "lucide-react";

type Step = 1 | 2 | 3;
type Role = "TEACHER" | "FINAL_YEAR_STUDENT" | "PARENT";

// Consent state for teachers (all required before Join is enabled)
const TEACHER_CONSENT_KEYS = [
  "abn",
  "consentTerms",
  "digitalContract",
  "childSafety",
] as const;
type ConsentKey = (typeof TEACHER_CONSENT_KEYS)[number];

export default function SignupFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<Record<string, string[]>>({});

  // Step 1
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2
  const [role, setRole] = useState<Role | "">("");

  // Parent step 3
  const [mobile, setMobile] = useState("");
  const [suburb, setSuburb] = useState("");

  // Teacher step 3
  const [teacherType, setTeacherType] = useState<string>("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [yearLevels, setYearLevels] = useState<number[]>([]);
  const [university, setUniversity] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [wwccNumber, setWwccNumber] = useState("");
  const [wwccExpiry, setWwccExpiry] = useState("");
  const [teacherRegistrationNumber, setTeacherRegistrationNumber] = useState("");
  const [teacherRegistrationExpiry, setTeacherRegistrationExpiry] = useState("");

  // Teacher compliance (all required)
  const [consent, setConsent] = useState<Record<ConsentKey, boolean>>({
    abn: false,
    consentTerms: false,
    digitalContract: false,
    childSafety: false,
  });

  // Pre-select role from URL e.g. /signup?role=teacher
  useEffect(() => {
    const r = searchParams.get("role")?.toLowerCase();
    if (r === "teacher" || r === "final-year") setRole("TEACHER");
    if (r === "parent") setRole("PARENT");
  }, [searchParams]);

  const isTeacherFlow = role === "TEACHER" || role === "FINAL_YEAR_STUDENT";
  const allConsentChecked = TEACHER_CONSENT_KEYS.every((k) => consent[k]);
  const teacherFormValid =
    isTeacherFlow &&
    (role === "FINAL_YEAR_STUDENT" || teacherType) &&
    subjects.length > 0 &&
    yearLevels.length > 0 &&
    mobile.trim().length >= 8;

  const canProceedStep1 =
    fullName.trim().length >= 2 &&
    email.trim().length > 0 &&
    password.length >= 8;
  const canProceedStep2 = role !== "";
  const canSubmitParent =
    role === "PARENT" && mobile.trim().length >= 8 && suburb.trim().length >= 2;
  const canSubmitTeacher =
    isTeacherFlow &&
    teacherFormValid &&
    allConsentChecked;

  function handleNextStep1() {
    if (!canProceedStep1) return;
    setError({});
    setStep(2);
  }

  function handleNextStep2() {
    if (!canProceedStep2) return;
    setError({});
    setStep(3);
  }

  function handleBack() {
    setError({});
    setStep((s) => (s > 1 ? (s - 1) as Step : 1));
  }

  async function handleSubmitParent(e: React.FormEvent) {
    e.preventDefault();
    setError({});
    const formData = new FormData();
    formData.set("fullName", fullName.trim());
    formData.set("email", email.trim());
    formData.set("password", password);
    formData.set("mobile", mobile.trim());
    formData.set("suburb", suburb.trim());
    const result = await registerParent(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/parent/dashboard");
  }

  async function handleSubmitTeacher(e: React.FormEvent) {
    e.preventDefault();
    if (!allConsentChecked) return;
    setError({});
    const formData = new FormData();
    formData.set("fullName", fullName.trim());
    formData.set("email", email.trim());
    formData.set("password", password);
    formData.set("mobile", mobile.trim());
    formData.set("teacherType", role === "FINAL_YEAR_STUDENT" ? "STUDENT_TEACHER" : teacherType);
    formData.set("subjects", JSON.stringify(subjects));
    formData.set("yearLevels", JSON.stringify(yearLevels));
    formData.set("university", university);
    formData.set("schoolName", schoolName);
    formData.set("wwccNumber", wwccNumber);
    formData.set("wwccExpiry", wwccExpiry);
    formData.set("teacherRegistrationNumber", teacherRegistrationNumber);
    formData.set("teacherRegistrationExpiry", teacherRegistrationExpiry);
    // Future: consent timestamp + IP for backend
    formData.set("consentTimestamp", new Date().toISOString());
    const result = await registerTeacher(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/teacher/dashboard");
  }

  const sharedHeader = (
    <header className="border-b border-teal-100 bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-[hsl(var(--hero-teal))]">
          InstantTeacher
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-[hsl(var(--hero-teal))]">
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(173,58%,96%)] to-white">
      {sharedHeader}

      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Step indicator */}
          <div className="mb-6 flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full ${
                  step >= s ? "bg-[hsl(var(--hero-teal))]" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Account details */}
          {step === 1 && (
            <Card className="rounded-2xl border-2 border-slate-100 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-slate-900">Create your account</CardTitle>
                <CardDescription className="text-slate-600">
                  Start with your name, email, and a secure password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Smith"
                    required
                    className="rounded-xl border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="rounded-xl border-2"
                  />
                  {error.email && <p className="text-sm text-destructive">{error.email[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                    className="rounded-xl border-2"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleNextStep1}
                  disabled={!canProceedStep1}
                  className="w-full rounded-full bg-[hsl(var(--hero-teal))] py-6 hover:bg-[hsl(var(--hero-teal))]/90 disabled:opacity-50"
                >
                  Next
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Role selection */}
          {step === 2 && (
            <Card className="rounded-2xl border-2 border-slate-100 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-slate-900">How will you use Instant Teacher?</CardTitle>
                <CardDescription className="text-slate-600">
                  Choose one option. You can always contact support if your situation changes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                      role === "TEACHER"
                        ? "border-[hsl(var(--hero-teal))] bg-[hsl(var(--hero-teal))]/5"
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      checked={role === "TEACHER"}
                      onChange={() => setRole("TEACHER")}
                      className="mt-1"
                    />
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--hero-amber))]/20">
                        <GraduationCap className="h-5 w-5 text-[hsl(var(--hero-amber))]" />
                      </div>
                      <div>
                        <span className="font-medium text-slate-900">Teacher</span>
                        <p className="text-sm text-slate-600">I am a qualified teacher and want to support students through the platform.</p>
                      </div>
                    </div>
                  </label>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                      role === "FINAL_YEAR_STUDENT"
                        ? "border-[hsl(var(--hero-teal))] bg-[hsl(var(--hero-teal))]/5"
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      checked={role === "FINAL_YEAR_STUDENT"}
                      onChange={() => setRole("FINAL_YEAR_STUDENT")}
                      className="mt-1"
                    />
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--hero-amber))]/20">
                        <GraduationCap className="h-5 w-5 text-[hsl(var(--hero-amber))]" />
                      </div>
                      <div>
                        <span className="font-medium text-slate-900">Final-year student (18+)</span>
                        <p className="text-sm text-slate-600">I am in my final year of a teaching degree and am 18 or over.</p>
                      </div>
                    </div>
                  </label>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                      role === "PARENT"
                        ? "border-[hsl(var(--hero-teal))] bg-[hsl(var(--hero-teal))]/5"
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      checked={role === "PARENT"}
                      onChange={() => setRole("PARENT")}
                      className="mt-1"
                    />
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--hero-teal))]/10">
                        <BookOpen className="h-5 w-5 text-[hsl(var(--hero-teal))]" />
                      </div>
                      <div>
                        <span className="font-medium text-slate-900">Parent / Guardian</span>
                        <p className="text-sm text-slate-600">I want to book tutoring sessions for my child.</p>
                      </div>
                    </div>
                  </label>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={handleBack} className="rounded-full">
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextStep2}
                    disabled={!canProceedStep2}
                    className="flex-1 rounded-full bg-[hsl(var(--hero-teal))] hover:bg-[hsl(var(--hero-teal))]/90 disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Parent */}
          {step === 3 && role === "PARENT" && (
            <Card className="rounded-2xl border-2 border-slate-100 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-slate-900">Almost there</CardTitle>
                <CardDescription className="text-slate-600">
                  Add your contact details so we can support you and your child.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitParent} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile number</Label>
                    <Input
                      id="mobile"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      type="tel"
                      placeholder="04XX XXX XXX"
                      required
                      className="rounded-xl border-2"
                    />
                    {error.mobile && <p className="text-sm text-destructive">{error.mobile[0]}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="suburb">Suburb</Label>
                    <Input
                      id="suburb"
                      value={suburb}
                      onChange={(e) => setSuburb(e.target.value)}
                      placeholder="e.g. Subiaco, Fremantle"
                      required
                      className="rounded-xl border-2"
                    />
                    {error.suburb && <p className="text-sm text-destructive">{error.suburb[0]}</p>}
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={handleBack} className="rounded-full">
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={!canSubmitParent}
                      className="flex-1 rounded-full bg-[hsl(var(--hero-teal))] py-6 hover:bg-[hsl(var(--hero-teal))]/90 disabled:opacity-50"
                    >
                      Create account
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Teacher / Final-year student — profile + compliance */}
          {step === 3 && isTeacherFlow && (
            <Card className="rounded-2xl border-2 border-slate-100 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-slate-900">
                  {role === "FINAL_YEAR_STUDENT" ? "Final-year student sign up" : "Teacher sign up"}
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Set your profile and review the clear expectations we have for all educators.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitTeacher} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      type="tel"
                      required
                      className="rounded-xl border-2"
                    />
                    {error.mobile && <p className="text-sm text-destructive">{error.mobile[0]}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Teacher type</Label>
                    <Select
                      value={role === "FINAL_YEAR_STUDENT" ? "STUDENT_TEACHER" : teacherType}
                      onValueChange={setTeacherType}
                      required
                    >
                      <SelectTrigger className="rounded-xl border-2">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENT_TEACHER">Student teacher / Final-year</SelectItem>
                        <SelectItem value="PROFESSIONAL_TEACHER">Professional teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(teacherType === "STUDENT_TEACHER" || role === "FINAL_YEAR_STUDENT") && (
                    <div className="space-y-2">
                      <Label htmlFor="university">University</Label>
                      <Input
                        id="university"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        placeholder="e.g. UWA"
                        className="rounded-xl border-2"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">Current school (if employed)</Label>
                    <Input
                      id="schoolName"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="Used for conflict-of-interest only"
                      className="rounded-xl border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subjects you can teach</Label>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS.map((s) => (
                        <label key={s} className="flex items-center gap-1.5 text-sm">
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
                    {subjects.length === 0 && <p className="text-sm text-muted-foreground">Select at least one</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Year levels you teach</Label>
                    <div className="flex flex-wrap gap-2">
                      {YEAR_LEVELS.map((y) => (
                        <label key={y} className="flex items-center gap-1.5 text-sm">
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
                  <p className="text-sm text-slate-600">
                    Optional below: you can add Working With Children Check and Teacher Registration details now or later. Your application will be reviewed before you can take sessions.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="wwccNumber">WWCC number</Label>
                      <Input
                        id="wwccNumber"
                        value={wwccNumber}
                        onChange={(e) => setWwccNumber(e.target.value)}
                        placeholder="Working With Children Check"
                        className="rounded-xl border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wwccExpiry">WWCC expiry</Label>
                      <Input
                        id="wwccExpiry"
                        type="date"
                        value={wwccExpiry}
                        onChange={(e) => setWwccExpiry(e.target.value)}
                        className="rounded-xl border-2"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="teacherRegistrationNumber">Teacher Registration (TRB)</Label>
                      <Input
                        id="teacherRegistrationNumber"
                        value={teacherRegistrationNumber}
                        onChange={(e) => setTeacherRegistrationNumber(e.target.value)}
                        placeholder="e.g. TRBWA"
                        className="rounded-xl border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teacherRegistrationExpiry">Registration expiry</Label>
                      <Input
                        id="teacherRegistrationExpiry"
                        type="date"
                        value={teacherRegistrationExpiry}
                        onChange={(e) => setTeacherRegistrationExpiry(e.target.value)}
                        className="rounded-xl border-2"
                      />
                    </div>
                  </div>

                  {/* ——— Mandatory compliance (teachers) ——— */}
                  <div className="space-y-6 rounded-xl border-2 border-[hsl(var(--hero-teal))]/20 bg-[hsl(var(--hero-teal))]/5 p-4">
                    <h3 className="text-sm font-semibold text-slate-700">
                      Your safety matters — clear expectations
                    </h3>
                    <p className="text-xs text-slate-600">
                      Please read each section and tick the boxes below. All are required before joining.
                    </p>

                    {/* A. ABN Declaration */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-900">ABN requirement</h4>
                      <p className="text-sm text-slate-700">
                        Teachers offering paid educational services through Instant Teacher operate as independent contractors and must hold, or be willing to obtain, an Australian Business Number (ABN).
                      </p>
                      <label className="flex cursor-pointer items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={consent.abn}
                          onChange={(e) => setConsent((c) => ({ ...c, abn: e.target.checked }))}
                          className="mt-0.5"
                        />
                        <span>I confirm that I have an ABN or understand that I must obtain one before receiving payments.</span>
                      </label>
                    </div>

                    {/* B. Consent & Legal Agreement */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-900">Consent & agreement</h4>
                      <p className="text-sm text-slate-700">
                        By joining Instant Teacher, you acknowledge that: you are engaging with the platform as an independent educator; you are not an employee of Instant Teacher; and you are responsible for your own tax, insurance, and compliance obligations.
                      </p>
                      <label className="flex cursor-pointer items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={consent.consentTerms}
                          onChange={(e) => setConsent((c) => ({ ...c, consentTerms: e.target.checked }))}
                          className="mt-0.5"
                        />
                        <span>I agree and consent to these terms.</span>
                      </label>
                    </div>

                    {/* C. Digital Contract */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-900">Digital agreement</h4>
                      <p className="text-sm text-slate-700">
                        By clicking &quot;Join Instant Teacher&quot;, you agree that this action forms a legally binding digital agreement between you and Instant Teacher, governed by Australian law.
                      </p>
                      <label className="flex cursor-pointer items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={consent.digitalContract}
                          onChange={(e) => setConsent((c) => ({ ...c, digitalContract: e.target.checked }))}
                          className="mt-0.5"
                        />
                        <span>I understand and agree that this constitutes a digital contractual agreement.</span>
                      </label>
                    </div>

                    {/* D. Child Safety & Professional Conduct */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-900">Professional conduct & safety</h4>
                      <p className="text-sm text-slate-700">
                        Instant Teacher is committed to safe, respectful, and professional educational interactions. All educators agree to maintain appropriate conduct, confidentiality, and duty of care when engaging with students.
                      </p>
                      <label className="flex cursor-pointer items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={consent.childSafety}
                          onChange={(e) => setConsent((c) => ({ ...c, childSafety: e.target.checked }))}
                          className="mt-0.5"
                        />
                        <span>I agree to uphold professional conduct and child-safe standards.</span>
                      </label>
                    </div>

                    <p className="text-xs text-slate-500">
                      You can read our{" "}
                      <Link href="/legal/privacy" className="text-[hsl(var(--hero-teal))] underline">Privacy Policy</Link>
                      ,{" "}
                      <Link href="/legal/terms" className="text-[hsl(var(--hero-teal))] underline">Terms of Use</Link>
                      ,{" "}
                      <Link href="/legal/contractor-agreement" className="text-[hsl(var(--hero-teal))] underline">Contractor Agreement</Link>
                      , and{" "}
                      <Link href="/legal/child-safety" className="text-[hsl(var(--hero-teal))] underline">Child Safety & Conduct</Link>
                      {" "}for full details.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={handleBack} className="rounded-full">
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={!canSubmitTeacher}
                      className="flex-1 rounded-full bg-[hsl(var(--hero-teal))] py-6 hover:bg-[hsl(var(--hero-teal))]/90 disabled:opacity-50"
                    >
                      Join Instant Teacher
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <p className="mt-6 text-center text-sm text-slate-600">
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
