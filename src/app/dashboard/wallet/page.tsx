"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BorrowerPageHeader } from "@/components/top-nav";
import { WalletBalanceCard } from "@/components/wallet-balance-card";
import { WalletTransactionList } from "@/components/wallet-transaction-list";
import { useWallet, useTransactions, useTopUp } from "@/hooks/use-wallet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function WalletPage() {
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const { mutate: topUp, isPending } = useTopUp();

  const [depositOpen, setDepositOpen] = useState(false);
  const [amount, setAmount] = useState("500000");
  const [phone, setPhone] = useState("");

  const isWalletSetup = wallet?.is_wallet_setup ?? false;

  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Wallet" />

      <WalletBalanceCard
        balance={wallet?.balance ?? 0}
        isWalletSetup={isWalletSetup}
        isLoading={walletLoading}
        accent="teal"
        onDeposit={() => setDepositOpen(true)}
        onWithdraw={() => toast.info("Withdrawals are coming in the next update.")}
        onSetup={() => toast.info("Wallet setup is coming in the next update.")}
      />

      {/* Transaction history */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-[#1B2B3A] dark:text-white">
            Transaction History
          </h2>
        </div>
        <WalletTransactionList transactions={transactions} isLoading={txLoading} />
      </div>

      {/* Deposit modal */}
      {depositOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#1B2B3A] dark:text-white">
              Deposit Funds
            </h3>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Amount (UGX)
              </Label>
              <Input
                type="number"
                placeholder="e.g. 500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Phone Number
              </Label>
              <Input
                placeholder="+256 7XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDepositOpen(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  topUp({ amount: Number(amount), method: "MTN MoMo", phone });
                  setDepositOpen(false);
                }}
                disabled={isPending}
                className="flex-1 py-2.5 bg-[#2BB5A0] text-white rounded-xl text-sm font-semibold hover:bg-[#239E8C] disabled:opacity-50"
              >
                {isPending ? "Processing…" : "Confirm Deposit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
