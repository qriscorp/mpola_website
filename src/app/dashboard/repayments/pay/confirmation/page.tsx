"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { BorrowerPageHeader } from "@/components/top-nav";
import { formatCurrency } from "@/lib/format";
import { api } from "@/lib/api";
import { CardSkeleton } from "@/components/skeletons";

function formatDateTime(iso: string | null): string {
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

const METHOD_LABEL: Record<string, string> = {
  mobile_money: "Mobile Money",
  wallet: "Mpola Wallet",
};

function PaymentFailedContent({
  reason,
  amount,
  method,
  loanRef,
}: {
  reason: string;
  amount: number;
  method: string;
  loanRef: string;
}) {
  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Payment Failed" />

      <div className="mx-auto max-w-3xl space-y-4">
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-8">
          <div className="mb-5 flex flex-col items-center">
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-10 w-10 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl leading-tight font-black text-[#1B2B3A]">
              Payment Failed
            </h2>
            <p className="max-w-md text-center text-sm sm:text-base text-gray-500">
              {reason}
            </p>
          </div>

          <div className="space-y-3">
            {[
              ["Attempted Amount", formatCurrency(amount)],
              ["Method", METHOD_LABEL[method] ?? method],
              ["Loan Ref", `#${loanRef}`],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="flex items-center justify-between border-b border-red-200 py-3 last:border-b-0"
              >
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-semibold text-[#1B2B3A]">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Nothing was charged — you can try again with the same or a different payment method.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard/repayments"
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-center text-sm font-semibold text-[#1B2B3A] transition-colors hover:bg-gray-50"
          >
            View Schedule
          </Link>
          <Link
            href={`/dashboard/repayments/pay?loanId=${loanRef}`}
            className="inline-flex items-center justify-center rounded-xl bg-[#149D8E] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#108a7d]"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}

function PaymentSuccessContent({
  repaymentId,
  txn,
  amount,
  method,
  loanRef,
  date,
}: {
  repaymentId: string | null;
  txn: string;
  amount: number;
  method: string;
  loanRef: string;
  date: string | null;
}) {
  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Payment Receipt" />

      <div className="mx-auto max-w-3xl space-y-4">
        <div className="rounded-2xl border-2 border-[#19A44B] bg-[#E6F4F2] p-8">
          <div className="mb-5 flex flex-col items-center">
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[#DCEDEA]">
              <svg
                className="h-10 w-10 text-[#149D8E]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl leading-tight font-black text-[#1B2B3A]">
              Payment Successful
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              Transaction confirmed
            </p>
          </div>

          <div className="space-y-3">
            {[
              ["Transaction ID", `#${txn}`],
              ["Date", formatDateTime(date)],
              ["Method", METHOD_LABEL[method] ?? method],
              ["Loan Ref", `#${loanRef}`],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="flex items-center justify-between border-b border-[#B9DDD7] py-3"
              >
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-semibold text-[#1B2B3A]">
                  {value}
                </span>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              <span className="text-lg sm:text-xl font-bold text-[#1B2B3A]">
                Amount Paid
              </span>
              <span className="text-2xl sm:text-3xl leading-none font-black text-[#19A44B]">
                {formatCurrency(amount)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => {
              if (!repaymentId) {
                toast.error("This payment has no receipt on file.");
                return;
              }
              api
                .downloadRepaymentReceipt(repaymentId)
                .catch(() => toast.error("Couldn't download the receipt. Please try again."));
            }}
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-[#1B2B3A] transition-colors hover:bg-gray-50"
          >
            Download Receipt
          </button>
          <Link
            href="/dashboard/repayments"
            className="inline-flex items-center justify-center rounded-xl bg-[#149D8E] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#108a7d]"
          >
            View Schedule
          </Link>
        </div>
      </div>
    </div>
  );
}

function PaymentConfirmationContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "success";
  const amount = Number(searchParams.get("amount") ?? 0);
  const method = searchParams.get("method") ?? "";
  const loanRef = searchParams.get("loanRef") ?? "—";

  if (status === "failed") {
    return (
      <PaymentFailedContent
        reason={searchParams.get("reason") ?? "Payment failed. Please try again."}
        amount={amount}
        method={method}
        loanRef={loanRef}
      />
    );
  }

  return (
    <PaymentSuccessContent
      repaymentId={searchParams.get("repaymentId")}
      txn={searchParams.get("txn") ?? "—"}
      amount={amount}
      method={method}
      loanRef={loanRef}
      date={searchParams.get("date")}
    />
  );
}

export default function PaymentConfirmationPage() {
  return (
    <Suspense fallback={<CardSkeleton count={1} height="h-96" />}>
      <PaymentConfirmationContent />
    </Suspense>
  );
}
