import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import SiteLogo from "@/components/SiteLogo";
import SignOutButton from "@/components/SignOutButton";
import {
  HelpCircle,
  CreditCard,
  LayoutDashboard,
  LogIn,
  UserPlus,
} from "lucide-react";

const navLinkClass =
  "flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

/** Public site header: compact bar with logo, nav, and CTA. */
export async function SiteHeaderPublic() {
  let session = null;
  try {
    session = await auth();
  } catch (e) {
    console.error("[SiteHeader] auth() failed:", e);
  }
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex min-h-[10rem] items-center justify-between gap-4 px-4 py-3">
        <SiteLogo priority />
        <nav className="hidden items-center gap-6 sm:flex">
          <Link href="/how-it-works" className={navLinkClass}>
            <HelpCircle className="h-4 w-4" />
            How it works
          </Link>
          <Link href="/pricing" className={navLinkClass}>
            <CreditCard className="h-4 w-4" />
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {session ? (
            <Button asChild size="sm" className="rounded-full">
              <Link href="/parent/dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Link href="/login" className={`${navLinkClass} sm:inline-flex`}>
                <LogIn className="h-4 w-4 sm:hidden" />
                Sign in
              </Link>
              <Link
                href="/auth/login"
                className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline"
              >
                Admin
              </Link>
              <Button size="sm" className="rounded-full" asChild>
                <Link href="/signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Get started
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/** Parent area header: logo, Homework / Subscribe, sign out. */
export function SiteHeaderParent({
  logoHref = "/parent/dashboard",
}: {
  logoHref?: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex min-h-[10rem] items-center justify-between gap-4 px-4 py-3">
        <SiteLogo href={logoHref} />
        <nav className="flex items-center gap-4">
          <Link href="/parent/homework" className={navLinkClass}>
            Homework help
          </Link>
          <Link href="/parent/subscribe" className={navLinkClass}>
            Subscribe
          </Link>
          <SignOutButton variant="ghost" size="sm" callbackUrl="/" />
        </nav>
      </div>
    </header>
  );
}
