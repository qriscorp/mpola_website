"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatRate, formatDuration } from "@/lib/format";
import type { MarketplaceListing, MarketplacePreview, MarketplacePreviewParams } from "@/lib/types";

type Tab = "all" | "offers" | "requests";

const AVATAR_COLORS = ["#163256", "#4e1a6e", "#1a5e42", "#6e3a1a", "#1a2a5e", "#5e1a1a", "#2d5a27"];
const LOAN_TYPES = ["business", "personal", "agricultural", "emergency", "education"];
const CITIES = ["Kampala", "Mbarara", "Gulu", "Jinja"];
const PAGE_SIZE = 6;

const RATE_BANDS = [
  { key: "under5", label: "Under 5%/mo" },
  { key: "5to7", label: "5%–7%/mo" },
  { key: "7to10", label: "7%–10%/mo" },
  { key: "above10", label: "Above 10%" },
];
const DURATION_BANDS = [
  { key: "1-3", label: "1–3 months" },
  { key: "4-6", label: "4–6 months" },
  { key: "7-12", label: "7–12 months" },
  { key: "12+", label: "12+ months" },
];

function parseLoanTypes(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function offerTitle(o: Extract<MarketplaceListing, { kind: "offer" }>): string {
  if (o.description) return o.description;
  const types = parseLoanTypes(o.loan_types);
  const typeLabel = types.length > 0 ? types.join(", ") : "all loan types";
  return `${formatCurrency(o.min_amount)}–${formatCurrency(o.max_amount)} at ${formatRate(o.interest_rate)} — ${typeLabel}`;
}

function requestTitle(r: Extract<MarketplaceListing, { kind: "request" }>): string {
  if (r.purpose) return r.purpose;
  return `Needs ${formatCurrency(r.amount)} for ${r.loan_type}`;
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
      className="h-10 w-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
      style={{ backgroundColor: AVATAR_COLORS[seed % AVATAR_COLORS.length] }}
    >
      {initials || "?"}
    </div>
  );
}

