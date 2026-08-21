"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { formatCurrency, formatRate, formatDuration } from "@/lib/format";
import type { MarketplacePreviewOffer, MarketplacePreviewRequest } from "@/lib/types";

type Tab = "all" | "offers" | "requests";
type FeedItem =
  | { kind: "offer"; id: string; createdAt: string | null; data: MarketplacePreviewOffer }
  | { kind: "request"; id: string; createdAt: string | null; data: MarketplacePreviewRequest };

const AVATAR_COLORS = ["#163256", "#4e1a6e", "#1a5e42", "#6e3a1a", "#1a2a5e", "#5e1a1a", "#2d5a27"];
const LOAN_TYPES = ["business", "personal", "agricultural", "emergency", "education"];

function parseLoanTypes(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function Avatar({ name, seed }: { name: string; seed: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="h-9 w-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
      style={{ backgroundColor: AVATAR_COLORS[seed % AVATAR_COLORS.length] }}
    >
      {initials || "?"}
    </div>
  );
}

export function MarketplaceFeed({
  offers,
  requests,
  totalOffers,
  totalRequests,
  categoryCounts,
}: {
  offers: MarketplacePreviewOffer[];
  requests: MarketplacePreviewRequest[];
  totalOffers: number;
  totalRequests: number;
  categoryCounts: Record<string, number>;
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const items: FeedItem[] = useMemo(() => {
    const offerItems: FeedItem[] = offers.map((o) => ({
      kind: "offer",
      id: o.id,
      createdAt: o.created_at,
      data: o,
    }));
    const requestItems: FeedItem[] = requests.map((r) => ({
      kind: "request",
      id: r.id,
      createdAt: r.created_at,
      data: r,
    }));
    return [...offerItems, ...requestItems].sort((a, b) =>
      (b.createdAt || "").localeCompare(a.createdAt || ""),
    );
  }, [offers, requests]);

  const filtered = items.filter((item) => {
    if (tab === "offers" && item.kind !== "offer") return false;
    if (tab === "requests" && item.kind !== "request") return false;
    if (typeFilter.size > 0) {
      const types =
        item.kind === "offer"
          ? parseLoanTypes(item.data.loan_types).map((t) => t.toLowerCase())
          : [item.data.loan_type.toLowerCase()];
      if (!types.some((t) => typeFilter.has(t))) return false;
    }
    return true;
  });

  const toggleType = (t: string) => {
    setTypeFilter((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const tabLabel = (t: Tab) =>
    t === "all"
      ? `All (${totalOffers + totalRequests})`
      : t === "offers"
        ? `Lender Offers (${totalOffers})`
        : `Borrower Requests (${totalRequests})`;

  return (
    <div className="grid lg:grid-cols-[240px_1fr] gap-6">
      {/* Filters sidebar */}
      <aside className="hidden lg:block bg-white rounded-xl border border-gray-100 p-5 h-fit dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#1B2B3A] dark:text-white">Filters</h3>
          {typeFilter.size > 0 && (
            <button
              onClick={() => setTypeFilter(new Set())}
              className="text-xs text-[#2BB5A0] font-semibold hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 dark:text-gray-500">
          Loan Type
        </p>
        <div className="space-y-2.5">
          {LOAN_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={typeFilter.has(t)}
                onChange={() => toggleType(t)}
                className="rounded accent-[#2BB5A0]"
              />
              <span className="text-sm text-gray-700 capitalize flex-1 dark:text-gray-300">{t}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {categoryCounts[t] ?? 0}
              </span>
            </label>
          ))}
        </div>
      </aside>

      {/* Feed */}
      <div>
        <div className="flex bg-white rounded-xl border border-gray-100 p-1 mb-4 dark:bg-gray-900 dark:border-gray-800">
          {(["all", "offers", "requests"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
                tab === t
                  ? "bg-[#1B2B3A] text-white"
                  : "text-gray-500 hover:text-[#1B2B3A] dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {tabLabel(t)}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-14 dark:text-gray-500">
              No listings match these filters right now.
            </p>
          ) : (
            filtered.map((item, i) => {
              const key = `${item.kind}-${item.id}`;
              const isOpen = expandedKey === key;
              const name = item.kind === "offer" ? item.data.lender_name : item.data.borrower_name;
              const badgeColor =
                item.kind === "offer"
                  ? "bg-[#FFF8ED] text-[#C4A55A] dark:bg-[#C4A55A]/10"
                  : "bg-[#E8F8F5] text-[#2BB5A0] dark:bg-[#2BB5A0]/10";

              return (
                <div key={key} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                  <button
                    onClick={() => setExpandedKey(isOpen ? null : key)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                  >
                    <Avatar name={name} seed={i} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#1B2B3A] truncate dark:text-white">
                          {name}
                        </p>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0 ${badgeColor}`}
                        >
                          {item.kind === "offer" ? "Offer" : "Request"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {item.kind === "offer"
                          ? parseLoanTypes(item.data.loan_types).join(" · ") || "Multiple loan types"
                          : `${item.data.loan_type} · ${formatDuration(item.data.duration, item.data.duration_days)}`}
                        {item.data.city ? ` · ${item.data.city}` : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {item.kind === "offer" ? (
                        <>
                          <p className="font-bold text-[#C4A55A]">{formatRate(item.data.interest_rate)}</p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500">
                            {formatCurrency(item.data.min_amount)}–{formatCurrency(item.data.max_amount)}
                          </p>
                        </>
                      ) : (
                        <p className="font-bold text-[#2BB5A0]">{formatCurrency(item.data.amount)}</p>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pl-16">
                      <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-4 text-sm space-y-1.5">
                        {item.kind === "offer" ? (
                          <>
                            <p className="text-gray-600 dark:text-gray-300">
                              <span className="text-gray-400 dark:text-gray-500">Amount range: </span>
                              {formatCurrency(item.data.min_amount)} – {formatCurrency(item.data.max_amount)}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                              <span className="text-gray-400 dark:text-gray-500">Rate: </span>
                              {formatRate(item.data.interest_rate)}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-gray-600 dark:text-gray-300">
                              <span className="text-gray-400 dark:text-gray-500">Requested: </span>
                              {formatCurrency(item.data.amount)}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                              <span className="text-gray-400 dark:text-gray-500">Term: </span>
                              {formatDuration(item.data.duration, item.data.duration_days)}
                            </p>
                          </>
                        )}
                        {item.createdAt && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">
                            Posted {timeAgo(item.createdAt)}
                          </p>
                        )}
                      </div>
                      <Link
                        href={item.kind === "offer" ? "/auth/signin" : "/auth/lender-signin"}
                        className="mt-3 inline-flex items-center justify-center w-full sm:w-auto px-5 py-2 rounded-lg bg-[#1B2B3A] text-white text-sm font-semibold hover:bg-[#243a4d] transition-colors"
                      >
                        {item.kind === "offer" ? "Sign In to Apply" : "Sign In to Make an Offer"}
                      </Link>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
