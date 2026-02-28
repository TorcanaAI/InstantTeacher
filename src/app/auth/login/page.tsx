import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import AdminLoginForm from "./AdminLoginForm";

export const dynamic = "force-dynamic";

/** Admin login — public route. After sign-in, redirects to /admin/dashboard. */
export default async function AuthLoginPage() {
  const session = await auth();
  if (session?.user && (session.user as { role?: Role }).role === Role.ADMIN) {
    redirect("/admin/dashboard");
  }
  return <AdminLoginForm />;
}
