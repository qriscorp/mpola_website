"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { LenderPageHeader } from "@/components/lender-top-nav";
import { TableSkeleton } from "@/components/skeletons";
import { useLenderActiveLoans, useApproveDisbursement } from "@/hooks/use-lender";
import { formatCurrency, formatRate, formatDuration } from "@/lib/format";
import { calcPlatformFee } from "@/lib/fees";
import type { ActiveLoan } from "@/lib/types";
import { FadeSwap } from "@/components/motion/fade-swap";
import { RequiredDocumentsChecklist } from "@/components/required-documents-checklist";

type LoanStatus = ActiveLoan["status"];

const tabs: Array<"All" | LoanStatus> = [
  "All",
  "pending_disbursement",
  "active",
  "overdue",
  "completed",
  "defaulted",
];

const tabLabel: Record<"All" | LoanStatus, string> = {
  All: "All",
  pending_disbursement: "Awaiting Approval",
  active: "On Track",
  overdue: "Overdue",
  completed: "Completed",
  defaulted: "Defaulted",
};

function statBadge(s: LoanStatus) {
  if (s === "pending_disbursement")
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200 dark:border-amber-800 dark:text-amber-400 dark:bg-amber-900/20">
        Awaiting Approval
      </span>
    );
  if (s === "active")
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:border-emerald-800 dark:text-emerald-400">
        On Track
      </span>
    );
  if (s === "overdue")
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20">
        Overdue
      </span>
    );
  if (s === "defaulted")
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20">
        Defaulted
      </span>
    );
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200 dark:border-gray-800 dark:text-gray-400 dark:bg-gray-800">
      Completed
    </span>
  );
}

