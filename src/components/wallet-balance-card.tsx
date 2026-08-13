"use client";

import { formatCurrency } from "@/lib/format";

interface WalletBalanceCardProps {
  balance: number;
  isWalletSetup: boolean;
  isLoading?: boolean;
  /** Matches the borrower (teal) vs lender (gold) accent already used across each portal. */
  accent?: "teal" | "gold";
  subtitle?: string;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  onSetup?: () => void;
  extraActions?: React.ReactNode;
  /** Admin-frozen wallet — deposit/withdraw/pay actions are hidden and the
   * backend rejects them regardless, so this is purely so the UI doesn't
   * offer a button that would only fail. */
  isFrozen?: boolean;
  frozenReason?: string | null;
}

const ACCENT_BUTTON_CLASSES: Record<"teal" | "gold", string> = {
  teal: "bg-[#2BB5A0] hover:bg-[#239E8C]",
  gold: "bg-[#C4A55A] hover:bg-[#b3944a]",
};

export function WalletBalanceCard({
  balance,
  isWalletSetup,
  isLoading,
  accent = "teal",
  subtitle,
  onDeposit,
  onWithdraw,
  onSetup,
  extraActions,
  isFrozen,
  frozenReason,
}: WalletBalanceCardProps) {
  const accentClasses = ACCENT_BUTTON_CLASSES[accent];

  return (
    <div className="rounded-2xl bg-[#1B2B3A] p-6 sm:p-8 text-white">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
        {isWalletSetup ? "Wallet Balance" : "Wallet"}
      </p>

      {isLoading ? (
        <div className="h-12 w-56 mt-2 bg-white/10 rounded-lg animate-pulse" />
      ) : isWalletSetup ? (
        <p className="text-4xl sm:text-5xl font-extrabold mt-1">
          {formatCurrency(balance)}
        </p>
      ) : (
        <p className="text-lg font-semibold mt-2 text-white/80">
          Set up your wallet to start depositing and withdrawing funds.
        </p>
      )}

      {subtitle && !isLoading && isWalletSetup && (
        <p className="text-sm text-white/50 mt-1">{subtitle}</p>
      )}

      {isFrozen && !isLoading && (
        <div className="mt-4 rounded-xl bg-red-500/15 border border-red-400/30 px-4 py-3">
          <p className="text-sm font-semibold text-red-100">Wallet frozen</p>
          <p className="text-sm text-red-100/80 mt-0.5">
            {frozenReason || "Contact support for details."} You can't deposit, withdraw, or
            make transactions until it's unfrozen.
          </p>
        </div>
      )}

      <div className="flex gap-3 mt-6 flex-wrap">
        {isLoading || isFrozen ? null : !isWalletSetup ? (
          <button
            onClick={onSetup}
            className={`px-5 py-2 rounded-xl text-white text-sm font-semibold transition-colors ${accentClasses}`}
          >
            Set Up Wallet
          </button>
        ) : (
          <>
            <button
              onClick={onDeposit}
              className={`px-5 py-2 rounded-xl text-white text-sm font-semibold transition-colors ${accentClasses}`}
            >
              + Deposit
            </button>
            <button
              onClick={onWithdraw}
              className="px-5 py-2 rounded-xl border border-white/30 text-white text-sm font-semibold hover:border-white/60 hover:bg-white/10 transition-colors"
            >
              Withdraw
            </button>
            {extraActions}
          </>
        )}
      </div>
    </div>
  );
}
