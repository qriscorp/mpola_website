"use client";

import { useState } from "react";
import Link from "next/link";
import { LenderPageHeader } from "@/components/lender-top-nav";
import { TableSkeleton } from "@/components/skeletons";
import { useLenderActiveLoans } from "@/hooks/use-lender";
import { formatCurrency, formatRate } from "@/lib/format";
import type { ActiveLoan } from "@/lib/types";
import { FadeSwap } from "@/components/motion/fade-swap";

type LoanStatus = ActiveLoan["status"];

const tabs: Array<"All" | LoanStatus> = [
  "All",
  "active",
  "overdue",
  "completed",
  "defaulted",
];

const tabLabel: Record<"All" | LoanStatus, string> = {
  All: "All",
  active: "On Track",
  overdue: "Overdue",
  completed: "Completed",
  defaulted: "Defaulted",
};

function statBadge(s: LoanStatus) {
  if (s === "active")
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
        On Track
      </span>
    );
  if (s === "overdue")
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
        Overdue
      </span>
    );
  if (s === "defaulted")
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
        Defaulted
      </span>
    );
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
      Completed
    </span>
  );
}

export default function LenderPortfolioPage() {
  const [tab, setTab] = useState<"All" | LoanStatus>("All");
  const { data: loans, isLoading } = useLenderActiveLoans();

  const allLoans = loans ?? [];
  const filtered = tab === "All" ? allLoans : allLoans.filter((l) => l.status === tab);

  const activeCount = allLoans.filter(
    (l) => l.status === "active" || l.status === "overdue",
  ).length;
  const outstanding = allLoans
    .filter((l) => l.status === "active" || l.status === "overdue")
    .reduce((sum, l) => sum + Math.max(l.total_repayable - l.total_paid, 0), 0);
  const overdueCount = allLoans.filter((l) => l.status === "overdue").length;

  return (
    <FadeSwap
      loading={isLoading}
      skeleton={
        <div className="space-y-6 max-w-6xl">
          <LenderPageHeader title="My Portfolio" />
          <TableSkeleton rows={4} />
        </div>
      }
    >
    <div className="space-y-6 max-w-6xl">
      <LenderPageHeader title="My Portfolio" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-[#C4A55A] p-5">
          <p className="text-sm text-gray-500">Active Loans</p>
          <p className="text-4xl font-bold text-[#1B2B3A] dark:text-white mt-1">
            {activeCount}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-[#C4A55A] p-5">
          <p className="text-sm text-gray-500">Outstanding</p>
          <p className="text-4xl font-bold text-[#1B2B3A] dark:text-white mt-1">
            {formatCurrency(outstanding)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-red-500 p-5">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-4xl font-bold text-red-600 mt-1">{overdueCount}</p>
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
              {tabLabel[t]}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">
            No loans in this category yet.
          </p>
        ) : (
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
                        {loan.borrower_name ?? "—"}
                      </p>
                      <p className="text-xs text-gray-400">
                        #{loan.id.slice(0, 8)}
                      </p>
                    </td>
                    <td className="py-4 pr-4 text-gray-500 hidden sm:table-cell">
                      {formatCurrency(loan.amount)}
                    </td>
                    <td className="py-4 pr-4 text-gray-500 hidden md:table-cell">
                      {formatRate(loan.interest_rate)}
                    </td>
                    <td className="py-4 pr-4 min-w-30">
                      {loan.status === "overdue" ? (
                        <p className="text-xs text-red-500 font-medium">
                          Overdue
                        </p>
                      ) : (
                        <>
                          <p className="text-xs text-gray-400 mb-1">
                            {loan.paid_instalments}/{loan.total_instalments} paid
                          </p>
                          <div className="h-1.5 w-24 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#C4A55A]"
                              style={{
                                width: `${loan.total_instalments ? (loan.paid_instalments / loan.total_instalments) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </>
                      )}
                    </td>
                    <td className="py-4 pr-4 text-xs hidden sm:table-cell">
                      {loan.status === "overdue" ? (
                        <span className="text-red-500 font-medium">
                          Overdue
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          {loan.next_payment_date
                            ? new Date(loan.next_payment_date).toLocaleDateString()
                            : "—"}
                        </span>
                      )}
                    </td>
                    <td className="py-4 pr-4">{statBadge(loan.status)}</td>
                    <td className="py-4">
                      <Link
                        href={`/lender/loan-detail?loanId=${loan.id}`}
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
        )}
      </div>
    </div>
    </FadeSwap>
  );
}
