import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/admin" className="font-semibold">
            InstantTeacher Admin
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/admin" className="text-sm text-slate-600 hover:text-slate-900">
              Dashboard
            </Link>
            <Link href="/admin/sessions" className="text-sm text-slate-600 hover:text-slate-900">
              Sessions
            </Link>
            <Link href="/admin/registrations" className="text-sm text-slate-600 hover:text-slate-900">
              Registrations
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
            <Link href="/admin/video-test" className="text-sm text-slate-600 hover:text-slate-900">
              Video test
            </Link>
            <form action="/api/auth/signout" method="POST">
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
