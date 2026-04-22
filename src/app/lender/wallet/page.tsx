"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useLenderWalletBalance,
  useLenderTransactions,
  useLenderDeposit,
} from "@/hooks/use-lender";
import { formatCurrency } from "@/lib/format";
import { LenderPageHeader } from "@/components/lender-top-nav";

type TxnType = "Received" | "Disbursed" | "Deposit" | "Withdrawal";

function typeBadge(type: TxnType) {
  if (type === "Received") return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">Received</span>;
  if (type === "Disbursed") return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">Disbursed</span>;
  if (type === "Deposit") return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">Deposit</span>;
  return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-500 border border-red-200">Withdrawal</span>;
}

const mockTransactions: Array<{id: number; date: string; description: string; type: TxnType; amount: string; positive: boolean}> = [
  { id: 1, date: "May 10, 2024", description: "Repayment from Agnes K.", type: "Received", amount: "UGX 2,400,000", positive: true },
  { id: 2, date: "May 7, 2024", description: "Loan disbursed to Brian T.", type: "Disbursed", amount: "UGX 3,000,000", positive: false },
  { id: 3, date: "May 1, 2024", description: "Top-up via MTN MoMo", type: "Deposit", amount: "UGX 5,000,000", positive: true },
  { id: 4, date: "Apr 28, 2024", description: "Repayment from Patience N.", type: "Received", amount: "UGX 1,800,000", positive: true },
  { id: 5, date: "Apr 20, 2024", description: "Loan disbursed to Agnes K.", type: "Disbursed", amount: "UGX 8,000,000", positive: false },
];

export default function LenderWalletPage() {
  const { data: balance } = useLenderWalletBalance();
  const { data: transactions = [] } = useLenderTransactions();
  const { mutate: deposit, isPending } = useLenderDeposit();
  const [amount, setAmount] = useState("500000");
  const [method, setMethod] = useState("MTN MoMo");
  const [phone, setPhone] = useState("+256772 843 901");
  const [showDeposit, setShowDeposit] = useState(false);

  return (
    <div className="space-y-6 max-w-5xl">
      <LenderPageHeader title="Wallet" />

      {/* Hero balance card */}
      <div className="rounded-2xl bg-[#1B2B3A] p-6 sm:p-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Available Balance</p>
        <p className="text-4xl sm:text-5xl font-extrabold mt-2">
          UGX {(balance ?? 14800000).toLocaleString()}
        </p>
        <p className="text-sm text-white/60 mt-1">Deployed: UGX 48M &nbsp;Â·&nbsp; Pending: UGX 6M</p>
        <div className="flex gap-3 mt-6 flex-wrap">
          <button
            onClick={() => setShowDeposit(true)}
            className="px-5 py-2 rounded-lg bg-[#C4A55A] text-white font-semibold text-sm hover:bg-[#b3944a] transition-colors"
          >
            + Deposit
          </button>
          <button className="px-5 py-2 rounded-lg border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors">
            Withdraw
          </button>
          <button className="px-5 py-2 rounded-lg border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors">
            Fund Loan
          </button>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
        <h3 className="font-semibold text-[#1B2B3A] dark:text-white mb-4">Transaction History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">Date</th>
                <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">Description</th>
                <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider hidden sm:table-cell">Type</th>
                <th className="text-right pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {mockTransactions.map((txn) => (
                <tr key={txn.id}>
                  <td className="py-3 text-gray-400 text-xs whitespace-nowrap">{txn.date}</td>
                  <td className="py-3 text-[#1B2B3A] dark:text-white font-medium">{txn.description}</td>
                  <td className="py-3 hidden sm:table-cell">{typeBadge(txn.type)}</td>
                  <td className={`py-3 text-right font-semibold ${txn.positive ? "text-emerald-600" : "text-orange-500"}`}>
                    {txn.positive ? "+" : "-"}{txn.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-xl font-bold text-[#1B2B3A] dark:text-white">Deposit Funds</h2>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount (UGX)</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</Label>
              <div className="flex gap-2">
                {["MTN MoMo", "Airtel", "Bank"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${method === m ? "bg-[#1B2B3A] text-white border-[#1B2B3A]" : "bg-white border-gray-200 text-gray-600"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowDeposit(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => { deposit({ amount: Number(amount), method, phone }); setShowDeposit(false); }}
                disabled={isPending}
                className="px-4 py-2 rounded-lg bg-[#C4A55A] text-white text-sm font-semibold hover:bg-[#b3944a] disabled:opacity-50"
              >
                {isPending ? "Processingâ€¦" : "Deposit Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
