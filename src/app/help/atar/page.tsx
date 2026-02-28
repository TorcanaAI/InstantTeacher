import Link from "next/link";
import { ATAR_YEARS } from "@/lib/constants";
import HelpFlowClient from "../help-flow-client";

export default function HelpAtarPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="container mx-auto">
        <Link href="/" className="text-sm text-slate-600 underline hover:text-[hsl(var(--hero-teal))]">
          ← Home
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">ATAR Support</h1>
        <p className="mt-1 text-slate-600">Years 10–12 exam & assignment help — concept mastery and exam prep.</p>
        <div className="mt-8">
          <HelpFlowClient
            section="ATAR"
            sectionLabel="ATAR Support"
            yearOptions={ATAR_YEARS}
          />
        </div>
      </div>
    </div>
  );
}
