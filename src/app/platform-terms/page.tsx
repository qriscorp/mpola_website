import Link from "next/link";

export default function PlatformTermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-xl p-8">
        <h1 className="text-2xl font-bold text-[#1B2B3A]">Platform Terms</h1>
        <p className="text-sm text-gray-500 mt-2">
          Effective date: 21 April 2026
        </p>

        <div className="mt-6 space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            These Platform Terms govern access and use of the Welend platform by
            borrowers and lenders in Uganda.
          </p>
          <p>
            By creating an account, you confirm that the information you submit
            is accurate, complete, and kept up to date.
          </p>
          <p>
            Welend may suspend or restrict accounts involved in fraud,
            misrepresentation, abuse, or legal/compliance violations.
          </p>
          <p>
            Loan offers are provided by participating lenders and may vary based
            on eligibility, documentation, and risk assessment.
          </p>
          <p>
            Continued use of the platform means acceptance of updates to these
            terms as published on this page.
          </p>
        </div>

        <div className="mt-8 flex gap-4">
          <Link
            href="/auth/register"
            className="text-[#2BB5A0] hover:underline text-sm font-medium"
          >
            Back to borrower registration
          </Link>
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
