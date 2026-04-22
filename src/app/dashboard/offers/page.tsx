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
    details: "3 months · Min UGX 1M",
    amountRange: "UGX 1M – 15M",
    applications: 23,
  },
  {
    id: 2,
    initials: "RK",
    avatarBg: "#2BB5A0",
    name: "Robert Kiggundu",
    badge: null,
    rate: "6%/mo",
    details: "6 months · Min UGX 500K",
    amountRange: "UGX 500K – 10M",
    applications: 11,
  },
  {
    id: 3,
    initials: "AN",
    avatarBg: "#1B2B3A",
    name: "Alice Nakato",
    badge: null,
    rate: "7%/mo",
    details: "12 months · Min UGX 2M",
    amountRange: "UGX 2M – 20M",
    applications: 7,
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

      {/* Offer cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((offer) => (
          <div
            key={offer.id}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
                style={{ backgroundColor: offer.avatarBg }}
              >
                {offer.initials}
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#1B2B3A] dark:text-white">
                  {offer.name}
                </p>
                {offer.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[#2BB5A0] text-[10px] font-bold">
                    {offer.badge}
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#2BB5A0]">
                {offer.rate}
              </p>
              <p className="text-xs text-gray-400">{offer.details}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                {offer.amountRange}
              </p>
              <p className="text-xs text-gray-400">
                {offer.applications} applications so far
              </p>
            </div>
            <Link
              href="/dashboard/apply"
              className="block text-center py-2 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors"
            >
              Apply Now
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
