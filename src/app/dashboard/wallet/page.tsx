"use client";

import { useState } from "react";
import { BorrowerPageHeader } from "@/components/top-nav";

const transactions = [
  {
    date: "07 May 2024",
    desc: "Loan repayment — Instalment #3",
    type: "Payment",
    amount: "-UGX 2,400,000",
    neg: true,
  },
  {
    date: "01 Mar 2024",
    desc: "Loan disbursed — James Mugisha",
    type: "Received",
    amount: "+UGX 8,000,000",
    neg: false,
  },
];

export default function WalletPage() {
  const [depositOpen, setDepositOpen] = useState(false);

  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Wallet" />

      {/* Hero balance card */}
      <div className="rounded-2xl bg-[#1B2B3A] p-6 sm:p-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
          Wallet Balance
        </p>
        <p className="text-5xl font-extrabold mt-1">UGX 1,240,000</p>
        <p className="text-sm text-white/50 mt-1">
          Pending disbursement: UGX 8,000,000
        </p>
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => setDepositOpen(true)}
            className="px-5 py-2 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors"
          >
            + Deposit
          </button>
          <button className="px-5 py-2 rounded-xl border border-white/30 text-white text-sm font-semibold hover:border-white/60 transition-colors">
            Withdraw
          </button>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-[#1B2B3A] dark:text-white">
            Transaction History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Description
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {transactions.map((t, i) => (
                <tr key={i}>
                  <td className="px-5 py-4 text-gray-500">{t.date}</td>
                  <td className="px-5 py-4 text-[#1B2B3A] dark:text-white">
                    {t.desc}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        t.type === "Received"
                          ? "bg-teal-50 text-[#2BB5A0]"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td
                    className={`px-5 py-4 text-right font-semibold ${t.neg ? "text-red-500" : "text-[#2BB5A0]"}`}
                  >
                    {t.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit modal */}
      {depositOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-[#1B2B3A] dark:text-white mb-4">
              Deposit Funds
            </h3>
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Amount (UGX)
              </label>
              <input
                type="number"
                placeholder="e.g. 500000"
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-[#2BB5A0]"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDepositOpen(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => setDepositOpen(false)}
                className="flex-1 py-2.5 bg-[#2BB5A0] text-white rounded-xl text-sm font-semibold hover:bg-[#239E8C]"
              >
                Confirm Deposit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
