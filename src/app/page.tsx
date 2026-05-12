import Link from "next/link";
import { Logo } from "@/components/logo";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="h-1 bg-[#2BB5A0]" />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left: For Lenders */}
        <div className="lg:w-1/2 bg-[#1B2B3A] text-white flex flex-col justify-between p-8 lg:p-16">
          <Logo variant="light" />

          <div className="mt-12 lg:mt-0">
            <p className="text-[#2BB5A0] text-xs font-semibold uppercase tracking-wider mb-4">
              For Lenders
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Put your capital{" "}
              <span className="text-[#C4A55A] italic">to work</span>,
              responsibly.
            </h1>
            <p className="mt-6 text-gray-300 leading-relaxed max-w-lg">
              Discover pre-vetted borrowers across Uganda. Set your own rates,
              review KYC documentation, and deploy capital with confidence.
              BoU-licensed, fully regulated.
            </p>

            <div className="flex items-center gap-4 mt-8">
              <Link
                href="/auth/lender-signin"
                className="bg-white text-[#1B2B3A] px-6 py-3 rounded-lg font-medium text-sm inline-flex items-center gap-2 hover:bg-gray-100 transition-colors"
              >
                Enter Lender Portal <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/learn-more"
                className="text-white px-6 py-3 rounded-lg font-medium text-sm border border-white/20 hover:bg-white/10 transition-colors"
              >
                Learn More
              </Link>
            </div>

            <div className="flex items-center gap-8 mt-12">
              <div>
                <p className="text-2xl font-bold">14.2%</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                  Avg. Annualized Yield
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold">98.4%</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                  Repayment Rate
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold">2,847</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                  Active Lenders
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 lg:mt-0 flex items-center gap-2 text-gray-400 text-xs">
            <ShieldCheck className="w-4 h-4" />
            Licensed by Bank of Uganda · Tier IV Credit Institution Licence
            #TCI-2024-0418
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:flex items-center">
          <div className="bg-gray-200 text-gray-500 text-xs font-medium rounded-full w-8 h-8 flex items-center justify-center -mx-4 z-10">
            OR
          </div>
        </div>

        {/* Right: For Borrowers */}
        <div className="lg:w-1/2 bg-white flex flex-col justify-between p-8 lg:p-16">
          <div />

          <div>
            <p className="text-[#2BB5A0] text-xs font-semibold uppercase tracking-wider mb-4">
              For Borrowers
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#1B2B3A] leading-tight">
              Fair credit,{" "}
              <span className="text-[#2BB5A0] italic">on your terms</span>.
            </h1>
            <p className="mt-6 text-gray-500 leading-relaxed max-w-lg">
              Apply once. Compare offers from licensed lenders side-by-side. No
              hidden fees, transparent rates, and repayment schedules you can
              actually live with.
            </p>

            <div className="flex items-center gap-4 mt-8">
              <Link
                href="/auth/signin"
                className="bg-[#2BB5A0] text-white px-6 py-3 rounded-lg font-medium text-sm inline-flex items-center gap-2 hover:bg-[#239E8C] transition-colors"
              >
                Enter Borrower Portal <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="text-gray-700 px-6 py-3 rounded-lg font-medium text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                How it works
              </Link>
            </div>

            <div className="flex items-center gap-8 mt-12">
              <div>
                <p className="text-2xl font-bold text-[#1B2B3A]">48h</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                  Avg. to First Offer
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1B2B3A]">3–5</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                  Offers Per Application
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1B2B3A]">12.8%</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                  Avg. Rate Secured
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 lg:mt-0 flex items-center gap-6 text-xs text-gray-400">
            <Link href="#" className="hover:text-gray-600">
              Privacy
            </Link>
            <Link href="#" className="hover:text-gray-600">
              Terms
            </Link>
            <Link href="#" className="hover:text-gray-600">
              Help Centre
            </Link>
            <span>© 2026 Mpola Uganda Ltd.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
