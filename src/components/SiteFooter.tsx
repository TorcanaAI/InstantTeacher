import Link from "next/link";
import SiteLogo from "@/components/SiteLogo";
import { HelpCircle, CreditCard, LogIn } from "lucide-react";

const navClass = "text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <SiteLogo className="shrink-0" />
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm">
            <Link href="/how-it-works" className={`flex items-center gap-1.5 ${navClass}`}>
              <HelpCircle className="h-4 w-4" />
              How it works
            </Link>
            <Link href="/pricing" className={`flex items-center gap-1.5 ${navClass}`}>
              <CreditCard className="h-4 w-4" />
              Pricing
            </Link>
            <Link href="/login" className={`flex items-center gap-1.5 ${navClass}`}>
              <LogIn className="h-4 w-4" />
              Log in
            </Link>
          </nav>
        </div>
        <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm">
          <Link href="/legal/privacy" className={navClass}>
            Privacy
          </Link>
          <Link href="/legal/terms" className={navClass}>
            Terms
          </Link>
        </nav>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Need help?{" "}
          <a href="mailto:support@torcanaai.com" className={navClass}>
            support@torcanaai.com
          </a>
        </p>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} InstantTeacher. Smart Support, Anytime. Australia.
        </p>
      </div>
    </footer>
  );
}
