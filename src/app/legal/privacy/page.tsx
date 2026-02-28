import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | InstantTeacher",
  description: "How Instant Teacher collects, uses, and protects your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
        Privacy Policy
      </h1>
      <p className="text-sm text-slate-500">Last updated: February 2025</p>

      <section className="mt-8 space-y-4 text-slate-700">
        <h2 className="text-lg font-semibold text-slate-900">
          Your safety and privacy matter
        </h2>
        <p>
          Instant Teacher (&quot;we&quot;, &quot;us&quot;) is committed to protecting your
          personal information. This policy explains how we collect, use, store,
          and disclose information when you use our platform. We use clear,
          respectful language so you know what to expect.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Information we collect
        </h2>
        <p>
          We collect information you provide when you create an account (such as
          name, email, and contact details), information needed to facilitate
          tutoring sessions (e.g. subject and year level), and technical
          information (e.g. IP address, device type) to operate the service
          securely. We do not publicly display educator contact details; all
          communication is facilitated through our platform.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          How we use your information
        </h2>
        <p>
          We use your information to provide the service (matching students
          with educators, processing payments, supporting sessions), to
          communicate with you about your account, to improve our platform, and
          to meet legal and safety obligations. We do not sell your personal
          information.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Storage and security
        </h2>
        <p>
          We store data in Australia where practicable and use industry-standard
          measures to protect your information. Access to personal data is
          limited to what is necessary to operate the service and support you.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Your rights
        </h2>
        <p>
          You may request access to, or correction of, your personal information.
          You may also request deletion subject to our legal and operational
          requirements. Contact us using the details in the footer of this site.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Children and students
        </h2>
        <p>
          We take care with information relating to students. Student and school
          details are not exposed publicly. Parents and guardians manage student
          profiles and consent where applicable.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Changes to this policy
        </h2>
        <p>
          We may update this policy from time to time. We will post the updated
          version on this page and indicate the date of the last update.
        </p>

        <p className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
          For questions about this Privacy Policy, contact us via the support
          link in the site footer.
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
