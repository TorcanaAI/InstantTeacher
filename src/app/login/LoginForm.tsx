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
import { loginWithCredentials } from "@/app/actions/login";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full rounded-full py-6 text-base" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [state, formAction] = useFormState(loginWithCredentials, null);

  const [urlError, setUrlError] = useState("");

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "CredentialsSignin" || err === "Callback") {
      setUrlError(
        "Invalid email or password. Check your details or sign up if you don't have an account yet."
      );
    } else if (err === "Configuration") {
      setUrlError(
        "Server configuration issue. If you're the site owner, set AUTH_SECRET and NEXTAUTH_URL in Vercel → Settings → Environment Variables."
      );
    } else {
      setUrlError("");
    }
  }, [searchParams]);

  useEffect(() => {
    if (state && "success" in state && state.success && state.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state]);

  const error = state && "error" in state ? state.error : urlError;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md rounded-2xl border-2 border-border shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-foreground">Log in</CardTitle>
          <CardDescription>
            Enter your email and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {error && (
              <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="text"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="rounded-xl border-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="rounded-xl border-2"
              />
            </div>
            <SubmitButton />
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary underline">
              Sign up
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            <Link
              href="/login?callbackUrl=/admin"
              className="font-medium text-primary underline hover:no-underline"
            >
              Log in as admin
            </Link>
            {" · "}
            <Link href="/setup" className="font-medium text-primary underline hover:no-underline">
              Having trouble?
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
