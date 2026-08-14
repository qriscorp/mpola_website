"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BorrowerPageHeader } from "@/components/top-nav";
import { useLoanDetail, useMakeRepayment } from "@/hooks/use-repayments";
import { useActiveLoan } from "@/hooks/use-dashboard";
import { useWallet } from "@/hooks/use-wallet";
import { WalletDepositModal } from "@/components/wallet-deposit-modal";
import { formatCurrency, formatDuration, formatRate } from "@/lib/format";
import { FormSkeleton } from "@/components/skeletons";
import { calcPlatformFee } from "@/lib/fees";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-UG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function MakePaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loanIdParam = searchParams.get("loanId") ?? undefined;

  // The sidebar's "Make a Payment" link doesn't know which loan to pay —
  // it links here with no loanId. Fall back to the borrower's current
  // active loan in that case, same as the dashboard's "Pay Now" banner.
  const { data: loanFromParam, isLoading: loanFromParamLoading } =
    useLoanDetail(loanIdParam);
  const { data: activeLoan, isLoading: activeLoanLoading } = useActiveLoan();
  const loan = loanIdParam ? loanFromParam : activeLoan;
  const loanLoading = loanIdParam ? loanFromParamLoading : activeLoanLoading;

  const { data: wallet } = useWallet();
  const { mutate: makeRepayment, isPending } = useMakeRepayment();

  const [amount, setAmount] = useState<string>("");
  const [depositOpen, setDepositOpen] = useState(false);

  if (loanLoading) {
    return (
      <div className="space-y-6">
        <BorrowerPageHeader title="Make a Payment" />
        <FormSkeleton />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="space-y-6">
        <BorrowerPageHeader title="Make a Payment" />
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 space-y-3 dark:border-gray-800 dark:text-gray-400 dark:bg-gray-900">
          <p>
            {loanIdParam
              ? "That loan couldn't be found."
              : "You don't have an active loan to repay yet."}
          </p>
          <Link
            href="/dashboard/my-requests"
            className="inline-block text-sm font-semibold text-[#2BB5A0] hover:underline"
          >
            View my requests →
          </Link>
        </div>
      </div>
    );
  }

  const isBulletLoan = loan.duration_days != null;
  const dueAmount = loan.next_payment_amount ?? loan.monthly_payment;
  const remainingBalance = Math.max(0, loan.total_repayable - loan.total_paid);
  const showPayoffOption = remainingBalance > dueAmount;
  const effectiveAmount = amount ? Number(amount) : dueAmount;
  const payMode: "instalment" | "full" | "custom" =
    effectiveAmount === dueAmount
      ? "instalment"
      : effectiveAmount === remainingBalance
        ? "full"
        : "custom";
  const instalmentNumber = loan.paid_instalments + 1;
  const walletFee = calcPlatformFee(effectiveAmount);
  const walletTotalDebit = effectiveAmount + walletFee;
  const walletBalance = wallet?.balance ?? 0;
  const shortfall = walletTotalDebit - walletBalance;
  const insufficientBalance = shortfall > 0;
  // Paying more than what's actually owed sends real money the loan has no
  // way to credit back — the quick-select buttons never produce this, but a
  // hand-typed custom amount can. The backend enforces the same cap.
  const exceedsBalance = effectiveAmount > remainingBalance + 1;
  const progressPct = loan.total_repayable
    ? Math.min(100, Math.round((loan.total_paid / loan.total_repayable) * 100))
    : 0;

  const handleSubmit = () => {
    makeRepayment(
      {
        loan_id: loan.id,
        amount: effectiveAmount,
        payment_method: "wallet",
      },
      {
        onSuccess: (result) => {
          const params = new URLSearchParams({
            status: "success",
            repaymentId: result.repayment.id,
            txn: result.repayment.transaction_id ?? result.repayment.id,
            amount: String(result.repayment.amount),
            method: result.repayment.payment_method ?? "wallet",
            loanRef: loan.id,
            date: result.repayment.created_at,
          });
          router.push(`/dashboard/repayments/pay/confirmation?${params}`);
        },
        onError: (err: Error) => {
          const params = new URLSearchParams({
            status: "failed",
            reason: err.message || "Payment failed. Please try again.",
            amount: String(effectiveAmount),
            method: "wallet",
            loanRef: loan.id,
          });
          router.push(`/dashboard/repayments/pay/confirmation?${params}`);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Make a Payment" />

      <div className="max-w-3xl space-y-5">
        {/* Loan summary */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-xl font-black text-[#1B2B3A] dark:text-white">Loan Summary</h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 dark:bg-gray-800">
              {loan.id}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Principal
              </p>
              <p className="mt-1 text-sm font-bold text-[#1B2B3A] dark:text-white">
                {formatCurrency(loan.amount)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Duration
              </p>
              <p className="mt-1 text-sm font-bold text-[#1B2B3A] dark:text-white">
                {formatDuration(loan.duration, loan.duration_days)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Interest Rate
              </p>
              <p className="mt-1 text-sm font-bold text-[#1B2B3A] dark:text-white">
                {formatRate(loan.interest_rate)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Disbursed
              </p>
              <p className="mt-1 text-sm font-bold text-[#1B2B3A] dark:text-white">
                {formatDate(loan.disbursed_at)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5 dark:text-gray-400">
              <span>
                {isBulletLoan
                  ? "Repaid so far"
                  : `Instalments paid: ${loan.paid_instalments} of ${loan.total_instalments}`}
              </span>
              <span className="font-semibold text-[#1B2B3A] dark:text-white">
                {formatCurrency(loan.total_paid)} / {formatCurrency(loan.total_repayable)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-[#2BB5A0]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Payment due */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-2xl font-black text-[#1B2B3A] dark:text-white">Make a Payment</h2>

          <div className="mt-6 rounded-2xl bg-[#E6F4F2] p-5 dark:bg-[#149D8E]/20">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                  {isBulletLoan
                    ? "Repayment Due"
                    : `Instalment #${instalmentNumber} of ${loan.total_instalments}`}
                </p>
                <p className="mt-1 text-2xl sm:text-3xl font-black text-[#1B2B3A] dark:text-white">
                  {formatCurrency(dueAmount)}
                </p>
              </div>
              {loan.next_payment_date && (
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Due Date
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#1B2B3A] dark:text-white">
                    {formatDate(loan.next_payment_date)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {showPayoffOption && (
            <div className="mt-6">
              <p className="mb-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                How much would you like to pay?
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setAmount(String(dueAmount))}
                  className={`flex-1 min-w-[180px] rounded-xl border p-4 text-left transition-colors ${
                    payMode === "instalment"
                      ? "border-[#2BB5A0] bg-[#E6F4F2] dark:bg-[#149D8E]/20"
                      : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900"
                  }`}
                >
                  <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                    Pay this instalment
                  </p>
                  <p className="mt-1 text-lg font-black text-[#1B2B3A] dark:text-white">
                    {formatCurrency(dueAmount)}
                  </p>
                </button>
                <button
                  onClick={() => setAmount(String(remainingBalance))}
                  className={`flex-1 min-w-[180px] rounded-xl border p-4 text-left transition-colors ${
                    payMode === "full"
                      ? "border-[#2BB5A0] bg-[#E6F4F2] dark:bg-[#149D8E]/20"
                      : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900"
                  }`}
                >
                  <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                    Pay off full balance
                  </p>
                  <p className="mt-1 text-lg font-black text-[#1B2B3A] dark:text-white">
                    {formatCurrency(remainingBalance)}
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Wallet payment — the only method offered for repayments */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/60">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Paying from
                </p>
                <p className="text-sm font-bold text-[#1B2B3A] dark:text-white">Wallet</p>
              </div>
              <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                Balance: {formatCurrency(walletBalance)}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 space-y-1 text-xs dark:border-gray-800 dark:bg-gray-800/60">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Repayment amount</span>
                <span>{formatCurrency(effectiveAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Platform fee (0.5%)</span>
                <span>{formatCurrency(walletFee)}</span>
              </div>
              <div className="flex justify-between font-semibold text-[#1B2B3A] pt-1 border-t border-gray-200 dark:border-gray-800 dark:text-white">
                <span>Total debited from wallet</span>
                <span>{formatCurrency(walletTotalDebit)}</span>
              </div>
            </div>

            {insufficientBalance && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-wrap items-center justify-between gap-3 dark:border-amber-800 dark:bg-amber-900/20">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Your wallet balance is too low for this payment. Deposit at
                  least {formatCurrency(shortfall)} more to continue.
                </p>
                <button
                  onClick={() => setDepositOpen(true)}
                  className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
                >
                  Deposit Funds
                </button>
              </div>
            )}
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Amount to Pay
            </label>
            <div className="flex items-center overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
              <span className="inline-flex h-full items-center px-4 py-3 text-base sm:text-lg font-bold text-gray-500 dark:text-gray-400">
                UGX
              </span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={String(dueAmount)}
                className="w-full px-4 py-3 text-base text-[#1B2B3A] outline-none dark:text-white"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAmount(String(dueAmount))}
                className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors dark:border-gray-700 dark:text-gray-300"
              >
                Full amount due
              </button>
              <button
                type="button"
                onClick={() => setAmount(String(Math.round(dueAmount / 2)))}
                className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors dark:border-gray-700 dark:text-gray-300"
              >
                Pay half now
              </button>
              {showPayoffOption && (
                <button
                  type="button"
                  onClick={() => setAmount(String(remainingBalance))}
                  className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors dark:border-gray-700 dark:text-gray-300"
                >
                  Pay off loan in full
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              You can pay this instalment in full, pay part of it now and cover the rest before
              the due date, or pay off your whole remaining balance in one go — whichever suits
              you. Whatever&apos;s left after your payment stays as your next payment amount; if
              it&apos;s still unpaid after the due date, a late fee applies to just that remaining
              balance, not the full instalment. You can&apos;t pay more than what you actually owe
              on this loan.
            </p>
            {exceedsBalance && (
              <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">
                That&apos;s more than your remaining balance of {formatCurrency(remainingBalance)}.
                Lower the amount or use &quot;Pay off loan in full&quot; above.
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isPending || insufficientBalance || exceedsBalance}
            className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-[#149D8E] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#108a7d] disabled:opacity-50"
          >
            {isPending ? "Processing…" : `Pay ${formatCurrency(walletTotalDebit)}`}
          </button>
        </div>
      </div>

      <WalletDepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        accent="teal"
      />
    </div>
  );
}

export default function MakePaymentPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <MakePaymentContent />
    </Suspense>
  );
}
