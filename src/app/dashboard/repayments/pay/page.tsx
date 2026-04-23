"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BorrowerPageHeader } from "@/components/top-nav";

const methods = ["MTN MoMo", "Airtel Money", "Wallet"];

export default function MakePaymentPage() {
  const router = useRouter();
  const [method, setMethod] = useState(methods[0]);
  const [phone, setPhone] = useState("700 123 456");
  const [amount, setAmount] = useState("2400000");

  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Make a Payment" />

      <div className="max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-black text-[#1B2B3A]">Make a Payment</h2>

        <div className="mt-6 rounded-2xl bg-[#E6F4F2] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm sm:text-base text-gray-500">
                Instalment #3 · Due 15 May 2024
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-black text-[#1B2B3A]">
                UGX 2,400,000
              </p>
            </div>
            <span className="rounded-full bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-600">
              Due in 8 days
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {methods.map((m) => {
            const active = method === m;
            return (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "border-[#2BB5A0] bg-[#E6F4F2] text-[#149D8E]"
                    : "border-gray-300 bg-white text-[#1B2B3A]"
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500">
            MTN Mobile Money Number
          </label>
          <div className="flex items-center overflow-hidden rounded-xl border border-gray-300">
            <span className="inline-flex h-full items-center bg-[#E6F4F2] px-4 py-3 text-lg sm:text-xl font-bold text-[#149D8E]">
              +256
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 text-base text-[#1B2B3A] outline-none"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500">
            Amount
          </label>
          <div className="flex items-center overflow-hidden rounded-xl border border-gray-300">
            <span className="inline-flex h-full items-center px-4 py-3 text-base sm:text-lg font-bold text-gray-500">
              UGX
            </span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 text-base text-[#1B2B3A] outline-none"
            />
          </div>
        </div>

        <button
          onClick={() => router.push("/dashboard/repayments/pay/confirmation")}
          className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-[#149D8E] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#108a7d]"
        >
          Pay UGX 2,400,000
        </button>
      </div>
    </div>
  );
}
