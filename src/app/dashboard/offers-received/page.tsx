"use client";

import { BorrowerPageHeader } from "@/components/top-nav";

const offers = [
  {
    id: 1,
    initials: "JM",
    avatarBg: "#1B2B3A",
    name: "James Mugisha",
    meta: "Licensed · Verified · 14 loans issued",
    rate: "5%/mo · 3 months · UGX 8,000,000",
    totalRepayable: "UGX 9,200,000",
    best: true,
  },
  {
    id: 2,
    initials: "RK",
    avatarBg: "#2BB5A0",
    name: "Robert Kiggundu",
    meta: "Licensed · Verified",
    rate: "6%/mo · 3 months · UGX 8,000,000",
    totalRepayable: "UGX 9,440,000",
    best: false,
  },
];

export default function OffersReceivedPage() {
  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Offers Received" />

      <p className="text-sm text-gray-500">
        Offers for request{" "}
        <span className="font-semibold text-[#1B2B3A] dark:text-white">
          #REQ-2024-047
        </span>{" "}
        · UGX 8M · Business · 3 months
      </p>

      <div className="space-y-4">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`bg-white dark:bg-gray-900 rounded-2xl border p-5 ${
              offer.best
                ? "border-[#2BB5A0] shadow-sm"
                : "border-gray-200 dark:border-gray-800"
            }`}
          >
            {offer.best && (
              <p className="text-xs font-bold text-[#2BB5A0] mb-3">
                Best Offer
              </p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
                style={{ backgroundColor: offer.avatarBg }}
              >
                {offer.initials}
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#1B2B3A] dark:text-white">
                  {offer.name}
                </p>
                <p className="text-xs text-gray-400">{offer.meta}</p>
                <p className="text-lg font-extrabold text-[#2BB5A0] mt-1">
                  {offer.rate}
                </p>
                <p className="text-xs text-gray-500">
                  Total repayable: {offer.totalRepayable}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:border-red-300 hover:text-red-500 transition-colors">
                  Decline
                </button>
                <button className="px-5 py-2 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors">
                  Accept Offer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
