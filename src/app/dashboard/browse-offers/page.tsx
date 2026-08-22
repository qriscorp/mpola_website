"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { BorrowerPageHeader } from "@/components/top-nav";
import { CardSkeleton } from "@/components/skeletons";
import { api } from "@/lib/api";
import { formatCurrency, formatRate, formatDuration } from "@/lib/format";
import type { MarketplaceListingOffer, BrowseOfferTemplatesResponse } from "@/lib/types";

const avatarColors = ["#1B2B3A", "#2BB5A0", "#C4A55A", "#B0923E"];

const RATE_BANDS = [
  { key: "", label: "All Rates" },
  { key: "under5", label: "Under 5%/mo" },
  { key: "5to7", label: "5%–7%/mo" },
  { key: "7to10", label: "7%–10%/mo" },
  { key: "above10", label: "Above 10%" },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function parseLoanTypes(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function BrowseOffersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [rate, setRate] = useState("");
  const [data, setData] = useState<BrowseOfferTemplatesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const requestSeq = useRef(0);

  useEffect(() => {
    const seq = ++requestSeq.current;
    setLoading(true);
    const handle = setTimeout(
      () => {
        api
          .browseOfferTemplates({
            search: search || undefined,
            rate: rate || undefined,
            limit: 20,
          })
          .then((res) => {
            if (seq === requestSeq.current) setData(res);
          })
          .finally(() => {
            if (seq === requestSeq.current) setLoading(false);
          });
      },
      search ? 350 : 0,
    );
    return () => clearTimeout(handle);
  }, [search, rate]);

  const offers: MarketplaceListingOffer[] = data?.listings ?? [];

  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Browse Lender Offers" />
      <p className="-mt-4 text-sm text-gray-500 dark:text-gray-400">
        Individual lenders&apos; standing offers — browse for confidence, then
        apply. Applying still goes out to every qualifying lender, not just
        the one you browsed.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search offers by lender, description, loan type…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#2BB5A0] dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          />
        </div>
        <select
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white"
        >
          {RATE_BANDS.map((b) => (
            <option key={b.key} value={b.key}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      {loading && !data ? (
        <CardSkeleton count={3} />
      ) : offers.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 dark:bg-gray-900 dark:border-gray-800">
          No lender offers match right now — check back soon.
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer, idx) => {
            const loanTypes = parseLoanTypes(offer.loan_types);
            return (
              <div
                key={offer.id}
                onClick={() => router.push(`/dashboard/browse-offers/${offer.id}`)}
                role="button"
                tabIndex={0}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 cursor-pointer transition-colors hover:border-[#2BB5A0]/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
                    style={{ backgroundColor: avatarColors[idx % avatarColors.length] }}
                  >
                    {initials(offer.lender_name)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#1B2B3A] dark:text-white">{offer.lender_name}</p>
                    <p className="text-lg font-extrabold text-[#2BB5A0] mt-1">
                      {formatRate(offer.interest_rate)} ·{" "}
                      {formatDuration(offer.max_duration, offer.max_duration_days)} ·{" "}
                      {formatCurrency(offer.min_amount)}–{formatCurrency(offer.max_amount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {loanTypes.join(" · ") || "Multiple loan types"}
                      {offer.city ? ` · ${offer.city}` : ""} · {offer.offer_count} applications so far
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-[#2BB5A0]">
                    View offer →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
