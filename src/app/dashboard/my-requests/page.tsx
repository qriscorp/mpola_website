"use client";

import { useState } from "react";
import Link from "next/link";
import { BorrowerPageHeader } from "@/components/top-nav";

const tabs = ["All", "Active", "With Offers", "Closed"];

const requests = [
  {
    id: 1,
    amount: "UGX 8,000,000",
    status: "Active",
    type: "Business",
    duration: "3 months",
    maxRate: "8%/mo",
    ref: "#REQ-2024-047",
    offers: 3,
  },
  {
    id: 2,
    amount: "UGX 3,000,000",
    status: "Active",
    type: "Personal",
    duration: "2 months",
    maxRate: "10%/mo",
    ref: "#REQ-2024-039",
    offers: 1,
  },
];

export default function MyRequestsPage() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="My Requests" />

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeTab === tab
                ? "bg-[#2BB5A0] text-white border-[#2BB5A0]"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-[#2BB5A0] hover:text-[#2BB5A0]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Request Cards */}
      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl sm:text-3xl leading-none font-black text-[#1B2B3A]">
                  {req.amount}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[#2BB5A0] text-xs font-semibold">
                  {req.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {req.type} · {req.duration} · Max {req.maxRate} · {req.ref}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-2xl sm:text-3xl leading-none font-black text-[#2BB5A0]">
                  {req.offers}
                </p>
                <p className="text-xs text-gray-400">
                  {req.offers === 1 ? "Offer received" : "Offers received"}
                </p>
              </div>
              <Link
                href="/dashboard/offers-received"
                className="px-5 py-2 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors whitespace-nowrap"
              >
                View Offers
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div>
        <Link
          href="/dashboard/post-request"
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors"
        >
          + Post New Request
        </Link>
      </div>
    </div>
  );
}
