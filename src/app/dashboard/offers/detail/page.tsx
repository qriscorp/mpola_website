"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { formatCurrency, formatRate, formatDuration } from "@/lib/format";
import { useApplicationDetail } from "@/hooks/use-lender";
import { useRespondToOffer } from "@/hooks/use-offers";
import { CardSkeleton } from "@/components/skeletons";
import { InfoTip } from "@/components/info-tip";
import { RequiredDocumentsChecklist } from "@/components/required-documents-checklist";

// Matches mpola_api's REQUIRED_ACCEPTED_GUARANTORS (routers/loans.py).
const REQUIRED_ACCEPTED_GUARANTORS = 2;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-UG", { day: "numeric", month: "long", year: "numeric" });
}

/** The full picture behind one specific offer — who made it, every term,
 * and what's still needed before it can be accepted. Reached by clicking
 * any offer, whether from the all-offers browse list or a single request's
 * offer list — accept/decline both live here now, instead of being buried
 * inline on a compact row. Mirrors mpola_app's offer-detail.tsx. */
function OfferDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const offerId = searchParams.get("offerId");
  const applicationId = searchParams.get("applicationId") ?? "";

  const { data: application, isLoading } = useApplicationDetail(applicationId);
  const { mutate: respond, isPending } = useRespondToOffer();

  const offer = application?.offers?.find((o) => o.id === offerId);
  const acceptedGuarantors = (application?.guarantors ?? []).filter(
    (g) => g.status === "accepted",
  ).length;
  const guarantorsReady = acceptedGuarantors >= REQUIRED_ACCEPTED_GUARANTORS;

  if (!offerId || !applicationId) {
    return <p className="text-sm text-gray-500">Missing offer reference.</p>;
  }

  if (isLoading) {
    return <CardSkeleton count={2} />;
  }

  if (!offer) {
    return <p className="text-sm text-gray-500">Offer not found.</p>;
  }

  const handleDecline = () => {
    if (!confirm("Decline this offer? This can't be undone.")) return;
    respond(
      { offerId: offer.id, applicationId, status: "declined" },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">Offer Details</h1>
      </div>

      {/* Lender — the creator of this offer */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F8F5] dark:bg-[#2BB5A0]/10">
              <FileText className="h-5 w-5 text-[#2BB5A0]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#1B2B3A] dark:text-white">
                  {offer.lender_name ?? "Lender"}
                </p>
                <span
                  title={
                    offer.lender_kyc_status === "verified"
                      ? "This lender has completed identity verification."
                      : "This lender has not completed identity verification yet."
                  }
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    offer.lender_kyc_status === "verified"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {offer.lender_kyc_status === "verified" ? "Verified" : "Not Verified"}
                </span>
              </div>
              {offer.template_id && (
                <span className="mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2BB5A0]/10 text-[#2BB5A0]">
                  Auto-matched from a standing offer
                </span>
              )}
            </div>
            <span className="ml-auto px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold capitalize dark:bg-gray-800 dark:text-gray-300">
              {offer.status}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Loan Amount</p>
              <p className="text-lg font-bold text-[#1B2B3A] dark:text-white">
                {formatCurrency(offer.amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Interest Rate</p>
              <p className="text-lg font-bold text-[#2BB5A0]">{formatRate(offer.interest_rate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-lg font-bold text-[#1B2B3A] dark:text-white">
                {formatDuration(offer.duration, offer.duration_days)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {offer.duration_days != null ? "Repayment Due" : "Monthly Payment"}
              </p>
              <p className="text-lg font-bold text-[#C4A55A]">
                {formatCurrency(offer.monthly_payment ?? 0)}
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-4 text-sm dark:border-gray-800">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Repayable</span>
              <span className="font-semibold text-[#2BB5A0]">
                {formatCurrency(offer.total_repayable ?? 0)}
              </span>
            </div>
            {offer.application_reference && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Request Reference</span>
                <span className="font-medium text-[#1B2B3A] dark:text-white">
                  #{offer.application_reference}
                </span>
              </div>
            )}
            {offer.loan_type && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loan Type</span>
                <span className="font-medium capitalize text-[#1B2B3A] dark:text-white">
                  {offer.loan_type}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Offer Made</span>
              <span className="font-medium text-[#1B2B3A] dark:text-white">
                {formatDate(offer.created_at)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {!guarantorsReady && offer.status === "pending" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
          Needs {REQUIRED_ACCEPTED_GUARANTORS} confirmed guarantors before you can accept —{" "}
          {acceptedGuarantors} of {application?.guarantors?.length ?? 0} confirmed so far.
        </div>
      )}

      {offer.required_documents_status.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1.5">
              <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                Documents This Lender Requires
              </h2>
              <InfoTip text="Already-uploaded documents (KYC or from a past offer) count automatically." />
            </div>
          </CardHeader>
          <CardContent>
            <RequiredDocumentsChecklist
              items={offer.required_documents_status}
              applicationId={applicationId}
              readOnly={offer.status !== "pending"}
            />
          </CardContent>
        </Card>
      )}

      {offer.status === "pending" && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDecline}
            disabled={isPending}
          >
            Decline
          </Button>
          <Button
            className="flex-1 bg-[#2BB5A0] text-white hover:bg-[#239E8C]"
            disabled={isPending}
            onClick={() =>
              router.push(`/dashboard/offers/accept?offerId=${offer.id}&applicationId=${applicationId}`)
            }
          >
            Review & Accept
          </Button>
        </div>
      )}
    </div>
  );
}

export default function OfferDetailPage() {
  return (
    <Suspense fallback={<CardSkeleton count={2} />}>
      <OfferDetailContent />
    </Suspense>
  );
}
