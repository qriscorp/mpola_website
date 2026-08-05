"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useLenderWallet,
  useLenderDeposit,
  useLenderTransactions,
} from "@/hooks/use-lender";
import { LenderPageHeader } from "@/components/lender-top-nav";
import { WalletBalanceCard } from "@/components/wallet-balance-card";
import { WalletTransactionList } from "@/components/wallet-transaction-list";

export default function LenderWalletPage() {
  const { data: wallet, isLoading: walletLoading } = useLenderWallet();
  const { data: transactions, isLoading: txLoading } = useLenderTransactions();
  const { mutate: deposit, isPending } = useLenderDeposit();
  const [amount, setAmount] = useState("500000");
  const [method, setMethod] = useState("MTN MoMo");
  const [phone, setPhone] = useState("+256772 843 901");
  const [showDeposit, setShowDeposit] = useState(false);

  const isWalletSetup = wallet?.is_wallet_setup ?? false;

  return (
    <div className="space-y-6 max-w-5xl">
      <LenderPageHeader title="Wallet" />

      <WalletBalanceCard
        balance={wallet?.balance ?? 0}
        isWalletSetup={isWalletSetup}
        isLoading={walletLoading}
        accent="gold"
        onDeposit={() => setShowDeposit(true)}
        onWithdraw={() =>
          toast.info("Withdrawals are coming in the next update.")
        }
        onSetup={() =>
          toast.info("Wallet setup is coming in the next update.")
        }
        extraActions={
          <button
            onClick={() =>
              toast.info("Fund Loan is coming in the next update.")
            }
            className="px-5 py-2 rounded-lg border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
          >
            Fund Loan
          </button>
        }
      />

      {/* Transaction history */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
        <h3 className="font-semibold text-[#1B2B3A] dark:text-white mb-4">
          Transaction History
        </h3>
        <WalletTransactionList
          transactions={transactions}
          isLoading={txLoading}
        />
      </div>

      {/* Deposit modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-xl font-bold text-[#1B2B3A] dark:text-white">
              Deposit Funds
            </h2>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Amount (UGX)
              </Label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Method
              </Label>
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
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Phone
              </Label>
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
                onClick={() => {
                  deposit({ amount: Number(amount), method, phone });
                  setShowDeposit(false);
                }}
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
