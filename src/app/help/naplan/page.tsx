import Link from "next/link";
import { NAPLAN_YEARS } from "@/lib/constants";
import HelpFlowClient from "../help-flow-client";

export default function HelpNaplanPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="container mx-auto">
        <Link href="/" className="text-sm text-slate-600 underline hover:text-[hsl(var(--hero-teal))]">
          ← Home
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">NAPLAN Assistance</h1>
        <p className="mt-1 text-slate-600">Years 3, 5, 7 & 9 support — build confidence and skills fast.</p>
        <div className="mt-8">
          <HelpFlowClient
            section="NAPLAN"
            sectionLabel="NAPLAN Assistance"
            yearOptions={NAPLAN_YEARS}
          />
        </div>
      </div>
    </div>
  );
}
