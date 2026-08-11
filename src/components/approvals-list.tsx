"use client";

import { CheckCircle2, UserCheck } from "lucide-react";
import { useGuarantorRequests, useRespondToGuarantorRequest } from "@/hooks/use-guarantors";
import { formatCurrency, formatDuration } from "@/lib/format";
import { toast } from "sonner";

/** Everything the current user has been asked to approve — right now just
 * guarantor requests, but the dedicated Approvals page (not buried inside
 * Notifications) is meant to be the one place a person checks for "is
 * there anything I need to act on," so future approval types belong here
 * too rather than growing into more one-off banners. */
export function ApprovalsList() {
  const { data, isLoading } = useGuarantorRequests("pending");
  const respond = useRespondToGuarantorRequest();

  const requests = data?.requests ?? [];

  const handleRespond = (guarantorId: string, status: "accepted" | "declined") => {
    respond.mutate(
      { guarantorId, status },
      {
        onSuccess: () => toast.success(status === "accepted" ? "You accepted the request" : "You declined the request"),
      },
    );
  };

  if (isLoading) return null;

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-gray-400">
        <CheckCircle2 className="h-10 w-10" />
        <p>Nothing needs your approval right now.</p>
      </div>
    );
  }

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
          <div key={r.id} className="rounded-lg bg-white dark:bg-gray-900 p-3 space-y-3">
            <p className="text-sm text-[#1B2B3A] dark:text-white">
              <span className="font-semibold">{r.borrower_name ?? "Someone"}</span> asked you to guarantee
              their loan request. If you approve, you&apos;re vouching for them — lenders will see you as one
              of their two required guarantors.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-lg bg-gray-50 dark:bg-gray-800 p-2.5 text-xs">
              <div>
                <p className="text-gray-400">Amount</p>
                <p className="font-semibold text-[#1B2B3A] dark:text-white">{formatCurrency(r.amount ?? 0)}</p>
              </div>
              <div>
                <p className="text-gray-400">Type</p>
                <p className="font-semibold text-[#1B2B3A] dark:text-white capitalize">{r.loan_type ?? "—"}</p>
              </div>
              <div>
                <p className="text-gray-400">Duration</p>
                <p className="font-semibold text-[#1B2B3A] dark:text-white">
                  {formatDuration(r.duration, r.duration_days)}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-gray-400">Purpose</p>
                <p className="font-semibold text-[#1B2B3A] dark:text-white truncate">
                  {r.purpose || "Not specified"}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              No lender has been assigned yet — once both guarantors approve, this request becomes visible
              to lenders on the marketplace, and any of them can choose to fund it.
            </p>
            <div className="flex gap-2 justify-end">
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
