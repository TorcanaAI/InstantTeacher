"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
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
import { loginAdminWithCredentials } from "@/app/actions/login";

function AdminSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full rounded-full bg-slate-900 py-6 text-base hover:bg-slate-800"
      disabled={pending}
    >
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export default function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [state, formAction] = useFormState(loginAdminWithCredentials, null);

  const [urlError, setUrlError] = useState("");

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "forbidden") {
      setUrlError("That account is not an admin. Use the main login for parent accounts.");
    } else if (err === "CredentialsSignin" || err === "Callback") {
      setUrlError("Invalid email or password.");
    } else if (err === "Configuration") {
      setUrlError(
        "Server configuration issue. Set AUTH_SECRET and ensure NEXTAUTH_URL (or NEXT_PUBLIC_APP_URL) matches this site’s URL in Vercel."
      );
    } else {
      setUrlError("");
    }
  }, [searchParams]);

  const error = state?.error ?? urlError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md rounded-2xl border-2 border-slate-200 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-slate-900">Admin login</CardTitle>
          <CardDescription>
            Sign in with your admin email and password to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {error && (
              <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                name="email"
                type="text"
                inputMode="email"
                autoCapitalize="none"
                placeholder="support@torcanaai.com"
                required
                autoComplete="email"
                className="rounded-xl border-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="rounded-xl border-2"
              />
            </div>
            <AdminSubmitButton />
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
