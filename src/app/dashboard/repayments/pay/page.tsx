"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useActiveLoan } from "@/hooks/use-dashboard";
import { useInstalments } from "@/hooks/use-repayments";
import { useWalletBalance } from "@/hooks/use-wallet";
import { formatCurrency } from "@/lib/format";

const METHODS = ["LendFlow Wallet", "MTN MoMo", "Airtel Money"] as const;

export default function PayPage() {
  const { data: loan } = useActiveLoan();
  const { data: instalments } = useInstalments();
  const { data: walletBalance } = useWalletBalance();
  const [method, setMethod] =
    useState<(typeof METHODS)[number]>("LendFlow Wallet");

  const dueInstalment = instalments?.find((i) => i.status === "due");
  const upcomingInstalments =
    instalments?.filter((i) => i.status === "upcoming").slice(0, 5) ?? [];
  const totalRemaining =
    instalments
      ?.filter((i) => i.status === "upcoming" || i.status === "due")
      .reduce((sum, i) => sum + i.amount, 0) ?? 0;
  const paymentAmount = dueInstalment?.amount ?? 458200;
  const balanceAfter = (walletBalance ?? 0) - paymentAmount;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/repayments"
        className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Schedule
      </Link>

      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-4xl font-bold text-[#1B2B3A]">Make a Payment</h1>
          <p className="text-gray-500 mt-1">
            Instalment #{dueInstalment?.number ?? 5} of{" "}
            {loan?.totalInstalments ?? 12} · Due{" "}
            {dueInstalment?.dueDate ?? "1 May 2026"}
          </p>
        </div>
        <Badge className="bg-amber-50 text-amber-600 border-0 text-xs ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 inline-block" />{" "}
          14 days
        </Badge>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left: Payment Details + Method */}
        <div className="col-span-3 space-y-6">
          {/* Payment Details */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Payment Details
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Instalment</p>
                  <p className="text-lg font-bold text-[#1B2B3A]">
                    #{dueInstalment?.number ?? 5} of{" "}
                    {loan?.totalInstalments ?? 12}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Amount Due</p>
                  <p className="text-lg font-bold text-[#1B2B3A]">
                    <span className="text-xs font-normal text-gray-400">
                      UGX{" "}
                    </span>
                    {paymentAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Due Date</p>
                  <p className="text-lg font-bold text-[#1B2B3A]">
                    {dueInstalment?.dueDate ?? "1 May 2026"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Lender</p>
                  <p className="text-lg font-bold text-[#1B2B3A]">
                    Kampala Capital
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Payment Method
              </p>
              <div className="flex border border-gray-200 rounded-lg overflow-hidden w-fit">
                {METHODS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors
                      ${method === m ? "bg-[#1B2B3A] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {method === "LendFlow Wallet" && (
                <div className="mt-5 space-y-3">
                  <div className="flex justify-between text-sm py-2">
                    <span className="text-gray-500">Available Balance</span>
                    <span className="font-semibold">
                      {formatCurrency(walletBalance ?? 842500)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm py-2 text-[#2BB5A0]">
                    <span>Amount Being Paid</span>
                    <span className="font-semibold">
                      – {formatCurrency(paymentAmount)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-sm">
                    <span className="font-semibold text-[#1B2B3A]">
                      Balance After Payment
                    </span>
                    <span className="font-bold text-[#1B2B3A]">
                      {formatCurrency(balanceAfter)}
                    </span>
                  </div>
                </div>
              )}

              {method === "MTN MoMo" && (
                <div className="mt-5 space-y-3">
                  <div>
                    <Label>MTN MoMo phone number</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                        🇺🇬
                      </span>
                      <Input className="pl-10" defaultValue="+256772 843 901" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      You&apos;ll receive an STK push prompt to authorize{" "}
                      {formatCurrency(paymentAmount)}.
                    </p>
                  </div>
                </div>
              )}

              {method === "Airtel Money" && (
                <div className="mt-5 space-y-3">
                  <div>
                    <Label>Airtel Money phone number</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                        🇺🇬
                      </span>
                      <Input className="pl-10" defaultValue="+256702 843 901" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      You&apos;ll receive an STK push prompt to authorize{" "}
                      {formatCurrency(paymentAmount)}.
                    </p>
                  </div>
                </div>
              )}

              {/* Pay button */}
              <button className="mt-6 w-full bg-[#2BB5A0] text-white py-3 rounded-xl font-semibold text-base inline-flex items-center justify-center gap-2 hover:bg-[#239E8C] transition-colors">
                Pay {formatCurrency(paymentAmount)}{" "}
                <ArrowRight className="w-4 h-4" />
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Remaining Schedule */}
        <div className="col-span-2">
          <Card className="bg-white sticky top-6">
            <CardContent className="p-6">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Remaining Schedule
              </p>
              <div className="space-y-4">
                {upcomingInstalments.map((inst) => (
                  <div
                    key={inst.number}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-sm text-[#1B2B3A]">
                        Instalment #{inst.number}
                      </p>
                      <p className="text-xs text-gray-400">{inst.dueDate}</p>
                    </div>
                    <p className="font-semibold text-sm">
                      {formatCurrency(inst.amount)}
                    </p>
                  </div>
                ))}

                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <p className="font-bold text-[#1B2B3A]">Total Remaining</p>
                  <p className="font-bold text-[#1B2B3A]">
                    {formatCurrency(totalRemaining)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
