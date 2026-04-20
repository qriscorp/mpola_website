"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Download } from "lucide-react";
import {
  useLenderWalletBalance,
  useLenderTransactions,
  useLenderDeposit,
} from "@/hooks/use-lender";
import { formatCurrency } from "@/lib/format";

export default function LenderWalletPage() {
  const { data: balance } = useLenderWalletBalance();
  const { data: transactions = [] } = useLenderTransactions();
  const { mutate: deposit, isPending } = useLenderDeposit();
  const [amount, setAmount] = useState("500000");
  const [method, setMethod] = useState("MTN MoMo");
  const [phone, setPhone] = useState("+256772 843 901");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1B2B3A] dark:text-white">
          Lending Wallet
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage funds, top-ups, and withdrawals
        </p>
      </div>

      {/* Balance Card */}
      <Card className="bg-linear-to-br from-[#1B2B3A] to-[#2d4a5e] text-white overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-300">
            Available Balance
          </p>
          <p className="text-4xl sm:text-5xl font-bold mt-2">
            <span className="text-lg font-normal text-gray-300">UGX</span>{" "}
            {balance?.toLocaleString() ?? "0"}
          </p>
          <p className="text-sm text-gray-300 mt-2">
            Ready to deploy · Last deposit 2 days ago
          </p>
          <div className="flex gap-3 mt-6">
            <Button className="bg-[#2BB5A0] hover:bg-[#239E8C] text-white gap-2">
              <Plus className="h-4 w-4" /> Deposit
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 gap-2"
            >
              <Download className="h-4 w-4" /> Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction History */}
        <Card className="bg-white dark:bg-gray-900 lg:col-span-2">
          <CardHeader>
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Transaction History
            </h2>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] uppercase text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="text-[10px] uppercase text-muted-foreground">
                    Description
                  </TableHead>
                  <TableHead className="text-[10px] uppercase text-muted-foreground hidden sm:table-cell">
                    Method
                  </TableHead>
                  <TableHead className="text-[10px] uppercase text-muted-foreground text-right">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {txn.date}
                    </TableCell>
                    <TableCell className="text-sm">{txn.description}</TableCell>
                    <TableCell className="text-sm hidden sm:table-cell text-muted-foreground">
                      {txn.method}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`text-sm font-semibold ${txn.type === "credit" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {txn.type === "credit" ? "+" : "−"}{" "}
                        {formatCurrency(txn.amount)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Deposit */}
        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Quick Deposit
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                  UGX
                </span>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="flex gap-2">
                {["MTN MoMo", "Airtel", "Bank"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      method === m
                        ? "bg-[#1B2B3A] text-white border-[#1B2B3A] dark:bg-white dark:text-[#1B2B3A]"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                  🇺🇬
                </span>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              onClick={() => deposit({ amount: Number(amount), method, phone })}
              disabled={isPending}
              className="w-full bg-[#2BB5A0] hover:bg-[#239E8C] text-white"
            >
              {isPending ? "Processing..." : "Deposit Now"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
