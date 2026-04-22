"use client";

import Link from "next/link";
import { LenderPageHeader } from "@/components/lender-top-nav";

const schedule = [
  {
    num: 1,
    date: "May 1, 2024",
    principal: "UGX 2,000,000",
    interest: "UGX 400,000",
    total: "UGX 2,400,000",
    status: "Paid",
    statusClass: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    num: 2,
    date: "Jun 1, 2024",
    principal: "UGX 2,000,000",
    interest: "UGX 400,000",
    total: "UGX 2,400,000",
    status: "Due in 8 days",
    statusClass: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    num: 3,
    date: "Jul 1, 2024",
    principal: "UGX 2,000,000",
    interest: "UGX 400,000",
    total: "UGX 2,400,000",
    status: "Upcoming",
    statusClass: "bg-gray-50 text-gray-500 border-gray-200",
  },
  {
    num: 4,
    date: "Aug 1, 2024",
    principal: "UGX 2,000,000",
    interest: "UGX 400,000",
    total: "UGX 2,400,000",
    status: "Upcoming",
    statusClass: "bg-gray-50 text-gray-500 border-gray-200",
  },
];

export default function LoanDetailPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <LenderPageHeader title="Loan Detail" />

      {/* Hero card */}
      <div className="rounded-2xl bg-[#1B2B3A] p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Borrower
            </p>
            <h2 className="text-xl font-bold mt-0.5">Agnes Kyomuhendo</h2>
            <div className="flex flex-wrap gap-4 mt-4">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider">
                  Principal
                </p>
                <p className="text-3xl font-extrabold mt-0.5">UGX 8,000,000</p>
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider">
                  Rate
                </p>
                <p className="text-3xl font-extrabold mt-0.5">5%/mo</p>
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider">
                  Total Interest
                </p>
                <p className="text-3xl font-extrabold mt-0.5 text-[#C4A55A]">
                  UGX 1,600,000
                </p>
              </div>
            </div>
          </div>
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white text-[#1B2B3A] text-xs font-bold">
              ● On Track
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 mt-5 text-sm">
          <div>
            <span className="text-white/50">Duration:</span>{" "}
            <span className="font-medium">4 months</span>
          </div>
          <div>
            <span className="text-white/50">Disbursed:</span>{" "}
            <span className="font-medium">Apr 1, 2024</span>
          </div>
          <div>
            <span className="text-white/50">Matures:</span>{" "}
            <span className="font-medium">Aug 1, 2024</span>
          </div>
          <div>
            <span className="text-white/50">Reference:</span>{" "}
            <span className="font-medium">#LF-2024-001</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-white/50">Repayment Progress</span>
            <span className="font-medium text-[#C4A55A]">1 of 4 paid</span>
          </div>
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#C4A55A]"
              style={{ width: "25%" }}
            />
          </div>
        </div>
      </div>

      {/* Repayment schedule */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
        <h3 className="font-semibold text-[#1B2B3A] dark:text-white mb-4">
          Repayment Schedule
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  #
                </th>
                <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  Due Date
                </th>
                <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider hidden sm:table-cell">
                  Principal
                </th>
                <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider hidden sm:table-cell">
                  Interest
                </th>
                <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {schedule.map((row) => (
                <tr key={row.num}>
                  <td className="py-3 text-gray-400 text-xs font-mono">
                    {row.num}
                  </td>
                  <td className="py-3 text-[#1B2B3A] dark:text-white font-medium">
                    {row.date}
                  </td>
                  <td className="py-3 text-gray-500 hidden sm:table-cell">
                    {row.principal}
                  </td>
                  <td className="py-3 text-gray-500 hidden sm:table-cell">
                    {row.interest}
                  </td>
                  <td className="py-3 font-semibold text-[#1B2B3A] dark:text-white">
                    {row.total}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${row.statusClass}`}
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

      <Link
        href="/lender/portfolio"
        className="inline-flex text-sm text-gray-500 hover:text-[#C4A55A] transition-colors"
      >
        ← Back to Portfolio
      </Link>
    </div>
  );
}
