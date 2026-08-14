"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { TrendingUp, Smartphone, Landmark, HandCoins, ArrowLeftRight } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { useAdminRevenue } from "@/hooks/use-admin";
import { ExportMenu } from "@/components/export-menu";
import { CardSkeleton, TableSkeleton } from "@/components/skeletons";
import { FadeSwap } from "@/components/motion/fade-swap";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";

const PAGE_SIZE = 20;

const categoryLabel: Record<string, string> = {
  mobile_money_withdrawal: "Mobile Money Withdrawal",
  bank_withdrawal: "Bank Withdrawal",
  loan_disbursement: "Loan Disbursement",
  loan_repayment: "Loan Repayment",
};

const categoryIcon: Record<string, typeof Smartphone> = {
  mobile_money_withdrawal: Smartphone,
  bank_withdrawal: Landmark,
  loan_disbursement: HandCoins,
  loan_repayment: ArrowLeftRight,
};

const categoryColor: Record<string, string> = {
  mobile_money_withdrawal:
    "bg-[#F5F0E0] text-[#C4A55A] dark:bg-[#C4A55A]/10",
  bank_withdrawal: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  loan_disbursement: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  loan_repayment: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
};

export default function AdminRevenuePage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const { data, isLoading } = useAdminRevenue(page, PAGE_SIZE, category);

  const transactions = data?.transactions ?? [];

  const exportRows = transactions.map((t) => ({
    date: t.created_at,
    user: t.username ?? "",
    category: t.category,
    platform_fee: t.platform_fee,
  }));

  return (
    <FadeSwap
      loading={isLoading}
      skeleton={
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">Revenue</h1>
          <CardSkeleton count={3} height="h-24" />
          <CardSkeleton count={1} height="h-72" />
          <TableSkeleton rows={8} />
        </div>
      }
    >
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">Revenue</h1>
          <p className="text-sm text-muted-foreground">
            Platform fee income — the 0.5% Mpola keeps on withdrawals, loan
            disbursements, and loan repayments. Interswitch/Flutterwave
            surcharges are pass-through costs, not revenue, and aren&apos;t
            counted here.
          </p>
        </div>
        <ExportMenu filename="mpola-revenue" title="Revenue" rows={exportRows} />
      </div>

      {/* Summary */}
      <StaggerList className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StaggerItem>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#E8F8F5] dark:bg-[#2BB5A0]/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-[#2BB5A0]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold text-[#1B2B3A] dark:text-white">
                  {formatCurrency(data?.totals.revenue ?? 0)}
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
              <div className="h-10 w-10 rounded-lg bg-[#F5F0E0] dark:bg-[#C4A55A]/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-[#C4A55A]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Platform Fee Rate</p>
                <p className="text-xl font-bold text-[#1B2B3A] dark:text-white">
                  0.5%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </StaggerItem>
      </StaggerList>

      {/* Monthly trend + category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-white dark:bg-gray-900">
          <CardHeader>
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Revenue Trend (6 months)
            </h2>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthly_revenue ?? []}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2BB5A0" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2BB5A0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2BB5A0"
                  fill="url(#revenueFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">By Category</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.by_category ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No revenue yet.</p>
            )}
            {data?.by_category.map((c) => (
              <button
                key={c.category}
                onClick={() => {
                  setCategory(category === c.category ? undefined : c.category);
                  setPage(1);
                }}
                className={`w-full flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                  category === c.category
                    ? "border-[#2BB5A0] bg-[#E8F8F5] dark:bg-[#2BB5A0]/10"
                    : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = categoryIcon[c.category] ?? Smartphone;
                    return <Icon className="h-4 w-4 text-[#C4A55A]" />;
                  })()}
                  <div>
                    <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                      {categoryLabel[c.category] ?? c.category}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.count} transactions</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                  {formatCurrency(c.revenue)}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Transactions table */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="font-semibold text-[#1B2B3A] dark:text-white">Fee Transactions</h2>
          {category && (
            <Badge
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                setCategory(undefined);
                setPage(1);
              }}
            >
              {categoryLabel[category]} ✕
            </Badge>
          )}
        </CardHeader>
        <CardContent className="overflow-x-auto space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase text-muted-foreground">Date</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground">User</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden sm:table-cell">
                  Category
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground text-right">
                  Revenue
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No revenue transactions yet.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                      {tx.username ?? "Unknown"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className={`text-xs ${categoryColor[tx.category] ?? ""}`}>
                        {categoryLabel[tx.category] ?? tx.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-[#1B2B3A] dark:text-white">
                      {formatCurrency(tx.platform_fee)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <PaginationControls
            page={page}
            pageSize={PAGE_SIZE}
            total={data?.total ?? 0}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
    </FadeSwap>
  );
}
