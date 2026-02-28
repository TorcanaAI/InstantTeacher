import Link from "next/link";

/**
 * Global support footer — appears on every page via app/layout.tsx.
 * Legal links (Privacy, Terms, Contractor Agreement, Child Safety) + support.
 * Teal + warm amber; professional, clear, non-intimidating.
 */
export default function SupportFooter() {
  return (
    <footer className="mt-auto shrink-0 border-t border-slate-100 bg-slate-50/50 py-6">
      <div className="container mx-auto flex flex-col items-center gap-3 px-4">
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm">
          <Link
            href="/legal/privacy"
            className="text-slate-600 underline decoration-slate-400 underline-offset-2 hover:text-[hsl(var(--hero-teal))] hover:decoration-[hsl(var(--hero-teal))]"
          >
            Privacy Policy
          </Link>
          <Link
            href="/legal/terms"
            className="text-slate-600 underline decoration-slate-400 underline-offset-2 hover:text-[hsl(var(--hero-teal))] hover:decoration-[hsl(var(--hero-teal))]"
          >
            Terms of Use
          </Link>
          <Link
            href="/legal/contractor-agreement"
            className="text-slate-600 underline decoration-slate-400 underline-offset-2 hover:text-[hsl(var(--hero-teal))] hover:decoration-[hsl(var(--hero-teal))]"
          >
            Contractor Agreement
          </Link>
          <Link
            href="/legal/child-safety"
            className="text-slate-600 underline decoration-slate-400 underline-offset-2 hover:text-[hsl(var(--hero-teal))] hover:decoration-[hsl(var(--hero-teal))]"
          >
            Child Safety & Conduct
          </Link>
        </nav>
        <p className="text-center text-sm text-slate-500">
          Need help? Contact support:{" "}
          <a
            href="mailto:support@torcanaai.com"
            className="text-slate-600 underline decoration-slate-400 underline-offset-2 hover:text-slate-800 hover:decoration-slate-600"
          >
            support@torcanaai.com
          </a>
        </p>
      </div>
    </footer>
  );
}
