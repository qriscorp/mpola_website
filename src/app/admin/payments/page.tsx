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
import { useState } from "react";
import { useAdminPayments, useAdminStats } from "@/hooks/use-admin";
import { downloadCsv } from "@/lib/csv";
import { CardSkeleton, TableSkeleton } from "@/components/skeletons";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { FadeSwap } from "@/components/motion/fade-swap";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";

const PAGE_SIZE = 20;

const typeLabel: Record<string, string> = {
  deposit: "Deposit",
  repayment: "Repayment",
  withdrawal: "Withdrawal",
  disbursement: "Disbursement",
  top_up: "Top-up",
};

const typeColor: Record<string, string> = {
  repayment: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  deposit: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  top_up: "bg-[#F5F0E0] text-[#C4A55A] dark:bg-[#C4A55A]/10",
  disbursement: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  withdrawal: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
};

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminPayments(page, PAGE_SIZE);
  const { data: stats } = useAdminStats();
  const transactions = data?.transactions ?? [];
  const total = data?.total ?? 0;

  const handleExport = () => {
    downloadCsv(
      "mpola-payments.csv",
      transactions.map((t) => ({
        date: t.created_at,
        user: t.username ?? "",
        type: t.type,
        status: t.status,
        amount: t.amount,
      })),
    );
  };

  return (
    <FadeSwap
      loading={isLoading}
      skeleton={
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">Wallet & Payments</h1>
          <CardSkeleton count={1} height="h-24" />
          <TableSkeleton rows={8} />
        </div>
      }
    >
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
        <Button
          variant="outline"
          className="gap-2 w-full sm:w-auto"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Summary */}
      <StaggerList className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StaggerItem>
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
                  {formatCurrency(stats?.platform.total_wallet_balance ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </StaggerItem>
        <StaggerItem>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <ArrowDownRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Inflows</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(data?.totals.in ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </StaggerItem>
        <StaggerItem>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Total Outflows
                </p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(data?.totals.out ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </StaggerItem>
      </StaggerList>

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
                  Status
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground text-right">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No transactions yet.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((txn) => {
                  const isInflow = txn.direction === "credit";
                  return (
                    <TableRow key={txn.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(txn.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                        {txn.username ?? "Unknown"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant="outline"
                          className={`text-xs ${typeColor[txn.type] ?? ""}`}
                        >
                          {typeLabel[txn.type] ?? txn.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm hidden md:table-cell text-muted-foreground capitalize">
                        {txn.status}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`text-sm font-semibold ${isInflow ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {isInflow ? "+" : "-"}
                          {formatCurrency(txn.amount)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <PaginationControls
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
    </FadeSwap>
  );
}