export default function LenderPortfolioPage() {
  const [tab, setTab] = useState<"All" | LoanStatus>("All");
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  const [confirmingLoan, setConfirmingLoan] = useState<ActiveLoan | null>(null);
  const { data: loans, isLoading } = useLenderActiveLoans();
  const approveDisbursement = useApproveDisbursement();

  const handleApprove = (loanId: string) => {
    approveDisbursement.mutate(loanId, {
      onSuccess: () => {
        toast.success("Disbursed — funds sent to the borrower's wallet.");
        setConfirmingLoan(null);
      },
      onError: (err: Error) => toast.error(err.message || "Failed to approve disbursement"),
    });
  };

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
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Loans</p>
          <p className="text-4xl font-bold text-[#1B2B3A] dark:text-white mt-1">
            {activeCount}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-[#C4A55A] p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Outstanding</p>
          <p className="text-4xl font-bold text-[#1B2B3A] dark:text-white mt-1">
            {formatCurrency(outstanding)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-red-500 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
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
                  : "bg-white border-gray-300 text-gray-600 hover:border-[#C4A55A] dark:border-gray-700 dark:text-gray-300 dark:bg-gray-900"
              }`}
            >
              {tabLabel[t]}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
            No loans in this category yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left pb-3 text-xs text-gray-400 font-semibold uppercase tracking-wider pr-4 dark:text-gray-500">
                    Borrower
                  </th>
                  <th className="text-left pb-3 text-xs text-gray-400 font-semibold uppercase tracking-wider pr-4 hidden sm:table-cell dark:text-gray-500">
                    Amount
                  </th>
                  <th className="text-left pb-3 text-xs text-gray-400 font-semibold uppercase tracking-wider pr-4 hidden md:table-cell dark:text-gray-500">
                    Rate
                  </th>
                  <th className="text-left pb-3 text-xs text-gray-400 font-semibold uppercase tracking-wider pr-4 dark:text-gray-500">
                    Progress
                  </th>
                  <th className="text-left pb-3 text-xs text-gray-400 font-semibold uppercase tracking-wider pr-4 hidden sm:table-cell dark:text-gray-500">
                    Next Payment
                  </th>
                  <th className="text-left pb-3 text-xs text-gray-400 font-semibold uppercase tracking-wider pr-4 dark:text-gray-500">
                    Status
                  </th>
                  <th className="w-16 pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map((loan) => (
                  <Fragment key={loan.id}>
                  <tr>
                    <td className="py-4 pr-4">
                      <p className="font-bold text-[#1B2B3A] dark:text-white">
                        {loan.borrower_name ?? "—"}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        #{loan.id.slice(0, 8)}
                      </p>
                    </td>
                    <td className="py-4 pr-4 text-gray-500 hidden sm:table-cell dark:text-gray-400">
                      {formatCurrency(loan.amount)}
                    </td>
                    <td className="py-4 pr-4 text-gray-500 hidden md:table-cell dark:text-gray-400">
                      {formatRate(loan.interest_rate)}
                    </td>
                    <td className="py-4 pr-4 min-w-30">
                      {loan.status === "pending_disbursement" ? (
                        <p className="text-xs text-amber-600 font-medium dark:text-amber-400">
                          Not disbursed yet
                        </p>
                      ) : loan.status === "overdue" ? (
                        <p className="text-xs text-red-500 font-medium">
                          Overdue
                        </p>
                      ) : (
                        <>
                          <p className="text-xs text-gray-400 mb-1 dark:text-gray-500">
                            {loan.paid_instalments}/{loan.total_instalments} paid
                          </p>
                          <div className="h-1.5 w-24 rounded-full bg-gray-200 overflow-hidden dark:bg-gray-700">
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
                        <span className="text-gray-500 dark:text-gray-400">
                          {loan.next_payment_date
                            ? new Date(loan.next_payment_date).toLocaleDateString()
                            : "—"}
                        </span>
                      )}
                    </td>
                    <td className="py-4 pr-4">{statBadge(loan.status)}</td>
                    <td className="py-4">
                      {loan.status === "pending_disbursement" ? (
                        <div className="flex flex-col items-start gap-1.5">
                          <button
                            onClick={() => setConfirmingLoan(loan)}
                            disabled={approveDisbursement.isPending}
                            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {approveDisbursement.isPending && approveDisbursement.variables === loan.id
                              ? "Approving…"
                              : "Approve Disbursement"}
                          </button>
                          <div className="flex gap-3">
                            {loan.required_documents.length > 0 && (
                              <button
                                onClick={() =>
                                  setExpandedLoanId(expandedLoanId === loan.id ? null : loan.id)
                                }
                                className="text-xs font-medium text-gray-400 hover:text-[#C4A55A] underline whitespace-nowrap dark:text-gray-500"
                              >
                                {expandedLoanId === loan.id ? "Hide documents" : "Review documents"}
                              </button>
                            )}
                            <Link
                              href={`/lender/loan-detail?loanId=${loan.id}`}
                              className="text-xs font-medium text-gray-400 hover:text-[#C4A55A] underline whitespace-nowrap dark:text-gray-500"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <Link
                          href={`/lender/loan-detail?loanId=${loan.id}`}
                          className="text-xs px-3 py-1.5 rounded-lg bg-[#C4A55A] text-white font-semibold hover:bg-[#b3944a] transition-colors"
                        >
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                  {expandedLoanId === loan.id && loan.status === "pending_disbursement" && (
                    <tr>
                      <td colSpan={7} className="bg-gray-50 dark:bg-gray-950 px-4 py-4 dark:bg-gray-800/60">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                          Documents this offer required — verify before releasing funds
                        </p>
                        <RequiredDocumentsChecklist items={loan.required_documents_status} readOnly />
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#1B2B3A] dark:text-white">
              Approve disbursement?
            </h2>
            <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">
              This sends{" "}
              <strong className="text-[#1B2B3A] dark:text-white">
                {formatCurrency(confirmingLoan.amount)}
              </strong>{" "}
              from your wallet to{" "}
              <strong className="text-[#1B2B3A] dark:text-white">
                {confirmingLoan.borrower_name ?? "the borrower"}
              </strong>{" "}
              right now. This can&apos;t be undone.
            </p>

            <div className="mt-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-3 space-y-1 text-xs dark:border-gray-800">
              <div className="flex justify-between text-gray-600 dark:text-gray-400 dark:text-gray-300">
                <span>Loan amount to borrower</span>
                <span>{formatCurrency(confirmingLoan.amount)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400 dark:text-gray-300">
                <span>Platform fee (0.5%)</span>
                <span>{formatCurrency(calcPlatformFee(confirmingLoan.amount))}</span>
              </div>
              <div className="flex justify-between font-semibold text-[#1B2B3A] dark:text-white pt-1 border-t border-gray-200 dark:border-gray-700 dark:border-gray-800">
                <span>Total debited from your wallet</span>
                <span>
                  {formatCurrency(confirmingLoan.amount + calcPlatformFee(confirmingLoan.amount))}
                </span>
              </div>
            </div>

            <div className="mt-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 p-3 space-y-1 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1 dark:text-emerald-400">
                What you&apos;ll earn back
              </p>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Interest rate</span>
                <span>{formatRate(confirmingLoan.interest_rate)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400 dark:text-gray-300">
                <span>Term</span>
                <span>{formatDuration(confirmingLoan.duration, confirmingLoan.duration_days)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400 dark:text-gray-300">
                <span>Total interest</span>
                <span>{formatCurrency(confirmingLoan.total_repayable - confirmingLoan.amount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-700 dark:text-emerald-400 pt-1 border-t border-emerald-200 dark:border-emerald-800">
                <span>Total repayable to you</span>
                <span>{formatCurrency(confirmingLoan.total_repayable)}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setConfirmingLoan(null)}
                disabled={approveDisbursement.isPending}
                className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:border-gray-400 disabled:opacity-50 dark:hover:border-gray-600 dark:border-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(confirmingLoan.id)}
                disabled={approveDisbursement.isPending}
                className="px-5 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50"
              >
                {approveDisbursement.isPending ? "Disbursing…" : "Yes, disburse funds"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </FadeSwap>
  );
}
