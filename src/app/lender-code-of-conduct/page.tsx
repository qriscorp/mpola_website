import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/logo";

const principles = [
  "Assess borrower applications fairly and consistently using documented criteria.",
  "Disclose interest rates, fees, and repayment obligations transparently before commitment.",
  "Avoid predatory, discriminatory, deceptive, or abusive lending practices.",
  "Use borrower data only for authorized underwriting and servicing purposes.",
  "Follow applicable regulation, compliance duties, and dispute handling procedures.",
  "Maintain respectful communication throughout application, servicing, and recovery interactions.",
];

export default function LenderCodeOfConductPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#FBF8F1_0%,#FFFFFF_25%)]">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo asLink={false} />
          <Link
            href="/auth/lender-register"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-[#1B2B3A]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Register
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-2xl border border-[#E6D7B0] bg-white p-6 sm:p-10">
          <div className="mb-8 border-b border-gray-100 pb-6">
            <span className="inline-flex rounded-full border border-[#E4CF98] bg-[#F5F0E0] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#9F7F34]">
              Lender Standards
            </span>
            <h1 className="mt-3 text-3xl font-black text-[#1B2B3A] sm:text-4xl">
              Lender Code of Conduct
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Effective date: 22 April 2026
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-600">
              This code sets the expected professional and ethical standard for
              lenders operating on Welend.
            </p>
          </div>

          <div className="rounded-xl border border-[#E9DBB8] bg-[#FCF8EE] p-5 sm:p-6">
            <h2 className="text-lg font-bold text-[#1B2B3A]">Core Rules</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700">
              {principles.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#C4A55A]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
            Material violations may result in restrictions, suspension,
            permanent removal from Welend, and where required, escalation to
            appropriate regulators or authorities.
          </div>
        </div>
      </main>
    </div>
  );
}
