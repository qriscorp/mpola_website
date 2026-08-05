"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { BorrowerPageHeader } from "@/components/top-nav";
import { CardSkeleton } from "@/components/skeletons";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

const METHOD_LABEL: Record<string, string> = {
  mobile_money: "Mobile Money",
  wallet: "Mpola Wallet",
};

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReceiptContent() {
  const searchParams = useSearchParams();
  const loanIdParam = searchParams.get("loanId");
  const repaymentIdParam = searchParams.get("repaymentId");

  const { data: defaultLoan, isLoading: loadingDefault } = useQuery({
    queryKey: ["active-loan"],
    queryFn: api.getActiveLoan,
    enabled: !loanIdParam,
  });

  const loanId = loanIdParam ?? defaultLoan?.id;

  const { data: loan, isLoading: loadingLoan } = useQuery({
    queryKey: ["loan-detail", loanId],
    queryFn: () => api.getLoanDetail(loanId as string),
    enabled: !!loanId,
  });

  if (loadingDefault || loadingLoan || !loan) {
    return <CardSkeleton count={1} height="h-96" />;
  }

  const repayments = loan.repayments ?? [];
  const repayment = repaymentIdParam
    ? repayments.find((r) => r.id === repaymentIdParam)
    : repayments[0];

  if (!repayment) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
        No repayments have been made on this loan yet.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-2xl border-2 border-[#2BB5A0] p-8 shadow-sm">
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-3">
          <svg
            className="w-8 h-8 text-[#2BB5A0]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-[#1B2B3A] dark:text-white">
          Payment Successful
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          {repayment.status === "completed" ? "Transaction confirmed" : repayment.status}
        </p>
      </div>

      <div className="space-y-3 divide-y divide-gray-100 dark:divide-gray-800">
        {[
          { label: "Transaction ID", value: `#${repayment.transaction_id ?? repayment.id}` },
          { label: "Date", value: formatDateTime(repayment.created_at) },
          {
            label: "Method",
            value: repayment.payment_method
              ? (METHOD_LABEL[repayment.payment_method] ?? repayment.payment_method)
              : "—",
          },
          { label: "Loan Ref", value: `#${loan.id.slice(0, 8)}` },
        ].map((row) => (
          <div key={row.label} className="flex justify-between py-3 text-sm first:pt-0">
            <span className="text-gray-400">{row.label}</span>
            <span className="font-medium text-[#1B2B3A] dark:text-white">
              {row.value}
            </span>
          </div>
        ))}
        <div className="flex justify-between py-3 text-sm">
          <span className="font-bold text-[#1B2B3A] dark:text-white">
            Amount Paid
          </span>
          <span className="font-extrabold text-[#2BB5A0] text-lg">
            {formatCurrency(repayment.amount)}
          </span>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => toast.info("Receipt downloads aren't available yet")}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors"
        >
          <Download className="w-4 h-4" /> Download Receipt
        </button>
        <Link
          href="/dashboard/repayments"
          className="flex-1 text-center px-4 py-2.5 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors"
        >
          View Schedule
        </Link>
      </div>
    </div>
  );
}

export default function ReceiptsPage() {
  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Payment Receipt" />
      <Suspense fallback={<CardSkeleton count={1} height="h-96" />}>
        <ReceiptContent />
      </Suspense>
    </div>
  );
}
