import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import AdminLayoutClient from "./AdminLayoutClient";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user ? (session.user as { role?: Role }).role : undefined;
  if (!session || role !== Role.ADMIN) {
    redirect("/auth/login");
  }
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
