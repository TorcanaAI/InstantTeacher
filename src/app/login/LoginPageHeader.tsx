import Link from "next/link";
import SiteLogo from "@/components/SiteLogo";
import { Button } from "@/components/ui/button";

/** Static header for login page — no auth() call, avoids server errors and chunk issues. */
export default function LoginPageHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex min-h-[10rem] items-center justify-between gap-4 px-4 py-3">
        <SiteLogo priority />
        <nav className="flex items-center gap-3">
          <Link
            href="/signup"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign up
          </Link>
          <Link
            href="/auth/login"
            className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline"
          >
            Admin
          </Link>
          <Button size="sm" className="rounded-full" asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
