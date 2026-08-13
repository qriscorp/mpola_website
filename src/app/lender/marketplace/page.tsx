"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { LenderPageHeader } from "@/components/lender-top-nav";
import { InfoTip } from "@/components/info-tip";
import { useMarketplace } from "@/hooks/use-lender";
import { formatCurrency, formatDuration } from "@/lib/format";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";

const PAGE_SIZE = 20;
const tabs = ["All", "Business", "Personal"] as const;
type MarketplaceTab = (typeof tabs)[number];
const TAB_LOAN_TYPE: Record<MarketplaceTab, string | undefined> = {
  All: undefined,
  Business: "business",
  Personal: "personal",
};

const avatarColors = [
  "bg-[#1B2B3A]",
  "bg-[#C4A55A]",
  "bg-amber-700",
  "bg-slate-700",
  "bg-emerald-700",
  "bg-zinc-700",
];

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function MarketplacePage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<MarketplaceTab>("All");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 400);
  const { data, isLoading } = useMarketplace(page, PAGE_SIZE, {
    loan_type: TAB_LOAN_TYPE[activeTab],
  });
  const applications = data?.applications ?? [];
  const total = data?.total ?? 0;

  // Search is client-side over the current page only — the marketplace
  // endpoint doesn't support a text search filter server-side.
  const filtered = useMemo(
    () =>
      applications.filter((a) => {
        if (!debouncedQuery.trim()) return true;
        const q = debouncedQuery.toLowerCase();
        return (
          (a.borrower?.full_name ?? "").toLowerCase().includes(q) ||
          (a.purpose ?? "").toLowerCase().includes(q)
        );
      }),
    [applications, debouncedQuery],
  );

  return (
    <div className="space-y-6">
      <LenderPageHeader title="Borrower Marketplace" />

      <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        {isLoading
          ? "Finding loan applications for you…"
          : `${total} loan applications available for review.`}
        <InfoTip text="Only requests whose 2 guarantors have both already approved show up here. Making an offer doesn't commit any money — the borrower still has to accept it, and only one offer per request ever gets accepted." />
      </p>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or purpose..."
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-[#1B2B3A] outline-none focus:border-[#C4A55A] focus:ring-2 focus:ring-[#C4A55A]/20 dark:border-gray-700 dark:text-white dark:bg-gray-900"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-[#C4A55A] bg-[#C4A55A] text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-[#C4A55A] dark:border-gray-700 dark:text-gray-300 dark:bg-gray-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
      ) : (
      <StaggerList className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((a, idx) => {
          const verified = a.borrower?.kyc_status === "verified";
          return (
            <StaggerItem
              key={a.id}
              className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    verified
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400 dark:bg-emerald-900/20"
                      : "border border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-800 dark:text-gray-400 dark:bg-gray-800"
                  }`}
                >
                  {verified ? "Verified" : "Not Verified"}
                </span>
                <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-600 capitalize dark:border-gray-800 dark:text-gray-300 dark:bg-gray-800/60">
                  {a.loan_type}
                </span>
              </div>

              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColors[idx % avatarColors.length]}`}
                >
                  {initials(a.borrower?.full_name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-[#1B2B3A] dark:text-white">
                    {a.borrower?.full_name ?? "Borrower"}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Credit score: {a.borrower?.credit_score ?? "—"}
                  </p>
                </div>
              </div>

              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Requested Amount
              </p>
              <p className="text-3xl font-black text-[#1B2B3A] dark:text-white">
                {formatCurrency(a.amount)}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[#C4A55A]">
                {formatDuration(a.duration, a.duration_days)}
              </p>

              {a.purpose && (
                <p className="mt-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                  {a.purpose}
                </p>
              )}

              <Link
                href={`/lender/marketplace/${a.id}`}
                className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-[#C4A55A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b3944a]"
              >
                Review Application
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerList>
      )}

      <PaginationControls
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}
