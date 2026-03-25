"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export type LoginState = { error?: string } | null;

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
    if (!url || /[?&]error=/.test(url)) {
      return { error: options.errorMessage };
    }
    redirect(options.redirectTo);
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
