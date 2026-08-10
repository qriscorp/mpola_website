"use client";

import { UserCheck } from "lucide-react";
import { useGuarantorRequests, useRespondToGuarantorRequest } from "@/hooks/use-guarantors";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

/** "You were asked to be a guarantor" — shown on both the borrower and
 * lender notifications pages, since either role can be invited. This is
 * the only place to respond now that guarantors need a real Mpola account
 * (no more SMS link to a public page). */
export function GuarantorRequestsBanner() {
  const { data, isLoading } = useGuarantorRequests("pending");
  const respond = useRespondToGuarantorRequest();

  const requests = data?.requests ?? [];
  if (isLoading || requests.length === 0) return null;

  const handleRespond = (guarantorId: string, status: "accepted" | "declined") => {
    respond.mutate(
      { guarantorId, status },
      {
        onSuccess: () => toast.success(status === "accepted" ? "You accepted the request" : "You declined the request"),
      },
    );
  };

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900 px-4 py-3 sm:px-5 space-y-3">
      <div className="flex items-center gap-2">
        <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
          Guarantor request{requests.length > 1 ? "s" : ""} for you
        </p>
      </div>
      <div className="space-y-2">
        {requests.map((r) => (
          <div
            key={r.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg bg-white dark:bg-gray-900 p-3"
          >
            <p className="text-sm text-[#1B2B3A] dark:text-white">
              <span className="font-semibold">{r.borrower_name ?? "Someone"}</span> asked you to guarantee
              their {formatCurrency(r.amount ?? 0)} {r.loan_type ?? ""} loan request
              {r.duration ? ` (${r.duration} months)` : ""}.
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleRespond(r.id, "declined")}
                disabled={respond.isPending}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-red-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                Decline
              </button>
              <button
                onClick={() => handleRespond(r.id, "accepted")}
                disabled={respond.isPending}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
