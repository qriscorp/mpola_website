"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BorrowerPageHeader } from "@/components/top-nav";
import { useLoanDetail, useMakeRepayment } from "@/hooks/use-repayments";
import { useWallet } from "@/hooks/use-wallet";
import { formatCurrency } from "@/lib/format";
import { FormSkeleton } from "@/components/skeletons";

type Method = "mobile_money" | "wallet";

export default function MakePaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loanId = searchParams.get("loanId") ?? undefined;

  const { data: loan, isLoading: loanLoading } = useLoanDetail(loanId);
  const { data: wallet } = useWallet();
  const { mutate: makeRepayment, isPending } = useMakeRepayment();

  const [method, setMethod] = useState<Method>("mobile_money");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<string>("");

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
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Loan not found.
        </div>
      </div>
    );
  }

  const dueAmount = loan.next_payment_amount ?? loan.monthly_payment;
  const effectiveAmount = amount ? Number(amount) : dueAmount;
  const instalmentNumber = loan.paid_instalments + 1;

  const handleSubmit = () => {
    makeRepayment(
      {
        loan_id: loan.id,
        amount: effectiveAmount,
        payment_method: method,
        phone_number: method === "mobile_money" ? phone : undefined,
      },
      {
        onSuccess: (result) => {
          const params = new URLSearchParams({
            txn: result.repayment.transaction_id ?? result.repayment.id,
            amount: String(result.repayment.amount),
            method: result.repayment.payment_method ?? method,
            loanRef: loan.id,
            date: result.repayment.created_at,
          });
          router.push(`/dashboard/repayments/pay/confirmation?${params}`);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Make a Payment" />

      <div className="max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-black text-[#1B2B3A]">Make a Payment</h2>

        <div className="mt-6 rounded-2xl bg-[#E6F4F2] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm sm:text-base text-gray-500">
                Instalment #{instalmentNumber}
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-black text-[#1B2B3A]">
                {formatCurrency(dueAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {(["mobile_money", "wallet"] as Method[]).map((m) => {
            const active = method === m;
            return (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "border-[#2BB5A0] bg-[#E6F4F2] text-[#149D8E]"
                    : "border-gray-300 bg-white text-[#1B2B3A]"
                }`}
              >
                {m === "mobile_money" ? "Mobile Money" : "Wallet"}
              </button>
            );
          })}
        </div>

        {method === "mobile_money" ? (
          <div className="mt-6">
            <label className="mb-2 block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500">
              Mobile Money Number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+256 7XX XXX XXX"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-[#1B2B3A] outline-none"
            />
          </div>
        ) : (
          <p className="mt-6 text-sm text-gray-500">
            Wallet balance: {formatCurrency(wallet?.balance ?? 0)}
          </p>
        )}

        <div className="mt-6">
          <label className="mb-2 block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500">
            Amount
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
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending || (method === "mobile_money" && !phone)}
          className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-[#149D8E] px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-[#108a7d] disabled:opacity-50"
        >
          {isPending ? "Processing…" : `Pay ${formatCurrency(effectiveAmount)}`}
        </button>
      </div>
    </div>
  );
}
