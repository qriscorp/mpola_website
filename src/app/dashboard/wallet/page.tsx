"use client";

import { useState } from "react";
import { BorrowerPageHeader } from "@/components/top-nav";
import { WalletBalanceCard } from "@/components/wallet-balance-card";
import { WalletTransactionList } from "@/components/wallet-transaction-list";
import { WalletSetupModal } from "@/components/wallet-setup-modal";
import { WalletDepositModal } from "@/components/wallet-deposit-modal";
import { WalletWithdrawModal } from "@/components/wallet-withdraw-modal";
import { useWallet, useTransactions, useSetupWallet } from "@/hooks/use-wallet";
import { PaginationControls } from "@/components/ui/pagination-controls";

const PAGE_SIZE = 20;

export default function WalletPage() {
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const [txPage, setTxPage] = useState(1);
  const { data: txData, isLoading: txLoading } = useTransactions(txPage, PAGE_SIZE);
  const { mutate: setupWallet, isPending: isSettingUp } = useSetupWallet();

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);

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
        onWithdraw={() => setWithdrawOpen(true)}
        onSetup={() => setSetupOpen(true)}
      />

      {/* Transaction history */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-[#1B2B3A] dark:text-white">
            Transaction History
          </h2>
        </div>
        <WalletTransactionList transactions={txData?.transactions} isLoading={txLoading} />
        {!txLoading && (
          <div className="px-5 pb-5">
            <PaginationControls
              page={txPage}
              pageSize={PAGE_SIZE}
              total={txData?.total ?? 0}
              onPageChange={setTxPage}
            />
          </div>
        )}
      </div>

      <WalletDepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        accent="teal"
      />

      <WalletWithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        accent="teal"
      />

      <WalletSetupModal
        open={setupOpen}
        onClose={() => setSetupOpen(false)}
        onSubmit={(pin) => {
          setupWallet(pin, { onSuccess: () => setSetupOpen(false) });
        }}
        isPending={isSettingUp}
        accent="teal"
      />
    </div>
  );
}
