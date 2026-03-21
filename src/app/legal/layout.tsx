import Link from "next/link";
import SiteLogo from "@/components/SiteLogo";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(173,58%,96%)] to-white">
      <header className="sticky top-0 z-10 border-b border-teal-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex min-h-32 items-center justify-between px-4 py-4">
          <SiteLogo height={104} />
          <nav className="flex items-center gap-4">
            <Link href="/legal/privacy" className="text-sm text-slate-600 hover:text-[hsl(var(--hero-teal))]">
              Privacy
            </Link>
            <Link href="/legal/terms" className="text-sm text-slate-600 hover:text-[hsl(var(--hero-teal))]">
              Terms
            </Link>
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-[hsl(var(--hero-teal))]">
              Home
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto max-w-3xl px-4 py-10">{children}</main>
    </div>
  );
}
