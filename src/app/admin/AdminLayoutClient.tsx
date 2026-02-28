"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Role } from "@prisma/client";
import SignOutButton from "@/components/SignOutButton";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!session?.user || (session.user as { role?: Role }).role !== Role.ADMIN) {
    router.replace("/auth/login");
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Redirecting to admin login…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/admin/dashboard" className="font-semibold">
            InstantTeacher Admin
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
              Dashboard
            </Link>
            <Link href="/admin/sessions" className="text-sm text-slate-600 hover:text-slate-900">
              Sessions
            </Link>
            <Link href="/admin/registrations" className="text-sm text-slate-600 hover:text-slate-900">
              Registrations
            </Link>
            <Link href="/admin/parents" className="text-sm text-slate-600 hover:text-slate-900">
              Parents
            </Link>
            <Link href="/admin/teachers" className="text-sm text-slate-600 hover:text-slate-900">
              Teachers
            </Link>
            <Link href="/admin/shifts" className="text-sm text-slate-600 hover:text-slate-900">
              Shifts
            </Link>
            <Link href="/admin/disputes" className="text-sm text-slate-600 hover:text-slate-900">
              Disputes
            </Link>
            <Link href="/admin/sunshine" className="text-sm text-slate-600 hover:text-slate-900">
              Sunshine
            </Link>
            <Link href="/admin/books" className="text-sm text-slate-600 hover:text-slate-900">
              Books
            </Link>
            <Link href="/admin/sunshine-test" className="text-sm text-slate-600 hover:text-slate-900">
              Sunshine test
            </Link>
            <Link href="/admin/sunshine-reading-test" className="text-sm text-slate-600 hover:text-slate-900">
              Reading test
            </Link>
            <Link href="/admin/video-test" className="text-sm text-slate-600 hover:text-slate-900">
              Video test
            </Link>
            <SignOutButton variant="ghost" size="sm" callbackUrl="/" />
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
