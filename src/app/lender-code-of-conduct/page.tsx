import Link from "next/link";

export default function LenderCodeOfConductPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-xl p-8">
        <h1 className="text-2xl font-bold text-[#1B2B3A]">
          Lender Code of Conduct
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Effective date: 21 April 2026
        </p>

        <div className="mt-6 space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            Assess applications fairly and disclose rates, fees, and repayment
            obligations transparently.
          </p>
          <p>Avoid discriminatory, predatory, or abusive lending behavior.</p>
          <p>
            Use borrower data only for legitimate underwriting and servicing
            purposes in line with platform policy.
          </p>
          <p>
            Follow all regulatory requirements and dispute-handling procedures.
          </p>
          <p>
            Violations may result in account suspension, restrictions, or
            permanent removal from the platform.
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/auth/lender-register"
            className="text-[#2BB5A0] hover:underline text-sm font-medium"
          >
            Back to lender registration
          </Link>
        </div>
      </div>
    </div>
  );
}
