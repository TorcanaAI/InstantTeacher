import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import AdminLoginForm from "./AdminLoginForm";

export const dynamic = "force-dynamic";

/** Admin login — public route. After sign-in, redirects to /admin/dashboard. */
export default async function AuthLoginPage() {
  try {
    const session = await auth();
    if (session?.user && (session.user as { role?: Role }).role === Role.ADMIN) {
      redirect("/admin/dashboard");
    }
  } catch (e) {
    console.error("[Auth login] auth() failed:", e);
  }
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-100">Loading…</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
