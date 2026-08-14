"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LenderPageHeader } from "@/components/lender-top-nav";
import { CardSkeleton } from "@/components/skeletons";
import { useLenderLoanDetail } from "@/hooks/use-lender";
import { formatCurrency, formatRate, formatDuration } from "@/lib/format";
import { RequiredDocumentsChecklist } from "@/components/required-documents-checklist";

const guarantorStatusClass: Record<string, string> = {
  accepted: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900",
  pending: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900",
  declined: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900",
};

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
  completed: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900",
  pending: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900",
  failed: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900",
};

function LoanDetailContent() {
  const searchParams = useSearchParams();
  const loanId = searchParams.get("loanId") ?? "";
  const { data: loan, isLoading, error } = useLenderLoanDetail(loanId);

  if (!loanId || error) {
    return (
      <p className="py-10 text-center text-sm text-gray-400">
        {error ? "This loan couldn't be found." : "No loan selected."}
      </p>
    );
  }

  if (isLoading || !loan) {
    return <CardSkeleton count={2} />;
  }

  const totalInterest = loan.total_repayable - loan.amount;

  return (
    <div className="space-y-6">
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

      {/* Borrower contact + terms */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
        <h3 className="font-semibold text-[#1B2B3A] dark:text-white mb-4">
          Borrower &amp; Terms
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</p>
            <p className="mt-0.5 text-[#1B2B3A] dark:text-white">{loan.borrower_phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</p>
            <p className="mt-0.5 text-[#1B2B3A] dark:text-white">{loan.borrower_email ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Term</p>
            <p className="mt-0.5 text-[#1B2B3A] dark:text-white">
              {formatDuration(loan.duration, loan.duration_days)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Repayable</p>
            <p className="mt-0.5 text-[#1B2B3A] dark:text-white">{formatCurrency(loan.total_repayable)}</p>
          </div>
        </div>
        {loan.borrower_note && (
          <div className="mt-4 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Note from borrower
            </p>
            <p className="text-sm text-[#1B2B3A] dark:text-white italic">&ldquo;{loan.borrower_note}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Guarantors */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
        <h3 className="font-semibold text-[#1B2B3A] dark:text-white mb-4">
          Guarantors ({loan.guarantors.length})
        </h3>
        {loan.guarantors.length === 0 ? (
          <p className="text-sm text-gray-400">No guarantors on this loan.</p>
        ) : (
          <div className="space-y-2">
            {loan.guarantors.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between py-2 border-b last:border-0 border-gray-100 dark:border-gray-800"
              >
                <div>
                  <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                    {g.full_name ?? g.username}
                  </p>
                  <p className="text-xs text-gray-400">
                    {g.relationship_type ?? "—"} &middot; @{g.username}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${guarantorStatusClass[g.status] ?? guarantorStatusClass.pending}`}
                >
                  {g.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Required documents */}
      {loan.required_documents_status.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
          <h3 className="font-semibold text-[#1B2B3A] dark:text-white mb-4">
            Documents Provided
          </h3>
          <RequiredDocumentsChecklist items={loan.required_documents_status} readOnly />
        </div>
      )}

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
    <div className="space-y-6">
      <LenderPageHeader title="Loan Detail" />
      <Suspense fallback={<CardSkeleton count={2} />}>
        <LoanDetailContent />
      </Suspense>
    </div>
  );
}
