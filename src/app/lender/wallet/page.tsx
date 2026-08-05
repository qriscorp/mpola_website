"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLenderWallet, useLenderTransactions } from "@/hooks/use-lender";
import { useSetupWallet } from "@/hooks/use-wallet";
import { LenderPageHeader } from "@/components/lender-top-nav";
import { WalletBalanceCard } from "@/components/wallet-balance-card";
import { WalletTransactionList } from "@/components/wallet-transaction-list";
import { WalletSetupModal } from "@/components/wallet-setup-modal";
import { WalletDepositModal } from "@/components/wallet-deposit-modal";
import { WalletWithdrawModal } from "@/components/wallet-withdraw-modal";

export default function LenderWalletPage() {
  const { data: wallet, isLoading: walletLoading } = useLenderWallet();
  const { data: transactions, isLoading: txLoading } = useLenderTransactions();
  const { mutate: setupWallet, isPending: isSettingUp } = useSetupWallet();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

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
        onWithdraw={() => setShowWithdraw(true)}
        onSetup={() => setShowSetup(true)}
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

      <WalletDepositModal
        open={showDeposit}
        onClose={() => setShowDeposit(false)}
        accent="gold"
      />

      <WalletWithdrawModal
        open={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        accent="gold"
      />

      <WalletSetupModal
        open={showSetup}
        onClose={() => setShowSetup(false)}
        onSubmit={(pin) => {
          setupWallet(pin, { onSuccess: () => setShowSetup(false) });
        }}
        isPending={isSettingUp}
        accent="gold"
      />
    </div>
  );
}
