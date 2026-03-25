"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export type LoginState =
  | { error: string }
  | { success: true; redirectTo: string }
  | null;

function isFailedAuthRedirect(url: string): boolean {
  const u = url.toLowerCase();
  if (!u) return true;
  if (u.includes("error=credentialssignin") || u.includes("error=credentials")) return true;
  if (u.includes("error=configuration") || u.includes("error=callback")) return true;
  if (u.includes("/login") && u.includes("error=")) return true;
  if (u.includes("/auth/login") && u.includes("error=")) return true;
  return false;
}

/**
 * Server-side credentials sign-in. Does not call `redirect()` — useFormState can swallow that.
 * Client must `window.location.assign(redirectTo)` when `success` is true (cookies already set).
 */
async function signInWithCredentials(
  formData: FormData,
  options: { redirectTo: string; errorMessage: string }
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      redirectTo: options.redirectTo,
    });
    const url = typeof result === "string" ? result : "";

    if (isFailedAuthRedirect(url)) {
      return { error: options.errorMessage };
    }

    return { success: true, redirectTo: options.redirectTo };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: options.errorMessage };
    }
    throw error;
  }
}

export async function loginWithCredentials(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  return signInWithCredentials(formData, {
    redirectTo: "/dashboard",
    errorMessage:
      "Invalid email or password. Check your details or sign up if you don't have an account yet.",
  });
}

export async function loginAdminWithCredentials(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  return signInWithCredentials(formData, {
    redirectTo: "/admin/dashboard",
    errorMessage: "Invalid email or password.",
  });
}
