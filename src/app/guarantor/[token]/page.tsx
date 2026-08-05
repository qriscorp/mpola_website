"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { CardSkeleton } from "@/components/skeletons";

export default function GuarantorInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [responded, setResponded] = useState<"accepted" | "declined" | null>(
    null,
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["guarantor-invite", token],
    queryFn: () => api.getGuarantorInvite(token),
    retry: false,
  });

  const respond = useMutation({
    mutationFn: (status: "accepted" | "declined") =>
      api.respondToGuarantorInvite(token, status),
    onSuccess: (_result, status) => setResponded(status),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <CardSkeleton count={1} height="h-72" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-[#1B2B3A]">
            Invite not found
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            This link may have expired or already been used.
          </p>
        </div>
      </div>
    );
  }

  const { guarantor, application } = data;
  const alreadyResponded = guarantor.status !== "pending";
  const finalStatus = responded ?? (alreadyResponded ? guarantor.status : null);

  return (
    <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#2BB5A0] flex items-center justify-center text-white font-bold">
            M
          </div>
          <span className="font-bold text-[#1B2B3A]">Mpola</span>
        </div>

        {finalStatus ? (
          <div className="text-center py-6">
            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                finalStatus === "accepted" ? "bg-[#E6F4F2]" : "bg-red-50"
              }`}
            >
              <span
                className={`text-3xl ${finalStatus === "accepted" ? "text-[#2BB5A0]" : "text-red-500"}`}
              >
                {finalStatus === "accepted" ? "✓" : "✕"}
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#1B2B3A]">
              {finalStatus === "accepted"
                ? "You've confirmed as guarantor"
                : "You've declined this request"}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Thanks for responding — no further action needed.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-[#1B2B3A]">
              Guarantor Request
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold text-[#1B2B3A]">
                {application.borrower_name ?? "A borrower"}
              </span>{" "}
              on Mpola has asked you, {guarantor.name}, to be a guarantor for
              their loan.
            </p>

            <div className="mt-5 rounded-xl border border-gray-200 divide-y divide-gray-100">
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold text-[#1B2B3A]">
                  {application.amount ? formatCurrency(application.amount) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-gray-500">Duration</span>
                <span className="font-semibold text-[#1B2B3A]">
                  {application.duration ? `${application.duration} months` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm capitalize">
                <span className="text-gray-500">Type</span>
                <span className="font-semibold text-[#1B2B3A]">
                  {application.loan_type ?? "—"}
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              As a guarantor, you may be contacted if the borrower falls
              behind on repayments. Only confirm if you understand and accept
              this responsibility.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => respond.mutate("declined")}
                disabled={respond.isPending}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 disabled:opacity-50"
              >
                Decline
              </button>
              <button
                onClick={() => respond.mutate("accepted")}
                disabled={respond.isPending}
                className="flex-1 py-2.5 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] disabled:opacity-50"
              >
                {respond.isPending ? "Submitting…" : "Confirm"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
