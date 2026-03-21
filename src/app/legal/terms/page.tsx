import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use | InstantTeacher",
  description: "Terms governing your use of the Instant Teacher platform.",
};

export default function TermsOfUsePage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
        Terms of Use
      </h1>
      <p className="text-sm text-slate-500">Last updated: February 2025</p>

      <section className="mt-8 space-y-4 text-slate-700">
        <h2 className="text-lg font-semibold text-slate-900">
          Welcome to Instant Teacher
        </h2>
        <p>
          These Terms of Use govern your use of the Instant Teacher platform and
          related services. By using the platform, you agree to these terms. We
          have written them in plain language so they are clear and
          understandable.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Using the platform
        </h2>
        <p>
          You must use the platform lawfully and in line with these terms. You
          must provide accurate information when you sign up and keep it up to
          date. You are responsible for keeping your account credentials secure.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          For parents and students
        </h2>
        <p>
          Parents and guardians are responsible for the accuracy of student
          information and for ensuring that use of the service is appropriate
          for their child. Sessions are provided by independent educators
          engaged through the platform; we facilitate the connection and support
          the experience but do not employ those educators.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Payments and cancellations
        </h2>
        <p>
          Payment terms are set out at the point of purchase. Refunds and
          cancellations are handled in line with our policies and applicable
          law.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Limitation of liability
        </h2>
        <p>
          To the extent permitted by law, our liability is limited as set out in
          our full terms and in Australian consumer law. We do not exclude
          rights that cannot be excluded by law.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">
          Changes
        </h2>
        <p>
          We may update these Terms of Use. Continued use of the platform after
          changes constitutes acceptance. We will indicate the last updated date
          on this page.
        </p>

        <p className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
          For questions about these Terms of Use, contact us via the support
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
