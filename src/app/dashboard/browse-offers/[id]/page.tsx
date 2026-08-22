"use client";

import { use } from "react";
import Link from "next/link";
import { BorrowerPageHeader } from "@/components/top-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/skeletons";
import { RequiredDocumentsChecklist } from "@/components/required-documents-checklist";
import { useOfferTemplateDetail } from "@/hooks/use-application";
import { formatCurrency, formatRate, formatDuration } from "@/lib/format";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-UG", { month: "long", year: "numeric" });
}

export default function OfferTemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: offer, isLoading, isError, error } = useOfferTemplateDetail(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <BorrowerPageHeader title="Offer Detail" />
        <CardSkeleton count={2} />
      </div>
    );
  }

  if (isError || !offer) {
    // The backend gives a specific message when this is "you already have
    // an offer from this lender" rather than a generic 404 — surface it
    // as-is instead of the generic fallback when present.
    const message =
      error instanceof Error && error.message
        ? error.message
        : "This offer is no longer available.";
    return (
      <div className="space-y-6">
        <BorrowerPageHeader title="Offer Detail" />
        <p className="text-sm text-gray-500">
          {message}{" "}
          <Link href="/dashboard/browse-offers" className="text-[#2BB5A0] underline">
            Back to Browse Offers
          </Link>
        </p>
      </div>
    );
  }

  const applyHref = `/dashboard/apply?loanType=${encodeURIComponent(offer.accepted_loan_types[0] ?? "")}&maxInterestRate=${offer.interest_rate}${
    offer.max_duration_days != null
      ? `&durationDays=${offer.max_duration_days}`
      : offer.max_duration != null
        ? `&duration=${offer.max_duration}`
        : ""
  }`;

  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Offer Detail" />

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-15 h-15 rounded-full bg-[#1B2B3A] flex items-center justify-center text-white font-bold text-lg shrink-0">
              {(offer.lender_name ?? "?").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg text-[#1B2B3A] dark:text-white">
                {offer.lender_name ?? "Lender"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {offer.city ? `${offer.city} · ` : ""}Member since {formatDate(offer.lender_member_since)}
              </p>
              <div className="mt-1.5 flex gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    offer.lender_kyc_status === "verified"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {offer.lender_kyc_status === "verified" ? "Verified" : "Not Verified"}
                </span>
              </div>
            </div>
            <Link href={applyHref}>
              <Button className="bg-[#2BB5A0] hover:bg-[#239E8C] text-white">
                Apply to This Offer
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#E8F8F5] dark:bg-[#2BB5A0]/10 rounded-xl p-4 text-center">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Interest Rate</p>
              <p className="font-bold text-[#2BB5A0]">{formatRate(offer.interest_rate)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Max Amount</p>
              <p className="font-bold text-[#1B2B3A] dark:text-white">{formatCurrency(offer.max_amount)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Min Amount</p>
              <p className="font-bold text-[#1B2B3A] dark:text-white">{formatCurrency(offer.min_amount)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Max Duration</p>
              <p className="font-bold text-[#1B2B3A] dark:text-white">
                {formatDuration(offer.max_duration, offer.max_duration_days)}
              </p>
            </div>
          </div>

          {offer.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300">{offer.description}</p>
          )}

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Accepted Loan Types
            </p>
            <div className="flex flex-wrap gap-2">
              {offer.accepted_loan_types.length === 0 ? (
                <span className="text-sm text-gray-500">All loan types</span>
              ) : (
                offer.accepted_loan_types.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 capitalize"
                  >
                    {t}
                  </span>
                ))
              )}
            </div>
          </div>

          {offer.required_documents_status.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Required Documents
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Get ready before you apply — already-uploaded ones (KYC or a
                past application) count automatically.
              </p>
              <RequiredDocumentsChecklist items={offer.required_documents_status} />
            </div>
          )}

          <p className="text-xs text-gray-400">{offer.applications_count} applications matched so far</p>

          <Link href={applyHref} className="block">
            <Button className="w-full bg-[#2BB5A0] hover:bg-[#239E8C] text-white">
              Apply to This Offer →
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
