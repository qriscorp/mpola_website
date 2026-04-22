"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LenderPageHeader } from "@/components/lender-top-nav";

export default function ApplicantProfilePage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <LenderPageHeader title="Applicant Profile" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Profile summary */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex flex-col items-center gap-2 text-center">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-[#1B2B3A] text-white text-xl font-bold">
                  AK
                </AvatarFallback>
              </Avatar>
              <h2 className="font-bold text-[#1B2B3A] dark:text-white text-lg">
                Agnes Kyomuhendo
              </h2>
              <p className="text-xs text-gray-400">Business Loan · #APP-001</p>
              <div className="flex gap-2 flex-wrap justify-center">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                  Pending Review
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1B2B3A] text-white">
                  Score: 78/100
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="flex-1 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors">
                Approve
              </button>
              <button className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:border-red-300 hover:text-red-500 transition-colors">
                Decline
              </button>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              {[
                ["Loan Amount", "UGX 8,000,000"],
                ["Duration", "4 months"],
                ["Purpose", "Stock expansion for retail shop"],
                ["Phone", "+256 701 234 567"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-medium text-[#1B2B3A] dark:text-white text-right">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-[#1B2B3A] dark:text-white text-sm mb-3">
              Documents
            </h3>
            <div className="space-y-2">
              {[
                {
                  name: "National ID",
                  status: "Verified",
                  color: "bg-emerald-50 text-emerald-600 border-emerald-200",
                },
                {
                  name: "Bank Statement (3mo)",
                  status: "Verified",
                  color: "bg-emerald-50 text-emerald-600 border-emerald-200",
                },
                {
                  name: "Business Proof",
                  status: "Uploaded",
                  color: "bg-amber-50 text-amber-600 border-amber-200",
                },
              ].map((doc) => (
                <div
                  key={doc.name}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-[#1B2B3A] dark:text-white">
                    {doc.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${doc.color}`}
                    >
                      {doc.status}
                    </span>
                    <button className="text-xs text-[#C4A55A] hover:underline">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2 space-y-4">
          {/* Guarantors */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-[#1B2B3A] dark:text-white text-sm mb-4">
              Guarantors
            </h3>
            <div className="space-y-3">
              {[
                {
                  initials: "MN",
                  name: "Moses Nkurunziza",
                  relation: "Business Partner",
                  confirmed: true,
                },
                {
                  initials: "SR",
                  name: "Susan Rujumba",
                  relation: "Spouse",
                  confirmed: true,
                },
              ].map((g) => (
                <div key={g.name} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#C4A55A] text-white text-xs font-bold">
                      {g.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                      {g.name}
                    </p>
                    <p className="text-xs text-gray-400">{g.relation}</p>
                  </div>
                  {g.confirmed && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                      Confirmed
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Loan History */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-[#1B2B3A] dark:text-white text-sm mb-4">
              Loan History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Ref
                    </th>
                    <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Year
                    </th>
                    <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {[
                    {
                      ref: "#LF-2022-011",
                      amount: "UGX 3M",
                      year: "2022",
                      status: "Repaid",
                      color:
                        "text-emerald-600 bg-emerald-50 border-emerald-200",
                    },
                    {
                      ref: "#LF-2023-034",
                      amount: "UGX 5M",
                      year: "2023",
                      status: "Repaid",
                      color:
                        "text-emerald-600 bg-emerald-50 border-emerald-200",
                    },
                  ].map((row) => (
                    <tr key={row.ref}>
                      <td className="py-2.5 text-gray-500 font-mono text-xs">
                        {row.ref}
                      </td>
                      <td className="py-2.5 font-medium text-[#1B2B3A] dark:text-white">
                        {row.amount}
                      </td>
                      <td className="py-2.5 text-gray-400">{row.year}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${row.color}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Link
        href="/lender/applications"
        className="inline-flex text-sm text-gray-500 hover:text-[#C4A55A] transition-colors"
      >
        ← Back to Applications
      </Link>
    </div>
  );
}
