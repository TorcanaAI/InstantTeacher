"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
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

const REDIRECT_URL = "/admin/dashboard";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl: REDIRECT_URL,
      });
      if (res?.error || res?.ok === false) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }
      const targetUrl =
        res && "url" in res && typeof (res as { url?: string }).url === "string"
          ? (res as { url: string }).url
          : REDIRECT_URL;
      await new Promise((r) => setTimeout(r, 150));
      window.location.assign(
        targetUrl.startsWith("http") ? targetUrl : `${window.location.origin}${targetUrl}`
      );
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md rounded-2xl border-2 border-slate-200 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-slate-900">Admin login</CardTitle>
          <CardDescription>
            Sign in with your admin email and password to access the dashboard.
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
                placeholder="support@torcanaai.com"
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
              className="w-full rounded-full bg-slate-900 py-6 text-base hover:bg-slate-800"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-600">
            <Link href="/login" className="font-medium text-slate-900 underline">
              Back to main login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
