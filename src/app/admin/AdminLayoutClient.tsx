"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Role } from "@prisma/client";
import SignOutButton from "@/components/SignOutButton";
import { LayoutDashboard, Users, MessageCircle, LogOut, Ticket } from "lucide-react";

const navLinkClass =
  "flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!session?.user || (session.user as { role?: Role }).role !== Role.ADMIN) {
    router.replace("/auth/login");
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Redirecting to admin login…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          <Link
            href="/admin/dashboard"
            className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
          >
            Instant Teacher Admin
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/admin/dashboard" className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/admin/parents" className={navLinkClass}>
              <Users className="h-4 w-4" />
              Parents
            </Link>
            <Link href="/admin/trials" className={navLinkClass}>
              <Ticket className="h-4 w-4" />
              Trial codes
            </Link>
            <Link href="/admin/sunshine-test" className={navLinkClass}>
              <MessageCircle className="h-4 w-4" />
              Test Sunshine & Jack
            </Link>
            <SignOutButton variant="ghost" size="sm" callbackUrl="/">
              <LogOut className="h-4 w-4 mr-1.5" />
              Sign out
            </SignOutButton>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  );
}
