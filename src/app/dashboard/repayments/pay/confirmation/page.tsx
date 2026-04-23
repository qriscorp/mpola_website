"use client";

import Link from "next/link";
import { BorrowerPageHeader } from "@/components/top-nav";

export default function PaymentConfirmationPage() {
  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Payment Receipt" />

      <div className="mx-auto max-w-3xl space-y-4">
        <div className="rounded-2xl border-2 border-[#19A44B] bg-[#E6F4F2] p-8">
          <div className="mb-5 flex flex-col items-center">
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[#DCEDEA]">
              <svg
                className="h-10 w-10 text-[#149D8E]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl leading-tight font-black text-[#1B2B3A]">
              Payment Successful
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              Transaction confirmed
            </p>
          </div>

          <div className="space-y-3">
            {[
              ["Transaction ID", "#TXN-20240507-0091"],
              ["Date", "07 May 2024, 14:32"],
              ["Method", "MTN MoMo (+256 700 123 456)"],
              ["Loan Ref", "#LN-2024-031"],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="flex items-center justify-between border-b border-[#B9DDD7] py-3"
              >
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-semibold text-[#1B2B3A]">
                  {value}
                </span>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              <span className="text-lg sm:text-xl font-bold text-[#1B2B3A]">
                Amount Paid
              </span>
              <span className="text-2xl sm:text-3xl leading-none font-black text-[#19A44B]">
                UGX 2,400,000
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-[#1B2B3A] transition-colors hover:bg-gray-50">
            Download Receipt
          </button>
          <Link
            href="/dashboard/repayments"
            className="inline-flex items-center justify-center rounded-xl bg-[#149D8E] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#108a7d]"
          >
            View Schedule
          </Link>
        </div>
      </div>
    </div>
  );
}
