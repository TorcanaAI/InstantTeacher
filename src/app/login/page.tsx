"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
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

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Show error from URL (e.g. after NextAuth redirects back on failure)
  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "CredentialsSignin" || err === "Callback") {
      setError("Invalid email or password. Check your details or sign up if you don't have an account yet.");
    } else if (err === "Configuration") {
      setError("Server configuration issue. If you're the site owner, set AUTH_SECRET and NEXTAUTH_URL in Vercel → Settings → Environment Variables.");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error || res?.ok === false) {
        setError("Invalid email or password. Check your details or sign up if you don't have an account yet.");
        setLoading(false);
        return;
      }
      // Success: use URL from response or callbackUrl; full-page navigation so the session cookie is sent
      const targetUrl =
        (res && "url" in res && typeof (res as { url?: string }).url === "string" && (res as { url: string }).url)
          ? (res as { url: string }).url
          : callbackUrl;
      const fullUrl = targetUrl.startsWith("http") ? targetUrl : `${window.location.origin}${targetUrl}`;
      // Brief delay so the session cookie is committed before navigation
      await new Promise((r) => setTimeout(r, 200));
      window.location.href = fullUrl;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(173,58%,96%)] to-white">
      <header className="border-b border-teal-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold text-[hsl(var(--hero-teal))]">
            InstantTeacher
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/signup" className="text-sm font-medium text-slate-600 hover:text-[hsl(var(--hero-teal))]">
              Sign up
            </Link>
            <Link href="/auth/login" className="text-sm font-medium text-slate-500 hover:text-slate-700">
              Admin
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md rounded-2xl border-2 border-slate-100 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-slate-900">Log in</CardTitle>
            <CardDescription>
              Enter your email and password to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="rounded-xl border-2"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-full bg-[hsl(var(--hero-teal))] py-6 text-base hover:bg-[hsl(var(--hero-teal))]/90"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-[hsl(var(--hero-teal))] underline">
                Sign up
              </Link>
            </p>
            <p className="mt-3 text-center text-sm text-slate-500">
              <Link href="/login?callbackUrl=/admin" className="font-medium text-[hsl(var(--hero-teal))] underline hover:no-underline">
                Log in as admin
              </Link>
              {" · "}
              <Link href="/setup" className="font-medium text-[hsl(var(--hero-teal))] underline hover:no-underline">
                Having trouble?
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[hsl(173,58%,96%)]">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