export function MarketplaceFeed({
  initial,
  initialSearch = "",
}: {
  initial: MarketplacePreview;
  initialSearch?: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [tab, setTab] = useState<Tab>("all");
  const [listingType, setListingType] = useState({ offers: true, requests: true });
  const [rateFilter, setRateFilter] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
  const [durationFilter, setDurationFilter] = useState<Set<string>>(new Set());
  const [locationFilter, setLocationFilter] = useState<Set<string>>(new Set());

  const [data, setData] = useState<MarketplacePreview>(initial);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const requestSeq = useRef(0);

  const anyFilterActive =
    !!search || rateFilter.size > 0 || typeFilter.size > 0 || durationFilter.size > 0 || locationFilter.size > 0;

  const buildParams = useCallback(
    (offset: number): MarketplacePreviewParams => ({
      search: search || undefined,
      listingType: tab,
      rate: rateFilter.size ? [...rateFilter] : undefined,
      loanType: typeFilter.size ? [...typeFilter] : undefined,
      duration: durationFilter.size ? [...durationFilter] : undefined,
      city: locationFilter.size ? [...locationFilter] : undefined,
      offset,
      limit: PAGE_SIZE,
    }),
    [search, tab, rateFilter, typeFilter, durationFilter, locationFilter],
  );

  // Re-fetch from the backend whenever a real filter/search/tab changes —
  // this is the whole point of moving off client-side filtering: the
  // backend queries the FULL live dataset, not just whatever was already
  // loaded in the browser. Debounced on the text box only; checkbox/tab
  // clicks fetch immediately since there's no typing to wait out.
  useEffect(() => {
    const seq = ++requestSeq.current;
    setLoading(true);
    const handle = setTimeout(
      () => {
        api
          .getMarketplacePreview(buildParams(0))
          .then((res) => {
            if (seq === requestSeq.current) setData(res);
          })
          .catch(() => {
            /* keep showing the last good data rather than blanking the feed */
          })
          .finally(() => {
            if (seq === requestSeq.current) setLoading(false);
          });
      },
      search ? 350 : 0,
    );
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, tab, rateFilter, typeFilter, durationFilter, locationFilter]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await api.getMarketplacePreview(buildParams(data.listings.length));
      setData((prev) => ({ ...res, listings: [...prev.listings, ...res.listings] }));
    } catch {
      // leave what's already loaded in place
    } finally {
      setLoadingMore(false);
    }
  };

  const clearAll = () => {
    setSearch("");
    setRateFilter(new Set());
    setTypeFilter(new Set());
    setDurationFilter(new Set());
    setLocationFilter(new Set());
    setListingType({ offers: true, requests: true });
  };

  const toggleInSet = (set: Set<string>, setter: (s: Set<string>) => void, value: string) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  const tabLabel = (t: Tab) =>
    t === "all"
      ? `All (${data.total_offers + data.total_requests})`
      : t === "offers"
        ? `Lender Offers (${data.total_offers})`
        : `Borrower Requests (${data.total_requests})`;

  return (
    <div className="grid lg:grid-cols-[240px_1fr] gap-6">
      {/* Filters sidebar */}
      <aside className="hidden lg:block bg-white rounded-xl border border-gray-100 p-5 h-fit dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#1B2B3A] dark:text-white">Filters</h3>
          {anyFilterActive && (
            <button onClick={clearAll} className="text-xs text-[#2BB5A0] font-semibold hover:underline">
              Clear all
            </button>
          )}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#2BB5A0] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        <div className="pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5 dark:text-gray-500">
            Listing Type
          </p>
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={listingType.offers}
                onChange={() => setListingType((p) => ({ ...p, offers: !p.offers }))}
                className="rounded accent-[#2BB5A0]"
              />
              <span className="text-sm text-gray-700 flex-1 dark:text-gray-300">Lender Offers</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{data.total_offers}</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={listingType.requests}
                onChange={() => setListingType((p) => ({ ...p, requests: !p.requests }))}
                className="rounded accent-[#2BB5A0]"
              />
              <span className="text-sm text-gray-700 flex-1 dark:text-gray-300">Borrower Requests</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{data.total_requests}</span>
            </label>
          </div>
        </div>

        <div className="pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5 dark:text-gray-500">
            Interest Rate
          </p>
          <div className="space-y-2">
            {RATE_BANDS.map((b) => (
              <label key={b.key} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rateFilter.has(b.key)}
                  onChange={() => toggleInSet(rateFilter, setRateFilter, b.key)}
                  className="rounded accent-[#2BB5A0]"
                />
                <span className="text-sm text-gray-700 flex-1 dark:text-gray-300">{b.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5 dark:text-gray-500">
            Loan Type
          </p>
          <div className="space-y-2">
            {LOAN_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={typeFilter.has(t)}
                  onChange={() => toggleInSet(typeFilter, setTypeFilter, t)}
                  className="rounded accent-[#2BB5A0]"
                />
                <span className="text-sm text-gray-700 capitalize flex-1 dark:text-gray-300">{t}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {data.category_counts[t] ?? 0}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5 dark:text-gray-500">
            Duration
          </p>
          <div className="space-y-2">
            {DURATION_BANDS.map((b) => (
              <label key={b.key} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={durationFilter.has(b.key)}
                  onChange={() => toggleInSet(durationFilter, setDurationFilter, b.key)}
                  className="rounded accent-[#2BB5A0]"
                />
                <span className="text-sm text-gray-700 flex-1 dark:text-gray-300">{b.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5 dark:text-gray-500">
            Location
          </p>
          <div className="space-y-2">
            {CITIES.map((c) => (
              <label key={c} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={locationFilter.has(c)}
                  onChange={() => toggleInSet(locationFilter, setLocationFilter, c)}
                  className="rounded accent-[#2BB5A0]"
                />
                <span className="text-sm text-gray-700 flex-1 dark:text-gray-300">{c}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Feed */}
      <div>
        {/* Mobile search (sidebar is hidden below lg) */}
        <div className="lg:hidden relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#2BB5A0] dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          />
        </div>

        <div className="flex items-center bg-white rounded-xl border border-gray-100 p-1.5 mb-4 dark:bg-gray-900 dark:border-gray-800">
          <button
            onClick={() => setTab("all")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              tab === "all"
                ? "bg-[#1B2B3A] text-white"
                : "text-gray-500 hover:text-[#1B2B3A] dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            {tabLabel("all")}
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setTab("offers")}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === "offers" ? "text-[#1B2B3A] dark:text-white" : "text-gray-400 hover:text-[#1B2B3A] dark:hover:text-white"
            }`}
          >
            {tabLabel("offers")}
          </button>
          <button
            onClick={() => setTab("requests")}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === "requests" ? "text-[#1B2B3A] dark:text-white" : "text-gray-400 hover:text-[#1B2B3A] dark:hover:text-white"
            }`}
          >
            {tabLabel("requests")}
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-3 dark:text-gray-400">
          <strong className="text-[#1B2B3A] dark:text-white">{data.total_matching}</strong> listing
          {data.total_matching === 1 ? "" : "s"} — offers &amp; requests
        </p>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden dark:bg-gray-900 dark:border-gray-800 relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 flex items-center justify-center z-10">
              <span className="text-sm text-gray-400">Searching…</span>
            </div>
          )}
          {data.listings.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-14 dark:text-gray-500">
              No listings match these filters right now.
            </p>
          ) : (
            data.listings.map((item, i) => {
              const isUrgent = item.kind === "request" && item.loan_type?.toLowerCase() === "emergency";
              const isNew =
                !!item.created_at && Date.now() - new Date(item.created_at).getTime() < 24 * 60 * 60 * 1000;
              const borderColor = item.kind === "offer" ? "#C4A55A" : isUrgent ? "#DC2626" : "#2BB5A0";
              const name = item.kind === "offer" ? item.lender_name : item.borrower_name;
              const title = item.kind === "offer" ? offerTitle(item) : requestTitle(item);
              const statusLabel = item.kind === "offer" ? "Active" : isUrgent ? "Urgent" : isNew ? "New" : "Open";
              const statusColor =
                item.kind === "offer"
                  ? "bg-[#FFF8ED] text-[#C4A55A] dark:bg-[#C4A55A]/10"
                  : isUrgent
                    ? "bg-red-50 text-red-600 dark:bg-red-900/20"
                    : isNew
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20"
                      : "bg-[#E8F8F5] text-[#2BB5A0] dark:bg-[#2BB5A0]/10";

              return (
                <div
                  key={`${item.kind}-${item.id}`}
                  className="flex gap-3 p-4 border-b border-gray-100 last:border-0 dark:border-gray-800"
                  style={{ borderLeft: `3px solid ${borderColor}` }}
                >
                  <Avatar name={name} seed={i} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0 ${
                          item.kind === "offer"
                            ? "bg-[#FFF8ED] text-[#C4A55A] dark:bg-[#C4A55A]/10"
                            : "bg-[#E8F8F5] text-[#2BB5A0] dark:bg-[#2BB5A0]/10"
                        }`}
                      >
                        {item.kind === "offer" ? "Offer" : "Request"}
                      </span>
                      <p className="text-sm font-bold text-[#1B2B3A] dark:text-white">{title}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 dark:text-gray-500">
                      {name}
                      {item.city ? ` · ${item.city}` : ""}
                      {item.kind === "request" && item.credit_score != null ? ` · Score ${item.credit_score}/100` : ""}
                      {item.created_at ? ` · ${timeAgo(item.created_at)}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    {item.kind === "offer" ? (
                      <>
                        <p className="font-bold text-[#C4A55A]">{formatRate(item.interest_rate)}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500">
                          {formatCurrency(item.min_amount)}–{formatCurrency(item.max_amount)}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-bold text-[#2BB5A0]">{formatCurrency(item.amount)}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500">
                          {formatDuration(item.duration, item.duration_days)}
                        </p>
                      </>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusColor}`}>
                        {statusLabel}
                      </span>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        {item.offer_count} {item.kind === "offer" ? "apps" : "offers"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {data.has_more && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full mt-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors disabled:opacity-50 dark:border-gray-800 dark:text-gray-300"
          >
            {loadingMore
              ? "Loading…"
              : `Load ${Math.min(PAGE_SIZE, data.total_matching - data.listings.length)} more listing${
                  Math.min(PAGE_SIZE, data.total_matching - data.listings.length) === 1 ? "" : "s"
                } →`}
          </button>
        )}

        {data.listings.length > 0 && (
          <p className="text-center mt-4">
            <Link href="/auth/signin" className="text-sm text-[#2BB5A0] font-semibold hover:underline">
              Sign in to apply or make an offer →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
