"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { BorrowerPageHeader } from "@/components/top-nav";

const offers = [
  {
    id: 1,
    initials: "JM",
    avatarBg: "#1B2B3A",
    name: "James Mugisha",
    badge: "Best Rate",
    rate: "5%/mo",
    subtitle: "Up to UGX 50M · Max 6 months · Business · Personal · Emergency",
    amountRange: "UGX 1M–50M",
    applications: 12,
    isBest: true,
  },
  {
    id: 2,
    initials: "RK",
    avatarBg: "#2BB5A0",
    name: "Robert Kiggundu",
    badge: null,
    rate: "6%/mo",
    subtitle: "Up to UGX 30M · Max 12 months · Agricultural · Business",
    amountRange: "UGX 2M–30M",
    applications: 7,
    isBest: false,
  },
  {
    id: 3,
    initials: "SN",
    avatarBg: "#8B4513",
    name: "Sarah Nakimuli",
    badge: null,
    rate: "7%/mo",
    subtitle: "Up to UGX 20M · Max 3 months · Personal · Emergency",
    amountRange: "UGX 500K–20M",
    applications: 9,
    isBest: false,
  },
];

export default function BrowseOffersPage() {
  const [search, setSearch] = useState("");

  const filtered = offers.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Browse Lender Offers" />

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
        <select className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-[#2BB5A0]">
          <option>All Amounts</option>
          <option>Under UGX 5M</option>
          <option>UGX 5M – 15M</option>
          <option>Over UGX 15M</option>
        </select>
        <select className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-[#2BB5A0]">
          <option>All Rates</option>
          <option>Under 5%</option>
          <option>5% – 8%</option>
          <option>Over 8%</option>
        </select>
      </div>

      {/* Offer cards — list layout */}
      <div className="space-y-4">
        {filtered.map((offer) => (
          <div
            key={offer.id}
            className={`bg-white dark:bg-gray-900 rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${offer.isBest ? "border-[#2BB5A0]" : "border-gray-200 dark:border-gray-800"}`}
          >
            {/* Avatar */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
              style={{ backgroundColor: offer.avatarBg }}
            >
              {offer.initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-[#1B2B3A] dark:text-white text-lg">
                  {offer.name}
                </span>
                {offer.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[#2BB5A0] text-[10px] font-bold border border-[#2BB5A0]/30">
                    {offer.badge}
                  </span>
                )}
              </div>
              <p className="text-2xl font-extrabold text-[#2BB5A0] mt-0.5">
                {offer.rate}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{offer.subtitle}</p>
            </div>

            {/* Amount + count */}
            <div className="text-right shrink-0">
              <p className="text-xl font-extrabold text-[#1B2B3A] dark:text-white">
                {offer.amountRange}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {offer.applications} applications so far
              </p>
              <Link
                href="/dashboard/apply"
                className="mt-3 inline-flex items-center justify-center px-5 py-2 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors"
              >
                Apply Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
