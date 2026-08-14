"use client";

import Link from "next/link";
import { BorrowerPageHeader } from "@/components/top-nav";
import { useActiveLoan } from "@/hooks/use-dashboard";
import { useLoanDetail } from "@/hooks/use-repayments";
import { formatCurrency } from "@/lib/format";
import { TableSkeleton } from "@/components/skeletons";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function RepaymentsPage() {
  const { data: activeLoan, isLoading: loanLoading } = useActiveLoan();
  const { data: loan, isLoading: detailLoading } = useLoanDetail(
    activeLoan?.id,
  );

  if (loanLoading || detailLoading) {
    return (
      <div className="space-y-6">
        <BorrowerPageHeader title="Repayment Schedule" />
        <TableSkeleton rows={4} />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="space-y-6">
        <BorrowerPageHeader title="Repayment Schedule" />
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          You don&apos;t have an active loan yet.
        </div>
      </div>
    );
  }

  const outstanding = Math.max(loan.total_repayable - loan.total_paid, 0);
  const progressPct =
    loan.total_repayable > 0
      ? Math.round((loan.total_paid / loan.total_repayable) * 100)
      : 0;
  const remaining = loan.total_instalments - loan.paid_instalments;

  // instalment_number isn't a unique row key on its own — a partial payment
  // that doesn't clear an instalment leaves the next top-up toward that same
  // instalment with the same number, so two real Repayment rows can share
  // it. Key off each repayment's own id instead; the single synthetic "due"
  // row below can't collide with any real repayment id.
  const rows = [
    ...(loan.repayments ?? []).map((r) => ({
      key: r.id,
      num: r.instalment_number,
      date: formatDate(r.created_at),
      amount: r.amount,
      status: "paid" as const,
    })),
    ...(loan.status === "active" && loan.next_payment_amount
      ? [
          {
            key: "due",
            num: loan.paid_instalments + 1,
            date: formatDate(loan.next_payment_date),
            amount: loan.next_payment_amount,
            status: "due" as const,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Repayment Schedule" />

      {/* Hero banner */}
      <div className="rounded-2xl bg-[#2BB5A0] p-6 sm:p-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
          Outstanding Balance
        </p>
        <p className="text-5xl font-extrabold mt-1">
          {formatCurrency(outstanding)}
        </p>
        <div className="mt-4 h-2 rounded-full bg-white/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-sm text-white/80 mt-2">
          {progressPct}% repaid &middot; {remaining} payment
          {remaining === 1 ? "" : "s"} remaining
        </p>
      </div>

      {/* Schedule table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-[#1B2B3A] dark:text-white">
            Repayment Schedule
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  #
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.map((inst) => (
                <tr
                  key={inst.key}
                  className={
                    inst.status === "due"
                      ? "bg-amber-50/50 dark:bg-amber-900/10"
                      : ""
                  }
                >
                  <td className="px-4 py-4 font-semibold text-[#1B2B3A] dark:text-white">
                    {inst.num}
                  </td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-300">
                    {inst.date}
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#1B2B3A] dark:text-white">
                    {formatCurrency(inst.amount)}
                  </td>
                  <td className="px-4 py-4">
                    {inst.status === "paid" ? (
                      <span className="px-2 py-1 rounded-full bg-teal-50 text-[#2BB5A0] text-xs font-semibold dark:bg-[#2BB5A0]/10">
                        Paid
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold dark:bg-amber-900/20 dark:text-amber-400">
                        Due
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {inst.status === "due" && (
                      <Link
                        href={`/dashboard/repayments/pay?loanId=${loan.id}`}
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
