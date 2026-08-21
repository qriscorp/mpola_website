import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ComplianceBadge } from "@/components/compliance-badge";
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Users,
  FileCheck,
  Wallet,
  BarChart3,
  CheckCircle2,
  Clock,
  Lock,
  Star,
} from "lucide-react";

export const metadata = {
  title: "Learn More – Mpola for Lenders",
  description:
    "Discover how Mpola connects verified lenders with vetted borrowers in Uganda.",
};

export default function LearnMorePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-[#1B2B3A] text-white py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#C4A55A] text-xs font-semibold uppercase tracking-widest mb-4">
            For Licensed Lenders
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Your capital.{" "}
            <span className="text-[#C4A55A] italic">Their opportunity.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Mpola is operated by Qriscorp (U) Limited, a licensed money lender
            in Uganda. We connect verified lenders with pre-vetted borrowers,
            handling KYC, documentation, and repayment tracking so you can
            focus on deploying capital confidently.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/lender-signin"
              className="bg-[#C4A55A] text-[#1B2B3A] px-8 py-3.5 rounded-lg font-semibold text-sm inline-flex items-center gap-2 hover:bg-[#d4b56a] transition-colors"
            >
              Create Lender Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/lender-signin"
              className="text-white px-8 py-3.5 rounded-lg font-medium text-sm border border-white/20 hover:bg-white/10 transition-colors"
            >
              Already a Lender? Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Why Mpola */}
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#C4A55A] text-xs font-semibold uppercase tracking-widest mb-3">
              Why Mpola
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1B2B3A] dark:text-white">
              Built for serious lenders
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto dark:text-gray-400">
              Every feature is designed to minimize risk and maximize returns
              for verified lending institutions and individuals.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "KYC-Verified Borrowers",
                desc: "Every borrower undergoes National ID verification, phone confirmation, and document review before appearing in the marketplace.",
              },
              {
                icon: FileCheck,
                title: "Complete Documentation",
                desc: "Review bank statements, payslips, proof of residence, and business registrations before making a lending decision.",
              },
              {
                icon: Users,
                title: "Guarantor System",
                desc: "Borrowers must provide 2+ guarantors who confirm via SMS. This adds a layer of social accountability.",
              },
              {
                icon: TrendingUp,
                title: "Set Your Own Rates",
                desc: "You decide the interest rate, loan amount, and duration. No platform-imposed rates — full control.",
              },
              {
                icon: Wallet,
                title: "Integrated Wallet",
                desc: "Deposit via Mobile Money or card. Disbursements move wallet-to-wallet instantly, and you can withdraw earnings to Mobile Money or your bank account anytime.",
              },
              {
                icon: BarChart3,
                title: "Real-Time Analytics",
                desc: "Track your portfolio performance, repayment rates, earnings breakdown, and projected returns in one dashboard.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow dark:bg-gray-800/60"
              >
                <div className="h-12 w-12 rounded-xl bg-[#1B2B3A] flex items-center justify-center mb-5">
                  <item.icon className="h-6 w-6 text-[#C4A55A]" />
                </div>
                <h3 className="text-lg font-bold text-[#1B2B3A] mb-2 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed dark:text-gray-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works for Lenders */}
      <section className="py-20 lg:py-28 bg-[#F8FAFA] dark:bg-gray-800/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#C4A55A] text-xs font-semibold uppercase tracking-widest mb-3">
              How It Works
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1B2B3A] dark:text-white">
              Start lending in 4 simple steps
            </h2>
          </div>

          <div className="space-y-0">
            {[
              {
                step: "01",
                icon: Lock,
                title: "Create & Verify Your Account",
                desc: "Register as an Individual or Company lender. Complete KYC verification including National ID and business registration details.",
              },
              {
                step: "02",
                icon: Users,
                title: "Browse Pre-Vetted Borrowers",
                desc: "Filter by loan type (Personal, Business, Real Estate, Education), duration, and amount. View full profiles, documents, and guarantor details.",
              },
              {
                step: "03",
                icon: FileCheck,
                title: "Make an Offer",
                desc: "Set your interest rate, confirm the amount and duration. See live calculations of borrower payments and your total earnings before submitting.",
              },
              {
                step: "04",
                icon: Wallet,
                title: "Earn Returns",
                desc: "Once accepted, funds are disbursed from your wallet. Track monthly repayments, receive automatic deposits, and monitor your portfolio growth.",
              },
            ].map((item, i) => (
              <div key={item.step} className="flex gap-6 items-start relative">
                <div className="flex flex-col items-center">
                  <div className="h-14 w-14 rounded-2xl bg-[#1B2B3A] flex items-center justify-center shrink-0">
                    <item.icon className="h-6 w-6 text-[#C4A55A]" />
                  </div>
                  {i < 3 && <div className="w-0.5 h-16 bg-[#1B2B3A]/10 my-2 dark:bg-white/10" />}
                </div>
                <div className="pb-12">
                  <span className="text-[10px] text-[#C4A55A] font-bold uppercase tracking-widest">
                    Step {item.step}
                  </span>
                  <h3 className="text-xl font-bold text-[#1B2B3A] mt-1 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-lg dark:text-gray-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-[#1B2B3A] py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "14.2%", label: "Avg. Annualized Yield" },
              { value: "98.4%", label: "Repayment Rate" },
              { value: "2,847", label: "Active Lenders" },
              { value: "UGX 18B+", label: "Total Deployed Capital" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl lg:text-4xl font-bold text-[#C4A55A]">
                  {stat.value}
                </p>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-2 dark:text-gray-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk & Regulation */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#C4A55A] text-xs font-semibold uppercase tracking-widest mb-3">
                Safety & Compliance
              </p>
              <h2 className="text-3xl font-bold text-[#1B2B3A] dark:text-white">
                Regulated lending, reduced risk
              </h2>
              <p className="mt-4 text-gray-500 leading-relaxed dark:text-gray-400">
                Mpola is operated by Qriscorp (U) Limited, a licensed money
                lender under Uganda&apos;s Tier 4 Microfinance Institutions
                and Money Lenders Act, and all lending activity complies with
                Ugandan consumer protection law.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Licensed under Uganda's Tier 4 Money Lenders Act",
                "All borrowers KYC-verified with National ID",
                "2+ confirmed guarantors per application",
                "Automated repayment tracking & alerts",
                "Portfolio diversification tools",
                "Overdue notification + recovery support",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#C4A55A] shrink-0" />
                  <p className="text-sm text-gray-700 font-medium dark:text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 bg-[#F5F0E0]/50 dark:bg-gray-800/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 text-[#C4A55A] fill-[#C4A55A]" />
            ))}
          </div>
          <blockquote className="text-xl lg:text-2xl font-medium text-[#1B2B3A] italic leading-relaxed dark:text-white">
            &ldquo;Mpola has transformed how I deploy capital. The borrower
            vetting is thorough, the guarantor system gives me confidence, and
            the dashboard makes tracking effortless.&rdquo;
          </blockquote>
          <div className="mt-6">
            <p className="font-bold text-[#1B2B3A] dark:text-white">Joseph M.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Verified Individual Lender · Kampala
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-[#1B2B3A] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Start earning with{" "}
            <span className="text-[#C4A55A] italic">confidence</span>
          </h2>
          <p className="mt-4 text-gray-300 max-w-xl mx-auto">
            Join thousands of lenders on Uganda&apos;s most trusted licensed
            lending marketplace.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/lender-signin"
              className="bg-[#C4A55A] text-[#1B2B3A] px-8 py-3.5 rounded-lg font-semibold text-sm inline-flex items-center gap-2 hover:bg-[#d4b56a] transition-colors"
            >
              Create Lender Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/lender-signin"
              className="text-white px-8 py-3.5 rounded-lg font-medium text-sm border border-white/20 hover:bg-white/10 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111E29] text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <ComplianceBadge className="text-[#C4A55A]" />
          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/privacy-policy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/platform-terms"
              className="hover:text-white transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/how-it-works"
              className="hover:text-white transition-colors"
            >
              Help Centre
            </Link>
            <span>© 2026 Mpola Uganda Ltd.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
