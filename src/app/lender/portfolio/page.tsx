"use client";

import { useState } from "react";
import Link from "next/link";
import { LenderPageHeader } from "@/components/lender-top-nav";

type LoanStatus = "On Track" | "Overdue" | "Completed";

const loans: Array<{
  id: string;
  borrower: string;
  ref: string;
  amount: string;
  rate: string;
  paid: number;
  total: number;
  overdueLabel?: string;
  nextPayment: string;
  status: LoanStatus;
}> = [
  {
    id: "L1",
    borrower: "Agnes Kyomuhendo",
    ref: "#LN-2024-031",
    amount: "UGX 8M",
    rate: "5%/mo",
    paid: 2,
    total: 4,
    nextPayment: "15 Jun 2024",
    status: "On Track",
  },
  {
    id: "L2",
    borrower: "Brian Tumwine",
    ref: "#LN-2024-019",
    amount: "UGX 3M",
    rate: "7%/mo",
    paid: 0,
    total: 2,
    overdueLabel: "Overdue 5 days",
    nextPayment: "Overdue",
    status: "Overdue",
  },
  {
    id: "L3",
    borrower: "Ronald Okot",
    ref: "#LN-2024-028",
    amount: "UGX 12M",
    rate: "5%/mo",
    paid: 5,
    total: 6,
    nextPayment: "20 Jun 2024",
    status: "On Track",
  },
];

const tabs: Array<"All" | LoanStatus> = [
  "All",
  "On Track",
  "Overdue",
  "Completed",
];

export default function LenderPortfolioPage() {
  const [tab, setTab] = useState<"All" | LoanStatus>("All");
  const filtered =
    tab === "All" ? loans : loans.filter((l) => l.status === tab);

  const statBadge = (s: LoanStatus) => {
    if (s === "On Track")
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
          On Track
        </span>
      );
    if (s === "Overdue")
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
          Overdue
        </span>
      );
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
        Completed
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <LenderPageHeader title="My Portfolio" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-[#C4A55A] p-5">
          <p className="text-sm text-gray-500">Active Loans</p>
          <p className="text-4xl font-bold text-[#1B2B3A] dark:text-white mt-1">
            8
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-[#C4A55A] p-5">
          <p className="text-sm text-gray-500">Outstanding</p>
          <p className="text-4xl font-bold text-[#1B2B3A] dark:text-white mt-1">
            UGX 42M
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-red-500 p-5">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-4xl font-bold text-red-600 mt-1">2</p>
        </div>
      </div>

      {/* Active Loans card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
        <h3 className="font-bold text-[#1B2B3A] dark:text-white mb-4">
          Active Loans
        </h3>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-5">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                tab === t
                  ? "bg-[#C4A55A] border-[#C4A55A] text-white"
                  : "bg-white border-gray-300 text-gray-600 hover:border-[#C4A55A]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-3 text-xs text-gray-400 font-semibold uppercase tracking-wider pr-4">
                  Borrower
                </th>
                <th className="text-left pb-3 text-xs text-gray-400 font-semibold uppercase tracking-wider pr-4 hidden sm:table-cell">
                  Amount
                </th>
                <th className="text-left pb-3 text-xs text-gray-400 font-semibold uppercase tracking-wider pr-4 hidden md:table-cell">
                  Rate
                </th>
                <th className="text-left pb-3 text-xs text-gray-400 font-semibold uppercase tracking-wider pr-4">
                  Progress
                </th>
                <th className="text-left pb-3 text-xs text-gray-400 font-semibold uppercase tracking-wider pr-4 hidden sm:table-cell">
                  Next Payment
                </th>
                <th className="text-left pb-3 text-xs text-gray-400 font-semibold uppercase tracking-wider pr-4">
                  Status
                </th>
                <th className="w-16 pb-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((loan) => (
                <tr key={loan.id}>
                  <td className="py-4 pr-4">
                    <p className="font-bold text-[#1B2B3A] dark:text-white">
                      {loan.borrower}
                    </p>
                    <p className="text-xs text-gray-400">{loan.ref}</p>
                  </td>
                  <td className="py-4 pr-4 text-gray-500 hidden sm:table-cell">
                    {loan.amount}
                  </td>
                  <td className="py-4 pr-4 text-gray-500 hidden md:table-cell">
                    {loan.rate}
                  </td>
                  <td className="py-4 pr-4 min-w-30">
                    {loan.status === "Overdue" ? (
                      <p className="text-xs text-red-500 font-medium">
                        {loan.overdueLabel}
                      </p>
                    ) : (
                      <>
                        <p className="text-xs text-gray-400 mb-1">
                          {loan.paid}/{loan.total} paid
                        </p>
                        <div className="h-1.5 w-24 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#C4A55A]"
                            style={{
                              width: `${(loan.paid / loan.total) * 100}%`,
                            }}
                          />
                        </div>
                      </>
                    )}
                  </td>
                  <td className="py-4 pr-4 text-xs hidden sm:table-cell">
                    {loan.status === "Overdue" ? (
                      <span className="text-red-500 font-medium">
                        {loan.nextPayment}
                      </span>
                    ) : (
                      <span className="text-gray-500">{loan.nextPayment}</span>
                    )}
                  </td>
                  <td className="py-4 pr-4">{statBadge(loan.status)}</td>
                  <td className="py-4">
                    <Link
                      href="/lender/loan-detail"
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#C4A55A] text-white font-semibold hover:bg-[#b3944a] transition-colors"
                    >
                      View
                    </Link>
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
