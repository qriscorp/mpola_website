"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { BorrowerPageHeader } from "@/components/top-nav";
import { CardSkeleton } from "@/components/skeletons";
import { useMyRepayments } from "@/hooks/use-repayments";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

const PAGE_SIZE = 20;

const METHOD_LABEL: Record<string, string> = {
  mobile_money: "Mobile Money",
  wallet: "Mpola Wallet",
};

const STATUS_CLASS: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  late: "bg-red-50 text-red-600 border-red-200",
};

function formatDateTime(iso: string): string {
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

export default function ReceiptsPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useMyRepayments(page * PAGE_SIZE, PAGE_SIZE);
  const repayments = data?.repayments ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleDownload = (repaymentId: string) => {
    api
      .downloadRepaymentReceipt(repaymentId)
      .catch(() => toast.error("Couldn't download the receipt. Please try again."));
  };

  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Payment Receipts" />

      {isLoading ? (
        <CardSkeleton count={3} height="h-20" />
      ) : repayments.length === 0 ? (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center text-gray-500">
          You haven&apos;t made any repayments yet — once you do, every receipt
          shows up here for download.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
          {repayments.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[#1B2B3A] dark:text-white">
                    {formatCurrency(r.amount)}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${
                      STATUS_CLASS[r.status] ?? "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Instalment #{r.instalment_number} &middot;{" "}
                  {r.lender_name ? `To ${r.lender_name}` : `Loan #${r.loan_id.slice(0, 8)}`} &middot;{" "}
                  {METHOD_LABEL[r.payment_method ?? ""] ?? r.payment_method ?? "—"} &middot;{" "}
                  {formatDateTime(r.created_at)}
                </p>
              </div>
              <button
                onClick={() => handleDownload(r.id)}
                className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
