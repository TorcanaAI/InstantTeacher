import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

export default async function DashboardPage() {
  let session;
  try {
    session = await auth();
  } catch (err) {
    console.error("[Dashboard] auth() failed:", err);
    redirect("/login?callbackUrl=/dashboard&error=Configuration");
  }
  if (!session?.user) redirect("/login");
  // Ensure role is on session (set by JWT callback). If missing, re-auth.
  const role = session.user.role;
  if (!role) redirect("/login?callbackUrl=/dashboard");

  switch (role) {
    case Role.ADMIN:
      redirect("/admin");
    case Role.TEACHER:
      redirect("/teacher/dashboard");
    case Role.PARENT:
      redirect("/parent/dashboard");
    case Role.STUDENT:
      redirect("/parent/dashboard"); // students use parent flow for now
    default:
      redirect("/");
  }
}
