"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLenderWallet, useLenderTransactions } from "@/hooks/use-lender";
import { useSetupWallet } from "@/hooks/use-wallet";
import { LenderPageHeader } from "@/components/lender-top-nav";
import { WalletBalanceCard } from "@/components/wallet-balance-card";
import { WalletTransactionList } from "@/components/wallet-transaction-list";
import { WalletSetupModal } from "@/components/wallet-setup-modal";
import { WalletDepositModal } from "@/components/wallet-deposit-modal";
import { WalletWithdrawModal } from "@/components/wallet-withdraw-modal";
import { PaginationControls } from "@/components/ui/pagination-controls";

const PAGE_SIZE = 20;

export default function LenderWalletPage() {
  const router = useRouter();
  const { data: wallet, isLoading: walletLoading } = useLenderWallet();
  const [txPage, setTxPage] = useState(1);
  const { data: txData, isLoading: txLoading } = useLenderTransactions(txPage, PAGE_SIZE);
  const { mutate: setupWallet, isPending: isSettingUp } = useSetupWallet();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const isWalletSetup = wallet?.is_wallet_setup ?? false;

  return (
    <div className="space-y-6">
      <LenderPageHeader title="Wallet" />

      <WalletBalanceCard
        balance={wallet?.balance ?? 0}
        isWalletSetup={isWalletSetup}
        isLoading={walletLoading}
        accent="gold"
        isFrozen={wallet?.is_frozen}
        frozenReason={wallet?.frozen_reason}
        onDeposit={() => setShowDeposit(true)}
        onWithdraw={() => setShowWithdraw(true)}
        onSetup={() => setShowSetup(true)}
        extraActions={
          <button
            onClick={() => router.push("/lender/portfolio")}
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
          transactions={txData?.transactions}
          isLoading={txLoading}
        />
        {!txLoading && (
          <PaginationControls
            page={txPage}
            pageSize={PAGE_SIZE}
            total={txData?.total ?? 0}
            onPageChange={setTxPage}
          />
        )}
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
