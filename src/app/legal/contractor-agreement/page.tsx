import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Independent Contractor Agreement | InstantTeacher",
  description: "Summary of the agreement between educators and Instant Teacher.",
};

export default function ContractorAgreementPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
        Independent Contractor Agreement — Summary
      </h1>
      <p className="text-sm text-slate-500">Last updated: February 2025</p>

      <section className="mt-6 rounded-xl border-2 border-[hsl(var(--hero-amber))]/30 bg-[hsl(var(--hero-amber))]/5 p-4">
        <p className="text-sm font-medium text-slate-800">
          This page is a summary for your information. The full agreement is
          formed when you accept the terms during signup (including the digital
          agreement and consent checkboxes). We recommend you read this before
          joining.
        </p>
      </section>

      <section className="mt-8 space-y-4 text-slate-700">
        <h2 className="text-lg font-semibold text-slate-900">
          Clear expectations
        </h2>
        <p>
          Educators who offer paid educational services through Instant Teacher
          do so as <strong>independent contractors</strong>, not as employees of
          Instant Teacher. This summary sets out the key points of that
          relationship in plain language.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Your status
        </h2>
        <ul className="list-inside list-disc space-y-1">
          <li>You are an independent educator connecting with students through our platform.</li>
          <li>You are not an employee, and no employment relationship is created.</li>
          <li>You are responsible for your own tax, superannuation, insurance, and professional compliance (including ABN where relevant).</li>
        </ul>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          ABN
        </h2>
        <p>
          Teachers offering paid educational services through Instant Teacher
          must hold, or be willing to obtain, an Australian Business Number
          (ABN) before receiving payments. This is a standard requirement for
          independent contractors in Australia.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          What we provide
        </h2>
        <p>
          We provide the platform to connect you with students, handle
          booking and payment facilitation, and support safe, professional
          sessions. We do not guarantee a minimum number of sessions or level of
          income; your engagement is flexible and based on availability and
          demand.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Professional conduct and safety
        </h2>
        <p>
          You agree to uphold professional conduct and child-safe standards when
          engaging with students. This is set out in more detail in our Child
          Safety & Professional Conduct Statement, which you accept at signup.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Digital agreement
        </h2>
        <p>
          By completing signup and accepting the digital agreement, you and
          Instant Teacher enter into a binding agreement governed by Australian
          law. The full terms are presented during the signup process.
        </p>

        <p className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
          For questions about this agreement, contact us via the support link in
          the site footer.
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
