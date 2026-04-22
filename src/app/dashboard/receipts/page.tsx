"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { BorrowerPageHeader } from "@/components/top-nav";

export default function ReceiptsPage() {
  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Payment Receipt" />

      <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-2xl border-2 border-[#2BB5A0] p-8 shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-3">
            <svg
              className="w-8 h-8 text-[#2BB5A0]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1B2B3A] dark:text-white">
            Payment Successful
          </h2>
          <p className="text-sm text-gray-400 mt-1">Transaction confirmed</p>
        </div>

        <div className="space-y-3 divide-y divide-gray-100 dark:divide-gray-800">
          {[
            { label: "Transaction ID", value: "#TXN-20240507-0091" },
            { label: "Date", value: "07 May 2024, 14:32" },
            { label: "Method", value: "MTN MoMo (+256 700 123 456)" },
            { label: "Loan Ref", value: "#LN-2024-031" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex justify-between py-3 text-sm first:pt-0"
            >
              <span className="text-gray-400">{row.label}</span>
              <span className="font-medium text-[#1B2B3A] dark:text-white">
                {row.value}
              </span>
            </div>
          ))}
          <div className="flex justify-between py-3 text-sm">
            <span className="font-bold text-[#1B2B3A] dark:text-white">
              Amount Paid
            </span>
            <span className="font-extrabold text-[#2BB5A0] text-lg">
              UGX 2,400,000
            </span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors">
            <Download className="w-4 h-4" /> Download Receipt
          </button>
          <Link
            href="/dashboard/repayments"
            className="flex-1 text-center px-4 py-2.5 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors"
          >
            View Schedule
          </Link>
        </div>
      </div>
    </div>
  );
}
