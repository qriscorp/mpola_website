"use client";

import { useState } from "react";
import { Plus, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWalletBalance, useTransactions } from "@/hooks/use-wallet";
import { formatCurrency } from "@/lib/format";

const TOP_UP_METHODS = ["MTN MoMo", "Airtel", "Bank"] as const;

export default function WalletPage() {
  const { data: balance } = useWalletBalance();
  const { data: transactions } = useTransactions();
  const [topUpAmount, setTopUpAmount] = useState(500000);
  const [topUpMethod, setTopUpMethod] =
    useState<(typeof TOP_UP_METHODS)[number]>("MTN MoMo");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#1B2B3A]">My Wallet</h1>
        <p className="text-gray-500 mt-1">
          Manage funds, top-ups, and withdrawals
        </p>
      </div>

      {/* Balance Card - dark gradient */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1B2B3A] to-[#2a4560] text-white p-8">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
          Available Balance
        </p>
        <p className="mt-2">
          <span className="text-lg text-gray-400 font-medium">UGX</span>{" "}
          <span className="text-5xl font-bold">
            {(balance ?? 842500).toLocaleString()}
          </span>
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Last top-up UGX 500,000 on 14 Apr
        </p>

        <div className="flex gap-3 mt-6">
          <Button className="bg-[#2BB5A0] text-white hover:bg-[#239E8C]">
            <Plus className="w-4 h-4 mr-2" /> Top Up
          </Button>
          <Button
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 bg-transparent"
          >
            <Download className="w-4 h-4 mr-2" /> Pay Loan
          </Button>
        </div>
      </div>

      {/* Transaction History + Quick Top-Up */}
      <div className="grid grid-cols-3 gap-6">
        {/* Transaction History */}
        <Card className="col-span-2 bg-white">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-[#1B2B3A] mb-4">
              Transaction History
            </h2>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    Date
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    Description
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    Method
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 text-right">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="text-gray-500">{txn.date}</TableCell>
                    <TableCell className="font-medium text-[#1B2B3A]">
                      {txn.description}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {txn.method}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        txn.type === "credit"
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {txn.type === "credit" ? "+" : "–"}{" "}
                      {formatCurrency(txn.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Top-Up */}
        <Card className="bg-white self-start">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-[#1B2B3A]">Quick Top-Up</h2>

            <div>
              <Label>Amount</Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                  UGX
                </span>
                <Input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  className="pl-14 font-semibold"
                />
              </div>
            </div>

            <div>
              <div className="flex border border-gray-200 rounded-lg overflow-hidden w-full">
                {TOP_UP_METHODS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setTopUpMethod(m)}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors
                      ${topUpMethod === m ? "bg-[#1B2B3A] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Phone</Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                  🇺🇬
                </span>
                <Input className="pl-10" defaultValue="+256772 843 901" />
              </div>
            </div>

            <button className="w-full bg-[#2BB5A0] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#239E8C] transition-colors">
              Top Up Now
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
