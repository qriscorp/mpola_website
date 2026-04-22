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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Borrower
            </p>
            <h2 className="text-2xl font-bold mt-1">Agnes Kyomuhendo</h2>
            <p className="text-sm text-white/50 mt-0.5">#LN-2024-031</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Principal
            </p>
            <p className="text-3xl font-extrabold mt-1">UGX 8,000,000</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Rate
            </p>
            <p className="text-3xl font-extrabold mt-1">5%/mo</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-white/10">
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Total Interest
            </p>
            <p className="text-3xl font-extrabold mt-1 text-[#C4A55A]">
              UGX 1,600,000
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Status
            </p>
            <div className="mt-1">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-semibold border border-emerald-500/30">
                On Track
              </span>
            </div>
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
