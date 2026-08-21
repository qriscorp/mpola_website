import Link from "next/link";
import { Logo } from "@/components/logo";
import { ComplianceBadge } from "@/components/compliance-badge";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  FileText,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Wallet,
  Star,
  Zap,
  MessageCircle,
} from "lucide-react";

export const metadata = {
  title: "How It Works – Mpola for Borrowers",
  description:
    "Learn how to apply for a loan, compare offers, and get funded through Mpola Uganda.",
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <Logo asLink={false} />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors inline-flex items-center gap-1 dark:text-gray-400"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <Link
              href="/auth/signin"
              className="bg-[#2BB5A0] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#239E8C] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 lg:py-28 bg-linear-to-b from-[#E8F8F5]/50 to-white dark:from-gray-800/40 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#2BB5A0] text-xs font-semibold uppercase tracking-widest mb-4">
            For Borrowers
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1B2B3A] leading-tight dark:text-white">
            Fair credit,{" "}
            <span className="text-[#2BB5A0] italic">made simple</span>
          </h1>
          <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed dark:text-gray-400">
            Apply once, get multiple offers from verified lenders, compare rates
            transparently, and receive funds directly to your wallet. No hidden
            fees, no surprises.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="bg-[#2BB5A0] text-white px-8 py-3.5 rounded-lg font-semibold text-sm inline-flex items-center gap-2 hover:bg-[#239E8C] transition-colors"
            >
              Start Your Application <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/signin"
              className="text-gray-700 px-8 py-3.5 rounded-lg font-medium text-sm border border-gray-200 hover:bg-gray-50 transition-colors dark:hover:bg-gray-800 dark:border-gray-800 dark:text-gray-300"
            >
              Already Applied? Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Application Steps */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#2BB5A0] text-xs font-semibold uppercase tracking-widest mb-3">
              Your Journey
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1B2B3A] dark:text-white">
              From application to funds in 5 steps
            </h2>
          </div>

          <div className="space-y-0">
            {[
              {
                step: "01",
                icon: FileText,
                title: "Fill in Loan Details",
                desc: "Choose your loan amount (UGX), preferred duration (3–24 months), and loan type — Personal, Business, Real Estate, or Education. See estimated monthly repayments instantly.",
                color: "bg-[#2BB5A0]",
              },
              {
                step: "02",
                icon: Search,
                title: "Upload Documents",
                desc: "Provide your National ID, payslip or bank statement, and proof of residence. Optional business registration improves your offers. PDF, JPG, PNG accepted — max 5MB each.",
                color: "bg-[#1B2B3A]",
              },
              {
                step: "03",
                icon: Users,
                title: "Add Guarantors",
                desc: "Add 2 guarantors with their phone numbers. They'll receive an SMS invite to confirm. Both guarantors must accept before lenders can review your application.",
                color: "bg-[#2BB5A0]",
              },
              {
                step: "04",
                icon: Star,
                title: "Choose Lenders & Submit",
                desc: "Browse available verified lenders, compare their rates and maximum loan amounts. Select up to 5 lenders to receive your application. Review everything, then submit.",
                color: "bg-[#1B2B3A]",
              },
              {
                step: "05",
                icon: Wallet,
                title: "Compare Offers & Get Funded",
                desc: "Lenders review and respond within 48 hours. Compare offers side-by-side — monthly payment, interest rate, total repayment. Accept the best one. Funds hit your wallet within 24 hours.",
                color: "bg-[#2BB5A0]",
              },
            ].map((item, i) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-14 w-14 rounded-2xl ${item.color} flex items-center justify-center shrink-0`}
                  >
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  {i < 4 && <div className="w-0.5 h-16 bg-gray-200 my-2 dark:bg-gray-700" />}
                </div>
                <div className="pb-12">
                  <span className="text-[10px] text-[#2BB5A0] font-bold uppercase tracking-widest">
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

      {/* What You Need */}
      <section className="py-20 lg:py-28 bg-[#F8FAFA] dark:bg-gray-800/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1B2B3A] dark:text-white">
              What you&apos;ll need
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto dark:text-gray-400">
              Have these ready before you start your application.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🪪",
                title: "National ID (NIN)",
                desc: "Valid Ugandan National ID card for identity verification.",
              },
              {
                icon: "📄",
                title: "Payslip / Bank Statement",
                desc: "Recent payslip or 3-month bank statement showing income.",
              },
              {
                icon: "🏠",
                title: "Proof of Residence",
                desc: "Utility bill, LC letter, or tenancy agreement.",
              },
              {
                icon: "📱",
                title: "Phone Number",
                desc: "Active Ugandan number (+256) for OTP and notifications.",
              },
              {
                icon: "🤝",
                title: "2 Guarantors",
                desc: "Two people willing to vouch for your application via SMS.",
              },
              {
                icon: "📧",
                title: "Email Address",
                desc: "For account creation and receiving offer notifications.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-gray-900"
              >
                <span className="text-3xl">{item.icon}</span>
                <h3 className="text-base font-bold text-[#1B2B3A] mt-3 mb-1 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Mpola */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#2BB5A0] text-xs font-semibold uppercase tracking-widest mb-3">
              Why Mpola
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1B2B3A] dark:text-white">
              Borrowing that respects you
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {[
              {
                icon: Zap,
                title: "Fast & Transparent",
                desc: "See exact rates, fees, and repayment schedules before you commit. No hidden charges, ever.",
              },
              {
                icon: Search,
                title: "Compare Multiple Offers",
                desc: "Apply once, get offers from up to 5 lenders. Pick the best rate, duration, and terms for your situation.",
              },
              {
                icon: Clock,
                title: "48-Hour Response",
                desc: "Lenders typically respond within 48 hours. Once accepted, funds are in your wallet within 24 hours.",
              },
              {
                icon: ShieldCheck,
                title: "Regulated & Safe",
                desc: "Mpola is operated by Qriscorp (U) Limited, a licensed money lender under Uganda's Tier 4 Microfinance Institutions and Money Lenders Act. Your data is encrypted, your funds are protected.",
              },
              {
                icon: Wallet,
                title: "Flexible Payments",
                desc: "Pay via Mpola Wallet, MTN MoMo, or Airtel Money. Track your repayment schedule in real-time.",
              },
              {
                icon: MessageCircle,
                title: "Application Tracking",
                desc: "Monitor your application status from submission to offer to disbursement — every step is visible.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-[#E8F8F5] dark:bg-[#2BB5A0]/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-[#2BB5A0]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1B2B3A] mb-1 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed dark:text-gray-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#2BB5A0] py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: "48h", label: "Avg. Time to First Offer" },
              { value: "3–5", label: "Offers Per Application" },
              { value: "12.8%", label: "Avg. Rate Secured" },
              { value: "15,000+", label: "Successful Borrowers" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl lg:text-4xl font-bold">{stat.value}</p>
                <p className="text-[11px] text-white/70 uppercase tracking-wider mt-2">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1B2B3A] dark:text-white">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "How much can I borrow?",
                a: "Loan amounts vary by lender. Typical range is UGX 500,000 to UGX 50,000,000 depending on your profile, income, and credit history.",
              },
              {
                q: "What interest rates should I expect?",
                a: "Rates are set by individual lenders, typically ranging from 2% to 5% per month. You'll see exact rates before accepting any offer.",
              },
              {
                q: "Do I need a credit score?",
                a: "Mpola builds your credit score based on your repayment history on the platform. First-time borrowers can still apply — guarantors and documentation strengthen your application.",
              },
              {
                q: "What happens if I can't make a payment?",
                a: "Contact us before your due date. We work with lenders to find solutions. Late payments affect your credit score and your guarantors may be contacted.",
              },
              {
                q: "Is my data safe?",
                a: "Absolutely. Mpola uses bank-grade encryption, is operated by a Ministry of Finance-licensed money lender, and never shares your data without consent.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="border border-gray-100 rounded-xl p-6 dark:border-gray-800"
              >
                <h3 className="font-bold text-[#1B2B3A] mb-2 dark:text-white">{faq.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed dark:text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-[#1B2B3A] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Ready to get <span className="text-[#2BB5A0] italic">funded</span>?
          </h2>
          <p className="mt-4 text-gray-300 max-w-xl mx-auto">
            Create your account, submit your application, and start comparing
            offers from verified lenders today.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="bg-[#2BB5A0] text-white px-8 py-3.5 rounded-lg font-semibold text-sm inline-flex items-center gap-2 hover:bg-[#239E8C] transition-colors"
            >
              Start Application <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/signin"
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
          <ComplianceBadge className="text-[#2BB5A0]" />
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
              href="/learn-more"
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
