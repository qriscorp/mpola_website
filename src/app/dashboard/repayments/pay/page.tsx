"use client";

import { useState } from "react";
import Link from "next/link";
import { BorrowerPageHeader } from "@/components/top-nav";

const paymentMethods = ["MTN MoMo", "Airtel Money", "Wallet"];

export default function PayPage() {
  const [method, setMethod] = useState("MTN MoMo");

  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Make a Payment" />

      <div className="max-w-xl bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-[#1B2B3A] dark:text-white mb-5">Make a Payment</h2>

        {/* Instalment card */}
        <div className="rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-[#2BB5A0]/30 p-4 mb-6">
          <p className="text-xs text-gray-500">Instalment #3 · Due 15 May 2024</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-3xl font-extrabold text-[#1B2B3A] dark:text-white">UGX 2,400,000</p>
            <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-600 text-xs font-semibold">Due in 8 days</span>
          </div>
        </div>

        {/* Payment method tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {paymentMethods.map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                method === m
                  ? "bg-[#2BB5A0] text-white border-[#2BB5A0]"
                  : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-[#2BB5A0] hover:text-[#2BB5A0]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {method !== "Wallet" && (
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              {method === "MTN MoMo" ? "MTN Mobile Money Number" : "Airtel Money Number"}
            </label>
            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#2BB5A0] focus-within:border-[#2BB5A0]">
              <span className="px-3 py-2.5 bg-teal-50 dark:bg-teal-900/20 text-[#2BB5A0] text-sm font-bold border-r border-gray-300 dark:border-gray-700">+256</span>
              <input
                type="tel"
                defaultValue="700 123 456"
                className="flex-1 px-3 py-2.5 text-sm bg-white dark:bg-gray-900 text-[#1B2B3A] dark:text-white outline-none"
              />
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Amount</label>
          <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#2BB5A0] focus-within:border-[#2BB5A0]">
            <span className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-500 text-sm font-medium border-r border-gray-300 dark:border-gray-700">UGX</span>
            <input
              type="number"
              defaultValue="2400000"
              className="flex-1 px-3 py-2.5 text-sm bg-white dark:bg-gray-900 text-[#1B2B3A] dark:text-white outline-none"
            />
          </div>
        </div>

        <Link
          href="/dashboard/receipts"
          className="block w-full text-center py-3 rounded-xl bg-[#2BB5A0] text-white font-bold text-sm hover:bg-[#239E8C] transition-colors"
        >
          Pay UGX 2,400,000
        </Link>
      </div>
    </div>
  );
}
