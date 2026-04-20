"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Wallet, ArrowUpRight, ArrowDownRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";

const transactions = [
  {
    id: "pt_001",
    date: "20 Apr 2026",
    user: "Sarah Nakato",
    type: "Repayment",
    method: "MTN MoMo",
    amount: 350000,
    direction: "credit" as const,
  },
  {
    id: "pt_002",
    date: "19 Apr 2026",
    user: "James Okello",
    type: "Repayment",
    method: "Airtel Money",
    amount: 580000,
    direction: "credit" as const,
  },
  {
    id: "pt_003",
    date: "18 Apr 2026",
    user: "Grace Achieng",
    type: "Disbursement",
    method: "Bank Transfer",
    amount: 25000000,
    direction: "debit" as const,
  },
  {
    id: "pt_004",
    date: "17 Apr 2026",
    user: "Daniel Mugisha",
    type: "Top-up",
    method: "MTN MoMo",
    amount: 500000,
    direction: "credit" as const,
  },
  {
    id: "pt_005",
    date: "15 Apr 2026",
    user: "Sarah Nakato",
    type: "Disbursement",
    method: "Wallet",
    amount: 5000000,
    direction: "debit" as const,
  },
];

export default function AdminPaymentsPage() {
  const totalIn = transactions
    .filter((t) => t.direction === "credit")
    .reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions
    .filter((t) => t.direction === "debit")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
            Wallet & Payments
          </h1>
          <p className="text-sm text-muted-foreground">
            Platform-wide payment and wallet activity
          </p>
        </div>
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#E8F8F5] dark:bg-[#2BB5A0]/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-[#2BB5A0]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Total Platform Wallet
                </p>
                <p className="text-xl font-bold text-[#1B2B3A] dark:text-white">
                  {formatCurrency(245000000)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <ArrowDownRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Inflows</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalIn)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Total Disbursements
                </p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(totalOut)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
            Recent Transactions
          </h2>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground">
                  User
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden sm:table-cell">
                  Type
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden md:table-cell">
                  Method
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground text-right">
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
                  <TableCell className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                    {txn.user}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        txn.type === "Repayment"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                          : txn.type === "Disbursement"
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                            : "bg-[#F5F0E0] text-[#C4A55A] dark:bg-[#C4A55A]/10"
                      }`}
                    >
                      {txn.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm hidden md:table-cell text-muted-foreground">
                    {txn.method}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`text-sm font-semibold ${txn.direction === "credit" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {txn.direction === "credit" ? "+" : "-"}
                      {formatCurrency(txn.amount)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
