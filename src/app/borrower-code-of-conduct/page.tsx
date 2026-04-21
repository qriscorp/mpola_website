import Link from "next/link";

export default function BorrowerCodeOfConductPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-xl p-8">
        <h1 className="text-2xl font-bold text-[#1B2B3A]">
          Borrower Code of Conduct
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Effective date: 21 April 2026
        </p>

        <div className="mt-6 space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            Provide truthful application details and genuine supporting
            documents.
          </p>
          <p>
            Do not submit duplicate or fraudulent applications on the platform.
          </p>
          <p>
            Maintain respectful communication with lenders and support teams.
          </p>
          <p>Repay accepted loans according to agreed schedules and terms.</p>
          <p>
            Repeated misconduct, fraud, or abusive behavior may lead to
            suspension and reporting to relevant authorities.
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/auth/register"
            className="text-[#2BB5A0] hover:underline text-sm font-medium"
          >
            Back to borrower registration
          </Link>
        </div>
      </div>
    </div>
  );
}
