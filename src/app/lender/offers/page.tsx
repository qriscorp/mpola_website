"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LenderPageHeader } from "@/components/lender-top-nav";

type OfferStatus = "Active" | "Draft" | "Closed";

const offers = [
  {
    id: "LF-2024-001",
    amount: "UGX 50M",
    rate: "5%/mo",
    maxDuration: "Max 6 months",
    types: ["Business", "Personal", "Emergency"],
    applied: 12,
    approved: 3,
    deployed: "UGX 18M",
    status: "Active" as OfferStatus,
  },
  {
    id: "LF-2024-002",
    amount: "UGX 20M",
    rate: "7%/mo",
    maxDuration: "Max 3 months",
    types: ["Personal", "Emergency"],
    applied: 9,
    approved: 2,
    deployed: "UGX 7M",
    status: "Active" as OfferStatus,
  },
  {
    id: "LF-2024-003",
    amount: "UGX 10M",
    rate: "6%/mo",
    maxDuration: "Max 12 months",
    types: ["Agricultural", "Business"],
    applied: 7,
    approved: 4,
    deployed: "UGX 23M",
    status: "Closed" as OfferStatus,
  },
];

const tabs: Array<"All" | OfferStatus> = ["All", "Active", "Draft", "Closed"];

export default function MyOffersPage() {
  const [tab, setTab] = useState<"All" | OfferStatus>("All");

  const filtered =
    tab === "All" ? offers : offers.filter((o) => o.status === tab);

  const statusBadge = (s: OfferStatus) => {
    if (s === "Active")
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
          {s}
        </span>
      );
    if (s === "Closed")
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
          {s}
        </span>
      );
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
        {s}
      </span>
    );
  };

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
            {t}
          </button>
        ))}
      </div>

      {/* Offer cards */}
      <div className="space-y-4">
        {filtered.map((offer) => (
          <Card key={offer.id} className="bg-white dark:bg-gray-900">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Left: offer info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
                      {offer.amount}
                    </h3>
                  </div>
                  <p className="text-[#C4A55A] font-semibold text-sm mt-0.5">
                    {offer.rate} · {offer.maxDuration}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {offer.types.join(" · ")} · #{offer.id}
                  </p>
                </div>

                {/* Middle: stats */}
                <div className="flex gap-6 sm:gap-8 shrink-0">
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#1B2B3A] dark:text-white">
                      {offer.applied}
                    </p>
                    <p className="text-[11px] text-gray-400">Applied</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#1B2B3A] dark:text-white">
                      {offer.approved}
                    </p>
                    <p className="text-[11px] text-gray-400">Approved</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-[#1B2B3A] dark:text-white">
                      {offer.deployed}
                    </p>
                    <p className="text-[11px] text-gray-400">Deployed</p>
                  </div>
                </div>

                {/* Right: status + actions */}
                <div className="flex items-center gap-3 sm:gap-2 shrink-0 flex-wrap">
                  {statusBadge(offer.status)}
                  <button className="px-4 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:border-[#C4A55A] hover:text-[#C4A55A] transition-colors">
                    {offer.status === "Closed" ? "Repost" : "Edit"}
                  </button>
                  {offer.status !== "Closed" && (
                    <Link
                      href="/lender/applications"
                      className="px-4 py-1.5 rounded-lg bg-[#C4A55A] text-white text-sm font-semibold hover:bg-[#b3944a] transition-colors"
                    >
                      View Apps ({offer.applied})
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Post new offer CTA */}
      <Link
        href="/lender/post-offer"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C4A55A] text-white font-semibold text-sm hover:bg-[#b3944a] transition-colors"
      >
        + Post New Offer
      </Link>
    </div>
  );
}
