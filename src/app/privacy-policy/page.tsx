import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Logo } from "@/components/logo";

const sections = [
  {
    title: "1. Information We Collect",
    points: [
      "Identity data such as full name, National ID details, and account verification records.",
      "Contact data including phone number, email address, and communication preferences.",
      "Financial and application data needed for underwriting, repayments, and servicing.",
    ],
  },
  {
    title: "2. How We Use Information",
    points: [
      "To verify identity, prevent fraud, and maintain platform security.",
      "To match borrowers and lenders, process transactions, and track repayment performance.",
      "To satisfy legal and regulatory obligations under applicable Ugandan law.",
    ],
  },
  {
    title: "3. Sharing and Disclosure",
    points: [
      "Data is shared only with authorized lenders, service providers, and regulators where required.",
      "We do not sell personal data to third-party marketers.",
      "Disclosures may be made when needed to enforce agreements, prevent harm, or comply with lawful requests.",
    ],
  },
  {
    title: "4. Security and Retention",
    points: [
      "Mpola applies encryption, access controls, and monitoring to protect personal information.",
      "Data is retained only as long as needed for operations, compliance, dispute resolution, and legal obligations.",
      "Users should safeguard their credentials and report unauthorized activity immediately.",
    ],
  },
  {
    title: "5. Your Rights",
    points: [
      "You may request correction of inaccurate account information.",
      "You may request account-related support regarding data usage via official support channels.",
      "Certain legal obligations may limit deletion where records are required for compliance.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F6FAF9_0%,#FFFFFF_26%)] dark:bg-none dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo asLink={false} />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-[#1B2B3A] dark:hover:text-white dark:text-gray-400"
          >
            <ArrowLeft className="h-4 w-4" /> Back Home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-2xl border border-[#DDEBE8] bg-white p-6 sm:p-10 dark:bg-gray-900">
          <div className="mb-8 border-b border-gray-100 pb-6 dark:border-gray-800">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#BFE7E1] dark:border-[#2BB5A0]/30 bg-[#E8F8F5] dark:bg-[#2BB5A0]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#149D8E] dark:text-[#5EEAD4]">
              <LockKeyhole className="h-3.5 w-3.5" /> Privacy
            </span>
            <h1 className="mt-3 text-3xl font-black text-[#1B2B3A] sm:text-4xl dark:text-white">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Effective date: 22 April 2026
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              This policy explains how Mpola collects, uses, stores, and
              protects your information when you use the platform.
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-xl border border-gray-200 bg-gray-50/60 p-5 sm:p-6 dark:border-gray-800 dark:bg-gray-800/60"
              >
                <h2 className="text-lg font-bold text-[#1B2B3A] dark:text-white">
                  {section.title}
                </h2>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {section.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2BB5A0]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="mt-8 grid gap-3 rounded-xl border border-[#DDEBE8] bg-[#F3FBF9] p-4 dark:border-[#149D8E]/40 dark:bg-[#149D8E]/15 sm:grid-cols-2">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-lg border border-[#2BB5A0] bg-white px-4 py-2.5 text-sm font-semibold text-[#149D8E] transition-colors hover:bg-[#EAF8F5] dark:text-[#5EEAD4] dark:bg-gray-900"
            >
              Borrower Registration
            </Link>
            <Link
              href="/auth/lender-register"
              className="inline-flex items-center justify-center rounded-lg bg-[#1B2B3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#14202C]"
            >
              Lender Registration
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
