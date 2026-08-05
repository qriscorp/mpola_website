"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { LenderPageHeader } from "@/components/lender-top-nav";
import { CardSkeleton } from "@/components/skeletons";
import { useMyOffers } from "@/hooks/use-lender";
import { formatCurrency, formatRate } from "@/lib/format";
import type { LoanOffer } from "@/lib/types";

type OfferStatus = LoanOffer["status"];

const tabs: Array<"All" | OfferStatus> = [
  "All",
  "pending",
  "accepted",
  "declined",
  "expired",
];

const tabLabel: Record<"All" | OfferStatus, string> = {
  All: "All",
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
};

function statusBadge(s: OfferStatus) {
  if (s === "accepted")
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
        Accepted
      </span>
    );
  if (s === "declined" || s === "expired")
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
        {s === "declined" ? "Declined" : "Expired"}
      </span>
    );
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
      Pending
    </span>
  );
}

export default function MyOffersPage() {
  const [tab, setTab] = useState<"All" | OfferStatus>("All");
  const { data: offers, isLoading } = useMyOffers();

  const allOffers = offers ?? [];
  const filtered =
    tab === "All" ? allOffers : allOffers.filter((o) => o.status === tab);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <LenderPageHeader title="My Offers" />
        <CardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <LenderPageHeader title="My Offers" />

      {/* Tab filters */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              tab === t
                ? "bg-[#C4A55A] border-[#C4A55A] text-white"
                : "bg-white border-gray-300 text-gray-600 hover:border-[#C4A55A]"
            }`}
          >
            {tabLabel[t]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">
          You haven&apos;t made any offers in this category yet.
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((offer) => (
            <Card key={offer.id} className="bg-white dark:bg-gray-900">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Left: offer info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h3 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
                        {formatCurrency(offer.amount)}
                      </h3>
                    </div>
                    <p className="text-[#C4A55A] font-semibold text-sm mt-0.5">
                      {formatRate(offer.interest_rate)} · {offer.duration}{" "}
                      months
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {offer.borrower_name ?? "Unknown borrower"}
                      {offer.loan_type ? ` · ${offer.loan_type}` : ""}
                      {offer.application_reference
                        ? ` · #${offer.application_reference}`
                        : ""}
                    </p>
                  </div>

                  {/* Middle: stats */}
                  <div className="flex gap-6 sm:gap-8 shrink-0">
                    <div className="text-center">
                      <p className="text-sm font-bold text-[#1B2B3A] dark:text-white">
                        {offer.monthly_payment
                          ? formatCurrency(offer.monthly_payment)
                          : "—"}
                      </p>
                      <p className="text-[11px] text-gray-400">Monthly</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-[#1B2B3A] dark:text-white">
                        {offer.total_repayable
                          ? formatCurrency(offer.total_repayable)
                          : "—"}
                      </p>
                      <p className="text-[11px] text-gray-400">Repayable</p>
                    </div>
                  </div>

                  {/* Right: status + actions */}
                  <div className="flex items-center gap-3 sm:gap-2 shrink-0 flex-wrap">
                    {statusBadge(offer.status)}
                    <Link
                      href={`/lender/marketplace/${offer.application_id}`}
                      className="px-4 py-1.5 rounded-lg bg-[#C4A55A] text-white text-sm font-semibold hover:bg-[#b3944a] transition-colors"
                    >
                      View Application
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
