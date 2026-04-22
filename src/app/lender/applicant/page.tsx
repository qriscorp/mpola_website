"use client";

import { LenderPageHeader } from "@/components/lender-top-nav";

export default function ApplicantProfilePage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <LenderPageHeader title="Applicant Profile" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: 2/3 wide */}
        <div className="lg:col-span-2 space-y-4">
          {/* Profile card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-5">
              <div className="h-16 w-16 rounded-full bg-[#1B2B3A] flex items-center justify-center shrink-0">
                <span className="text-white text-xl font-bold">AK</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1B2B3A]">
                      Agnes Kyomuhendo
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Business Loan · #APP-20240078
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button className="px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors">
                      Approve
                    </button>
                    <button className="px-4 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:border-red-300 hover:text-red-500 transition-colors">
                      Decline
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                    Pending Review
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#1B2B3A] text-[#C4A55A]">
                    Score 78/100
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-5 mt-6 pt-6 border-t border-gray-100">
              {[
                { label: "AMOUNT", value: "UGX 8,000,000", big: true },
                { label: "DURATION", value: "4 months", big: true },
                { label: "PURPOSE", value: "Stock Financing", big: false },
                { label: "PHONE", value: "+256 700 123 456", big: false },
              ].map(({ label, value, big }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {label}
                  </p>
                  <p
                    className={`font-bold text-[#1B2B3A] mt-0.5 ${big ? "text-2xl" : "text-base"}`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Documents card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-[#1B2B3A] text-lg mb-4">Documents</h3>
            <div className="space-y-3">
              {[
                {
                  name: "National ID",
                  sub: "CF12345678",
                  status: "Verified",
                  verified: true,
                },
                {
                  name: "Bank Statement (3 months)",
                  sub: "Stanbic · Jan–Mar 2024",
                  status: "Uploaded",
                  verified: false,
                },
                {
                  name: "Business Registration",
                  sub: "KCCA Certificate",
                  status: "Uploaded",
                  verified: false,
                },
              ].map((doc) => (
                <div
                  key={doc.name}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#1B2B3A]">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{doc.sub}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        doc.verified
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                    >
                      {doc.status}
                    </span>
                    <button className="px-3 py-1 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 hover:border-[#C4A55A] hover:text-[#C4A55A] transition-colors">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: 1/3 */}
        <div className="space-y-4">
          {/* Guarantors */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-[#1B2B3A] text-lg mb-4">
              Guarantors
            </h3>
            <div className="space-y-4">
              {[
                {
                  initials: "SM",
                  name: "Sarah Mirembe",
                  relation: "Colleague",
                  bg: "bg-emerald-600",
                },
                {
                  initials: "JO",
                  name: "John Opolot",
                  relation: "Spouse",
                  bg: "bg-amber-700",
                },
              ].map((g) => (
                <div key={g.name} className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-full ${g.bg} flex items-center justify-center shrink-0`}
                  >
                    <span className="text-white text-xs font-bold">
                      {g.initials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1B2B3A]">
                      {g.name}
                    </p>
                    <p className="text-xs text-gray-400">{g.relation}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    Confirmed
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Loan History */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-[#1B2B3A] text-lg mb-3">
              Loan History
            </h3>
            <p className="text-sm text-gray-400">
              No previous loans on WeLend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
