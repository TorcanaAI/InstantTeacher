import type { Metadata } from "next";
import Link from "next/link";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Child Safety & Professional Conduct | InstantTeacher",
  description: "Our commitment to safe, respectful, and professional educational interactions.",
};

export default function ChildSafetyPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--hero-teal))]/10">
          <Shield className="h-6 w-6 text-[hsl(var(--hero-teal))]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Child Safety & Professional Conduct
          </h1>
          <p className="text-sm text-slate-500">Last updated: February 2025</p>
        </div>
      </div>

      <section className="mt-8 space-y-4 text-slate-700">
        <h2 className="text-lg font-semibold text-slate-900">
          Your safety matters
        </h2>
        <p>
          Instant Teacher is committed to safe, respectful, and professional
          educational interactions. We support families and educators with
          clear expectations and a supportive environment—not alarmist, but
          clear and responsible.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Our commitment
        </h2>
        <p>
          All educators who join our platform agree to maintain appropriate
          conduct, confidentiality, and duty of care when engaging with
          students. Sessions are designed to be professional, focused, and
          conducted in a way that protects both students and educators.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          What we expect from educators
        </h2>
        <ul className="list-inside list-disc space-y-1">
          <li>Uphold professional boundaries and respectful communication.</li>
          <li>Maintain confidentiality about student information and session content.</li>
          <li>Follow child-safe practices and any applicable checks (e.g. Working With Children Check where required).</li>
          <li>Use the platform for session communication; we do not expose educator contact details to students or parents outside the platform.</li>
        </ul>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          What we do to support safety
        </h2>
        <ul className="list-inside list-disc space-y-1">
          <li>We do not publicly display teacher contact details; communication is facilitated through our platform.</li>
          <li>We do not expose student age or school details publicly.</li>
          <li>We support conflict-of-interest policies (e.g. educators are not matched with students from their own school where applicable).</li>
          <li>We provide a clear way to report concerns and handle them appropriately.</li>
        </ul>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Professional, transparent, supportive
        </h2>
        <p>
          We aim for an experience that feels professional, safe, and
          respectful of everyone involved—educators, students, and families. If
          you have questions or concerns, please contact us via the support link
          in the site footer.
        </p>

        <p className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
          For full terms and policies, see our Terms of Use and Privacy Policy.
        </p>
      </section>

      <p className="mt-10">
        <Link
          href="/"
          className="text-[hsl(var(--hero-teal))] underline underline-offset-2 hover:no-underline"
        >
          ← Back to home
        </Link>
      </p>
    </article>
  );
}
