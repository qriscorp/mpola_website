"use client";

import Link from "next/link";
import { BorrowerPageHeader } from "@/components/top-nav";

const instalments = [
  { num: 1, dueDate: "15 Mar 2024", principal: "UGX 2,000,000", interest: "UGX 400,000", total: "UGX 2,400,000", status: "paid" },
  { num: 2, dueDate: "15 Apr 2024", principal: "UGX 2,000,000", interest: "UGX 400,000", total: "UGX 2,400,000", status: "paid" },
  { num: 3, dueDate: "15 May 2024", principal: "UGX 2,000,000", interest: "UGX 400,000", total: "UGX 2,400,000", status: "due" },
  { num: 4, dueDate: "15 Jun 2024", principal: "UGX 2,000,000", interest: "UGX 400,000", total: "UGX 2,400,000", status: "upcoming" },
];

export default function RepaymentsPage() {
  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Repayment Schedule" />

      {/* Hero banner */}
      <div className="rounded-2xl bg-[#2BB5A0] p-6 sm:p-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Outstanding Balance</p>
        <p className="text-5xl font-extrabold mt-1">UGX 4,800,000</p>
        <div className="mt-4 h-2 rounded-full bg-white/30 overflow-hidden">
          <div className="h-full rounded-full bg-white" style={{ width: "50%" }} />
        </div>
        <p className="text-sm text-white/80 mt-2">50% repaid · 2 payments remaining</p>
      </div>

      {/* Schedule table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-[#1B2B3A] dark:text-white">Repayment Schedule</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">#</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">Due Date</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">Principal</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">Interest</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">Total</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {instalments.map((inst) => (
                <tr key={inst.num} className={inst.status === "due" ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}>
                  <td className="px-4 py-4 font-semibold text-[#1B2B3A] dark:text-white">{inst.num}</td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{inst.dueDate}</td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{inst.principal}</td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{inst.interest}</td>
                  <td className="px-4 py-4 font-semibold text-[#1B2B3A] dark:text-white">{inst.total}</td>
                  <td className="px-4 py-4">
                    {inst.status === "paid" && (
                      <span className="px-2 py-1 rounded-full bg-teal-50 text-[#2BB5A0] text-xs font-semibold">Paid</span>
                    )}
                    {inst.status === "due" && (
                      <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold">Due in 8 days</span>
                    )}
                    {inst.status === "upcoming" && (
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">Upcoming</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {inst.status === "due" && (
                      <Link
                        href="/dashboard/repayments/pay"
                        className="px-4 py-2 rounded-lg bg-[#2BB5A0] text-white text-xs font-semibold hover:bg-[#239E8C] transition-colors"
                      >
                        Pay Now
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
