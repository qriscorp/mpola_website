"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, MapPin, FileText, Users } from "lucide-react";
import { LenderPageHeader } from "@/components/lender-top-nav";
import { useMarketplaceBorrowers } from "@/hooks/use-lender";

const tabs = ["All", "Business", "Personal", "Verified KYC"] as const;
type MarketplaceTab = (typeof tabs)[number];

const avatarColors = [
  "bg-[#1B2B3A]",
  "bg-[#C4A55A]",
  "bg-amber-700",
  "bg-slate-700",
  "bg-emerald-700",
  "bg-zinc-700",
];

export default function MarketplacePage() {
  const { data: borrowers = [] } = useMarketplaceBorrowers();
  const [activeTab, setActiveTab] = useState<MarketplaceTab>("All");
  const [query, setQuery] = useState("");

  const counts = useMemo(
    (): Record<MarketplaceTab, number> => ({
      All: borrowers.length,
      Business: borrowers.filter((b) => b.loanType === "Business").length,
      Personal: borrowers.filter((b) => b.loanType === "Personal").length,
      "Verified KYC": borrowers.filter((b) => b.kycVerified).length,
    }),
    [borrowers],
  );

  const filtered = useMemo(
    () =>
      borrowers
        .filter((b) => {
          if (activeTab === "Business") return b.loanType === "Business";
          if (activeTab === "Personal") return b.loanType === "Personal";
          if (activeTab === "Verified KYC") return b.kycVerified;
          return true;
        })
        .filter((b) => {
          if (!query.trim()) return true;
          const q = query.toLowerCase();
          return (
            b.name.toLowerCase().includes(q) ||
            b.location.toLowerCase().includes(q) ||
            b.purpose.toLowerCase().includes(q)
          );
        }),
    [borrowers, activeTab, query],
  );

  return (
    <div className="space-y-6">
      <LenderPageHeader title="Borrower Marketplace" />

      <p className="text-sm text-gray-500">
        {borrowers.length} borrower profiles available for review.
      </p>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_180px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, city, or purpose..."
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-[#1B2B3A] outline-none focus:border-[#C4A55A] focus:ring-2 focus:ring-[#C4A55A]/20"
            />
          </div>
          <select className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-[#1B2B3A] outline-none focus:border-[#C4A55A]">
            <option>Any amount</option>
            <option>UGX 1M - 5M</option>
            <option>UGX 5M - 10M</option>
            <option>UGX 10M+</option>
          </select>
          <select className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-[#1B2B3A] outline-none focus:border-[#C4A55A]">
            <option>Any duration</option>
            <option>1-3 months</option>
            <option>4-6 months</option>
            <option>7+ months</option>
          </select>
          <select className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-[#1B2B3A] outline-none focus:border-[#C4A55A]">
            <option>Newest first</option>
            <option>Highest amount</option>
            <option>Lowest amount</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-[#C4A55A] bg-[#C4A55A] text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-[#C4A55A]"
            }`}
          >
            {tab} ({counts[tab] ?? 0})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((b, idx) => (
          <div
            key={b.id}
            className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  b.kycVerified
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-600"
                    : "border border-gray-200 bg-gray-100 text-gray-500"
                }`}
              >
                {b.kycVerified ? "Verified KYC" : "KYC Pending"}
              </span>
              <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                {b.loanType}
              </span>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColors[idx % avatarColors.length]}`}
              >
                {b.initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-[#1B2B3A]">
                  {b.name}
                </p>
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="h-3 w-3" /> {b.location}
                </p>
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Requested Amount
            </p>
            <p className="text-3xl font-black text-[#1B2B3A]">
              UGX {b.amount.toLocaleString()}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-[#C4A55A]">
              {b.duration} months
            </p>

            <p className="mt-3 line-clamp-2 text-sm text-gray-600">
              {b.purpose}
            </p>

            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" /> {b.documents} docs
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {b.guarantorsConfirmed}{" "}
                confirmed
              </span>
            </div>

            <Link
              href={`/lender/marketplace/${b.id}`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-[#C4A55A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b3944a]"
            >
              Review Profile
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
