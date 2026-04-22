"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useLenderWalletBalance,
  useLenderTransactions,
  useLenderDeposit,
} from "@/hooks/use-lender";
import { formatCurrency } from "@/lib/format";
import { LenderPageHeader } from "@/components/lender-top-nav";

type TxnType = "Received" | "Disbursed" | "Deposit" | "Withdrawal";

function typeBadge(type: TxnType) {
  if (type === "Received") return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">Received</span>;
  if (type === "Disbursed") return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">Disbursed</span>;
  if (type === "Deposit") return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">Deposit</span>;
  return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-500 border border-red-200">Withdrawal</span>;
}

const mockTransactions: Array<{id: number; date: string; description: string; type: TxnType; amount: string; positive: boolean}> = [
  { id: 1, date: "May 10, 2024", description: "Repayment from Agnes K.", type: "Received", amount: "UGX 2,400,000", positive: true },
  { id: 2, date: "May 7, 2024", description: "Loan disbursed to Brian T.", type: "Disbursed", amount: "UGX 3,000,000", positive: false },
  { id: 3, date: "May 1, 2024", description: "Top-up via MTN MoMo", type: "Deposit", amount: "UGX 5,000,000", positive: true },
  { id: 4, date: "Apr 28, 2024", description: "Repayment from Patience N.", type: "Received", amount: "UGX 1,800,000", positive: true },
  { id: 5, date: "Apr 20, 2024", description: "Loan disbursed to Agnes K.", type: "Disbursed", amount: "UGX 8,000,000", positive: false },
];

export default function LenderWalletPage() {
  const { data: balance } = useLenderWalletBalance();
  const { data: transactions = [] } = useLenderTransactions();
  const { mutate: deposit, isPending } = useLenderDeposit();
  const [amount, setAmount] = useState("500000");
  const [method, setMethod] = useState("MTN MoMo");
  const [phone, setPhone] = useState("+256772 843 901");
  const [showDeposit, setShowDeposit] = useState(false);

  return (
    <div className="space-y-6 max-w-5xl">
      <LenderPageHeader title="Wallet" />

      {/* Hero balance card */}
      <div className="rounded-2xl bg-[#1B2B3A] p-6 sm:p-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Available Balance</p>
        <p className="text-4xl sm:text-5xl font-extrabold mt-2">
          UGX {(balance ?? 14800000).toLocaleString()}
        </p>
        <p className="text-sm text-white/60 mt-1">Deployed: UGX 48M &nbsp;·&nbsp; Pending: UGX 6M</p>
        <div className="flex gap-3 mt-6 flex-wrap">
          <button
            onClick={() => setShowDeposit(true)}
            className="px-5 py-2 rounded-lg bg-[#C4A55A] text-white font-semibold text-sm hover:bg-[#b3944a] transition-colors"
          >
            + Deposit
          </button>
          <button className="px-5 py-2 rounded-lg border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors">
            Withdraw
          </button>
          <button className="px-5 py-2 rounded-lg border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors">
            Fund Loan
          </button>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
        <h3 className="font-semibold text-[#1B2B3A] dark:text-white mb-4">Transaction History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">Date</th>
                <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">Description</th>
                <th className="text-left pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider hidden sm:table-cell">Type</th>
                <th className="text-right pb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {mockTransactions.map((txn) => (
                <tr key={txn.id}>
                  <td className="py-3 text-gray-400 text-xs whitespace-nowrap">{txn.date}</td>
                  <td className="py-3 text-[#1B2B3A] dark:text-white font-medium">{txn.description}</td>
                  <td className="py-3 hidden sm:table-cell">{typeBadge(txn.type)}</td>
                  <td className={`py-3 text-right font-semibold ${txn.positive ? "text-emerald-600" : "text-orange-500"}`}>
                    {txn.positive ? "+" : "-"}{txn.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-xl font-bold text-[#1B2B3A] dark:text-white">Deposit Funds</h2>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount (UGX)</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</Label>
              <div className="flex gap-2">
                {["MTN MoMo", "Airtel", "Bank"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${method === m ? "bg-[#1B2B3A] text-white border-[#1B2B3A]" : "bg-white border-gray-200 text-gray-600"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowDeposit(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => { deposit({ amount: Number(amount), method, phone }); setShowDeposit(false); }}
                disabled={isPending}
                className="px-4 py-2 rounded-lg bg-[#C4A55A] text-white text-sm font-semibold hover:bg-[#b3944a] disabled:opacity-50"
              >
                {isPending ? "Processing…" : "Deposit Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
