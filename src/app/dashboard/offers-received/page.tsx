"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BorrowerPageHeader } from "@/components/top-nav";
import { InfoTip } from "@/components/info-tip";
import { useApplicationDetail } from "@/hooks/use-lender";
import { useRespondToOffer } from "@/hooks/use-offers";
import { formatCurrency, formatRate } from "@/lib/format";
import { CardSkeleton } from "@/components/skeletons";
import { RequiredDocumentsChecklist } from "@/components/required-documents-checklist";

const avatarColors = ["#1B2B3A", "#2BB5A0", "#C4A55A", "#B0923E"];

// Matches mpola_api's REQUIRED_ACCEPTED_GUARANTORS (routers/loans.py).
const REQUIRED_ACCEPTED_GUARANTORS = 2;

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function OffersReceivedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId") ?? undefined;

  const { data: application, isLoading } = useApplicationDetail(
    applicationId ?? "",
  );
  const { mutate: respond, isPending } = useRespondToOffer();

  if (!applicationId) {
    return (
      <div className="space-y-6">
        <BorrowerPageHeader title="Offers Received" />
        <p className="text-sm text-gray-500">
          Pick a request from{" "}
          <a href="/dashboard/my-requests" className="text-[#2BB5A0] underline">
            My Requests
          </a>{" "}
          to see its offers.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <BorrowerPageHeader title="Offers Received" />
        <CardSkeleton count={2} />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-6">
        <BorrowerPageHeader title="Offers Received" />
        <p className="text-sm text-gray-500">Request not found.</p>
      </div>
    );
  }

  const offers = application.offers ?? [];
  const acceptedGuarantors = (application.guarantors ?? []).filter(
    (g) => g.status === "accepted",
  ).length;
  const bestOfferId = offers.reduce<string | null>((bestId, o) => {
    if (o.status !== "pending") return bestId;
    if (!bestId) return o.id;
    const best = offers.find((x) => x.id === bestId);
    return best && o.interest_rate < best.interest_rate ? o.id : bestId;
  }, null);

  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Offers Received" />
      <p className="-mt-4 flex items-center gap-1.5 text-sm text-gray-500">
        Each offer below is a real lender proposing to fund this request.
        <InfoTip text="Accepting an offer immediately funds this loan and declines every other offer on it automatically — you can only accept one. Accepting requires both your guarantors to have already approved." />
      </p>

      <p className="text-sm text-gray-500 capitalize">
        Offers for request{" "}
        <span className="font-semibold text-[#1B2B3A] dark:text-white">
          #{application.id}
        </span>{" "}
        · {formatCurrency(application.amount)} · {application.loan_type} ·{" "}
        {application.duration} months
      </p>

      {acceptedGuarantors < REQUIRED_ACCEPTED_GUARANTORS && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          You need {REQUIRED_ACCEPTED_GUARANTORS} guarantors to confirm before
          you can accept an offer — {acceptedGuarantors} of{" "}
          {application.guarantors?.length ?? 0} have confirmed so far.
        </div>
      )}

      {offers.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          No offers yet — lenders are reviewing your request.
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer, idx) => {
            const isBest = offer.id === bestOfferId;
            return (
              <div
                key={offer.id}
                className={`bg-white dark:bg-gray-900 rounded-2xl border p-5 ${
                  isBest
                    ? "border-[#2BB5A0] shadow-sm"
                    : "border-gray-200 dark:border-gray-800"
                }`}
              >
                {isBest && (
                  <p className="text-xs font-bold text-[#2BB5A0] mb-3">
                    Best Offer
                  </p>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
                    style={{
                      backgroundColor:
                        avatarColors[idx % avatarColors.length],
                    }}
                  >
                    {initials(offer.lender_name)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#1B2B3A] dark:text-white">
                      {offer.lender_name ?? "Lender"}
                    </p>
                    <p className="text-lg font-extrabold text-[#2BB5A0] mt-1">
                      {formatRate(offer.interest_rate)} · {offer.duration}{" "}
                      months · {formatCurrency(offer.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Total repayable:{" "}
                      {formatCurrency(offer.total_repayable ?? 0)} · Status:{" "}
                      <span className="capitalize">{offer.status}</span>
                    </p>
                  </div>
                  {offer.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() =>
                          respond({
                            offerId: offer.id,
                            applicationId: application.id,
                            status: "declined",
                          })
                        }
                        disabled={isPending}
                        className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/offers/accept?offerId=${offer.id}&applicationId=${application.id}`,
                          )
                        }
                        disabled={isPending}
                        className="px-5 py-2 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors disabled:opacity-50"
                      >
                        Review &amp; Accept
                      </button>
                    </div>
                  )}
                </div>
                {offer.required_documents_status.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Documents this lender requires
                    </p>
                    <RequiredDocumentsChecklist items={offer.required_documents_status} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OffersReceivedPage() {
  return (
    <Suspense fallback={<CardSkeleton count={2} />}>
      <OffersReceivedContent />
    </Suspense>
  );
}
