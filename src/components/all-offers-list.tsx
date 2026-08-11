"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { CardSkeleton } from "@/components/skeletons";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatCurrency, formatRate, getInitials } from "@/lib/format";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";

const avatarColors = ["#1B2B3A", "#2BB5A0", "#8B4513", "#C4A55A"];

/** Every offer the borrower has ever received, across every application —
 * shown both at /dashboard/offers ("Browse Lender Offers") and as the
 * default view at /dashboard/offers-received when no specific request is
 * selected. Selecting one filters down to just that request's offers. */
export function AllOffersList() {
  const [search, setSearch] = useState("");
  const [amountFilter, setAmountFilter] = useState("all");
  const [rateFilter, setRateFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["borrower", "offers-received", "all"],
    queryFn: () => api.getOffersReceived(),
  });

  const offers = data ?? [];

  const filtered = useMemo(() => {
    return offers.filter((o) => {
      const nameMatch = (o.lender_name ?? "")
        .toLowerCase()
        .includes(search.toLowerCase());
      const amountMatch =
        amountFilter === "all" ||
        (amountFilter === "under5m" && o.amount < 5_000_000) ||
        (amountFilter === "5to15m" && o.amount >= 5_000_000 && o.amount <= 15_000_000) ||
        (amountFilter === "over15m" && o.amount > 15_000_000);
      const rateMatch =
        rateFilter === "all" ||
        (rateFilter === "under5" && o.interest_rate < 5) ||
        (rateFilter === "5to8" && o.interest_rate >= 5 && o.interest_rate <= 8) ||
        (rateFilter === "over8" && o.interest_rate > 8);
      return nameMatch && amountMatch && rateMatch;
    });
  }, [offers, search, amountFilter, rateFilter]);

  const bestOfferId = useMemo(() => {
    return offers.reduce<string | null>((bestId, o) => {
      if (o.status !== "pending") return bestId;
      if (!bestId) return o.id;
      const best = offers.find((x) => x.id === bestId);
      return best && o.interest_rate < best.interest_rate ? o.id : bestId;
    }, null);
  }, [offers]);

  if (isLoading) {
    return <CardSkeleton count={3} />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search lenders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-[#1B2B3A] dark:text-white outline-none focus:ring-2 focus:ring-[#2BB5A0] focus:border-[#2BB5A0]"
          />
        </div>
        <select
          value={amountFilter}
          onChange={(e) => setAmountFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-[#2BB5A0]"
        >
          <option value="all">All Amounts</option>
          <option value="under5m">Under UGX 5M</option>
          <option value="5to15m">UGX 5M – 15M</option>
          <option value="over15m">Over UGX 15M</option>
        </select>
        <select
          value={rateFilter}
          onChange={(e) => setRateFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-[#2BB5A0]"
        >
          <option value="all">All Rates</option>
          <option value="under5">Under 5%</option>
          <option value="5to8">5% – 8%</option>
          <option value="over8">Over 8%</option>
        </select>
      </div>

      {/* Offer cards — list layout */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">
          {offers.length === 0
            ? "No offers yet — lenders will see your requests once you apply for a loan."
            : "No offers match your filters."}
        </div>
      ) : (
        <StaggerList className="space-y-4">
          {filtered.map((offer, idx) => (
            <StaggerItem
              key={offer.id}
              className={`bg-white dark:bg-gray-900 rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${offer.id === bestOfferId ? "border-[#2BB5A0]" : "border-gray-200 dark:border-gray-800"}`}
            >
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
                style={{ backgroundColor: avatarColors[idx % avatarColors.length] }}
              >
                {getInitials(offer.lender_name ?? "?")}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[#1B2B3A] dark:text-white text-lg">
                    {offer.lender_name ?? "Lender"}
                  </span>
                  {offer.id === bestOfferId && (
                    <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[#2BB5A0] text-[10px] font-bold border border-[#2BB5A0]/30">
                      Best Rate
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold capitalize">
                    {offer.status}
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-[#2BB5A0] mt-0.5">
                  {formatRate(offer.interest_rate)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {offer.duration} months
                  {offer.loan_type ? ` · ${offer.loan_type}` : ""}
                  {offer.application_reference
                    ? ` · #${offer.application_reference}`
                    : ""}
                </p>
              </div>

              {/* Amount + action */}
              <div className="text-right shrink-0">
                <p className="text-xl font-extrabold text-[#1B2B3A] dark:text-white">
                  {formatCurrency(offer.amount)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Repayable: {formatCurrency(offer.total_repayable ?? 0)}
                </p>
                <Link
                  href={`/dashboard/offers-received?applicationId=${offer.application_id}`}
                  className={`mt-3 inline-flex items-center justify-center px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    offer.status === "pending"
                      ? "bg-[#2BB5A0] text-white hover:bg-[#239E8C]"
                      : "border border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {offer.status === "pending" ? "View & Respond" : "View"}
                </Link>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </div>
  );
}
