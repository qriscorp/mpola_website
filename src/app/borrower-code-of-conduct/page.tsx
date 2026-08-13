import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/logo";

const principles = [
  "Submit truthful personal, financial, and guarantor information.",
  "Provide authentic and unaltered supporting documents for verification.",
  "Avoid duplicate, deceptive, or fraudulent applications.",
  "Communicate respectfully with lenders, guarantors, and support teams.",
  "Repay accepted loans according to agreed schedules and obligations.",
  "Promptly update your profile if material financial information changes.",
];

export default function BorrowerCodeOfConductPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#EFFAF8_0%,#FFFFFF_25%)]">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo asLink={false} />
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-[#1B2B3A] dark:hover:text-white dark:text-gray-400"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Register
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-2xl border border-[#CAEAE4] bg-white p-6 sm:p-10 dark:bg-gray-900">
          <div className="mb-8 border-b border-gray-100 pb-6 dark:border-gray-800">
            <span className="inline-flex rounded-full border border-[#AEE2D9] dark:border-[#2BB5A0]/30 bg-[#E8F8F5] dark:bg-[#2BB5A0]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#149D8E] dark:text-[#5EEAD4]">
              Borrower Standards
            </span>
            <h1 className="mt-3 text-3xl font-black text-[#1B2B3A] sm:text-4xl dark:text-white">
              Borrower Code of Conduct
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Effective date: 22 April 2026
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              This code defines expected behavior for borrowers using Mpola. It
              protects trust between borrowers, lenders, and the wider platform
              community.
            </p>
          </div>

          <div className="rounded-xl border border-[#D7ECE8] dark:border-[#149D8E]/40 bg-[#F3FBF9] dark:bg-[#149D8E]/15 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-[#1B2B3A] dark:text-white">Core Rules</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {principles.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#2BB5A0]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800 dark:border-amber-800 dark:bg-amber-900/20">
            Serious misconduct, fraud, harassment, or repeated policy violations
            may result in account suspension, restricted access, or reporting to
            relevant authorities.
          </div>
        </div>
      </main>
    </div>
  );
}
