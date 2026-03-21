"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { registerParent } from "@/app/actions/auth";
import { BookOpen } from "lucide-react";

type Step = 1 | 2;

export default function SignupFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<Record<string, string[]>>({});

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [suburb, setSuburb] = useState("");

  const canProceedStep1 = fullName.trim().length >= 2 && email.trim().length > 0 && password.length >= 8;
  const canSubmitParent = mobile.trim().length >= 8 && suburb.trim().length >= 2;

  function handleNextStep1() {
    if (!canProceedStep1) return;
    setError({});
    setStep(2);
  }

  function handleBack() {
    setError({});
    setStep(1);
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

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-2 w-12 rounded-full transition-colors ${
                step >= s ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <Card className="rounded-2xl border-2 border-border shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-foreground">Create your account</CardTitle>
              <CardDescription className="text-muted-foreground">
                Homework help with Sunshine and Jack. Start with your name, email, and password.
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
                className="w-full rounded-full py-6 disabled:opacity-50"
              >
                Next
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="rounded-2xl border-2 border-border shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl text-foreground">Almost there</CardTitle>
              <CardDescription className="text-muted-foreground">
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
                    placeholder="e.g. Subiaco, Perth"
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
                    className="flex-1 rounded-full py-6 disabled:opacity-50"
                  >
                    Create account
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
