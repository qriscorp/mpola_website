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
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 space-y-3">
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
  const effectiveAmount = amount ? Number(amount) : dueAmount;
  const instalmentNumber = loan.paid_instalments + 1;
  const walletFee = calcPlatformFee(effectiveAmount);
  const walletTotalDebit = effectiveAmount + walletFee;
  const walletBalance = wallet?.balance ?? 0;
  const shortfall = walletTotalDebit - walletBalance;
  const insufficientBalance = shortfall > 0;
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
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-xl font-black text-[#1B2B3A]">Loan Summary</h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
              {loan.id}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Principal
              </p>
              <p className="mt-1 text-sm font-bold text-[#1B2B3A]">
                {formatCurrency(loan.amount)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Duration
              </p>
              <p className="mt-1 text-sm font-bold text-[#1B2B3A]">
                {formatDuration(loan.duration, loan.duration_days)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Interest Rate
              </p>
              <p className="mt-1 text-sm font-bold text-[#1B2B3A]">
                {formatRate(loan.interest_rate)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Disbursed
              </p>
              <p className="mt-1 text-sm font-bold text-[#1B2B3A]">
                {formatDate(loan.disbursed_at)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>
                {isBulletLoan
                  ? "Repaid so far"
                  : `Instalments paid: ${loan.paid_instalments} of ${loan.total_instalments}`}
              </span>
              <span className="font-semibold text-[#1B2B3A]">
                {formatCurrency(loan.total_paid)} / {formatCurrency(loan.total_repayable)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#2BB5A0]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Payment due */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-black text-[#1B2B3A]">Make a Payment</h2>

          <div className="mt-6 rounded-2xl bg-[#E6F4F2] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm sm:text-base text-gray-500">
                  {isBulletLoan
                    ? "Repayment Due"
                    : `Instalment #${instalmentNumber} of ${loan.total_instalments}`}
                </p>
                <p className="mt-1 text-2xl sm:text-3xl font-black text-[#1B2B3A]">
                  {formatCurrency(dueAmount)}
                </p>
              </div>
              {loan.next_payment_date && (
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Due Date
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#1B2B3A]">
                    {formatDate(loan.next_payment_date)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Wallet payment — the only method offered for repayments */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Paying from
                </p>
                <p className="text-sm font-bold text-[#1B2B3A]">Wallet</p>
              </div>
              <p className="text-sm font-semibold text-[#1B2B3A]">
                Balance: {formatCurrency(walletBalance)}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Repayment amount</span>
                <span>{formatCurrency(effectiveAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Platform fee (0.5%)</span>
                <span>{formatCurrency(walletFee)}</span>
              </div>
              <div className="flex justify-between font-semibold text-[#1B2B3A] pt-1 border-t border-gray-200">
                <span>Total debited from wallet</span>
                <span>{formatCurrency(walletTotalDebit)}</span>
              </div>
            </div>

            {insufficientBalance && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-amber-700">
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
            <label className="mb-2 block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500">
              Amount to Pay
            </label>
            <div className="flex items-center overflow-hidden rounded-xl border border-gray-300">
              <span className="inline-flex h-full items-center px-4 py-3 text-base sm:text-lg font-bold text-gray-500">
                UGX
              </span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={String(dueAmount)}
                className="w-full px-4 py-3 text-base text-[#1B2B3A] outline-none"
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Defaults to the amount due. You can pay more to get ahead on
              your loan.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isPending || insufficientBalance}
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
