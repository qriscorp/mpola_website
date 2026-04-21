import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-xl p-8">
        <h1 className="text-2xl font-bold text-[#1B2B3A]">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mt-2">
          Effective date: 21 April 2026
        </p>

        <div className="mt-6 space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            Welend collects identity, contact, and financial information to
            provide lending services, compliance checks, and fraud prevention.
          </p>
          <p>
            Your data is processed for KYC verification, application matching,
            repayment tracking, and regulatory obligations.
          </p>
          <p>
            We share data only with authorized lenders, compliance providers,
            and regulators as required by law.
          </p>
          <p>
            We apply encryption, access controls, audit trails, and retention
            controls to protect personal information.
          </p>
          <p>
            You may request correction of inaccurate data by contacting support
            through your account settings.
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
