"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LenderPageHeader } from "@/components/lender-top-nav";
import { CardSkeleton } from "@/components/skeletons";
import { useLenderLoanDetail } from "@/hooks/use-lender";
import { formatCurrency, formatRate } from "@/lib/format";

const statusLabel: Record<string, string> = {
  active: "On Track",
  overdue: "Overdue",
  completed: "Completed",
  defaulted: "Defaulted",
};

const statusClass: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  overdue: "bg-red-500/20 text-red-300 border-red-500/30",
  completed: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  defaulted: "bg-red-500/20 text-red-300 border-red-500/30",
};

const repaymentStatusClass: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  failed: "bg-red-50 text-red-600 border-red-200",
};

function LoanDetailContent() {
  const searchParams = useSearchParams();
  const loanId = searchParams.get("loanId") ?? "";
  const { data: loan, isLoading } = useLenderLoanDetail(loanId);

  if (!loanId) {
    return (
      <p className="py-10 text-center text-sm text-gray-400">
        No loan selected.
      </p>
    );
  }

  if (isLoading || !loan) {
    return <CardSkeleton count={2} />;
  }

  const totalInterest = loan.total_repayable - loan.amount;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Hero card */}
      <div className="rounded-2xl bg-[#1B2B3A] p-6 sm:p-8 text-white">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Borrower
            </p>
            <h2 className="text-2xl font-bold mt-1">
              {loan.borrower_name ?? "—"}
            </h2>
            <p className="text-sm text-white/50 mt-0.5">
              #{loan.id.slice(0, 8)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Principal
            </p>
            <p className="text-3xl font-extrabold mt-1">
              {formatCurrency(loan.amount)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Rate
            </p>
            <p className="text-3xl font-extrabold mt-1">
              {formatRate(loan.interest_rate)}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-white/10">
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Total Interest
            </p>
            <p className="text-3xl font-extrabold mt-1 text-[#C4A55A]">
              {formatCurrency(totalInterest)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Status
            </p>
            <div className="mt-1">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${statusClass[loan.status] ?? statusClass.active}`}
              >
                {statusLabel[loan.status] ?? loan.status}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Progress
            </p>
            <p className="text-3xl font-extrabold mt-1">
              {loan.paid_instalments}/{loan.total_instalments}
            </p>
          </div>
        </div>
      </div>

      {/* Repayment history */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
        <h3 className="font-semibold text-[#1B2B3A] dark:text-white mb-4">
          Repayment History
        </h3>
        {!loan.repayments || loan.repayments.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            No repayments have been made on this loan yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    #
                  </th>
                  <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider hidden sm:table-cell">
                    Method
                  </th>
                  <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {loan.repayments.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 text-gray-400 text-xs font-mono">
                      {r.instalment_number}
                    </td>
                    <td className="py-3 text-[#1B2B3A] dark:text-white font-medium">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-gray-500 hidden sm:table-cell">
                      {r.payment_method ?? "—"}
                    </td>
                    <td className="py-3 font-semibold text-[#1B2B3A] dark:text-white">
                      {formatCurrency(r.amount)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${repaymentStatusClass[r.status] ?? repaymentStatusClass.pending}`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

export default function LoanDetailPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <LenderPageHeader title="Loan Detail" />
      <Suspense fallback={<CardSkeleton count={2} />}>
        <LoanDetailContent />
      </Suspense>
    </div>
  );
}
