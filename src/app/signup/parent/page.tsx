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
import { registerParent } from "@/app/actions/auth";

export default function SignupParentPage() {
  const router = useRouter();
  const [error, setError] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError({});
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await registerParent(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/parent/dashboard");
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
            <CardTitle className="text-2xl text-slate-900">Parent sign up</CardTitle>
            <CardDescription className="text-slate-600">
              Create an account to book tutoring sessions for your child.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
                <Input
                id="fullName"
                name="fullName"
                placeholder="Jane Smith"
                required
                className="rounded-xl border-2"
              />
              {error.fullName && (
                <p className="text-sm text-destructive">{error.fullName[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                required
                className="rounded-xl border-2"
              />
              {error.email && (
                <p className="text-sm text-destructive">{error.email[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                minLength={8}
                required
                className="rounded-xl border-2"
              />
              {error.password && (
                <p className="text-sm text-destructive">{error.password[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile number</Label>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                placeholder="04XX XXX XXX"
                required
                className="rounded-xl border-2"
              />
              {error.mobile && (
                <p className="text-sm text-destructive">{error.mobile[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="suburb">Suburb</Label>
              <Input
                id="suburb"
                name="suburb"
                placeholder="e.g. Subiaco, Fremantle"
                required
                className="rounded-xl border-2"
              />
              {error.suburb && (
                <p className="text-sm text-destructive">{error.suburb[0]}</p>
              )}
            </div>
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
