"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { useAdminLoans, useAdminStats } from "@/hooks/use-admin";
import { formatCurrency, formatRate } from "@/lib/format";
import { ExportMenu } from "@/components/export-menu";
import { CardSkeleton, TableSkeleton } from "@/components/skeletons";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { FadeSwap } from "@/components/motion/fade-swap";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";

type StatusTab = "all" | "active" | "overdue" | "completed" | "defaulted";
const TABS: { key: StatusTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "overdue", label: "Overdue" },
  { key: "completed", label: "Completed" },
  { key: "defaulted", label: "Defaulted" },
];

const PAGE_SIZE = 20;

export default function AdminLoansPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<StatusTab>("all");
  const debouncedSearch = useDebouncedValue(search, 400);
  const { data, isLoading } = useAdminLoans(page, PAGE_SIZE, {
    status: tab === "all" ? undefined : tab,
    search: debouncedSearch || undefined,
  });
  const { data: stats } = useAdminStats();

  const loans = data?.loans ?? [];
  const total = data?.total ?? 0;

  const statusColor = (s: string) => {
    switch (s) {
      case "active":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400";
      case "overdue":
        return "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400";
      case "completed":
        return "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
      case "defaulted":
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "";
    }
  };

  const exportRows = loans.map((l) => ({
    reference: l.reference,
    borrower: l.borrower_name ?? "",
    lender: l.lender_name ?? "",
    amount: l.amount,
    interest_rate: l.interest_rate,
    total_paid: l.total_paid,
    total_repayable: l.total_repayable,
    status: l.status,
    disbursed_at: l.disbursed_at ?? "",
  }));

  return (
    <FadeSwap
      loading={isLoading}
      skeleton={
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">Loans</h1>
          <CardSkeleton count={1} height="h-20" />
          <TableSkeleton rows={8} />
        </div>
      }
    >
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
            Loans
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor all active and past loans
          </p>
        </div>
        <ExportMenu filename="mpola-loans" title="Loans" rows={exportRows} />
      </div>

      {/* Summary */}
      <StaggerList className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StaggerItem>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Loans</p>
            <p className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
              {total}
            </p>
          </CardContent>
        </Card>
        </StaggerItem>
        <StaggerItem>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-[#2BB5A0]">
              {stats?.loans.active ?? 0}
            </p>
          </CardContent>
        </Card>
        </StaggerItem>
        <StaggerItem>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Disbursed</p>
            <p className="text-lg font-bold text-[#1B2B3A] dark:text-white">
              {formatCurrency(stats?.loans.total_volume ?? 0)}
            </p>
          </CardContent>
        </Card>
        </StaggerItem>
        <StaggerItem>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Avg. Rate</p>
            <p className="text-2xl font-bold text-[#C4A55A]">
              {formatRate(stats?.loans.avg_interest_rate ?? 0)}
            </p>
          </CardContent>
        </Card>
        </StaggerItem>
      </StaggerList>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setPage(1);
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              tab === t.key
                ? "bg-[#2BB5A0] border-[#2BB5A0] text-white"
                : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#2BB5A0]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search loans..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase text-muted-foreground">
                  Reference
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground">
                  Borrower
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden sm:table-cell">
                  Lender
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden md:table-cell">
                  Amount
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden md:table-cell">
                  Rate
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden lg:table-cell">
                  Progress
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No loans match your search.
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((loan) => {
                  // Amount-based, not instalment-count-based —
                  // paid_instalments only advances once a full instalment
                  // clears (see make_repayment in routers/loans.py), so a
                  // partial payment the borrower already made would
                  // otherwise show as 0% here even though total_paid
                  // reflects it.
                  const progress = loan.total_repayable
                    ? Math.round((loan.total_paid / loan.total_repayable) * 100)
                    : 0;
                  return (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium text-sm text-[#1B2B3A] dark:text-white">
                        #{loan.reference}
                      </TableCell>
                      <TableCell className="text-sm">
                        {loan.borrower_name ?? "Unknown"}
                      </TableCell>
                      <TableCell className="text-sm hidden sm:table-cell">
                        {loan.lender_name ?? "Unknown"}
                      </TableCell>
                      <TableCell className="text-sm hidden md:table-cell">
                        {formatCurrency(loan.amount)}
                      </TableCell>
                      <TableCell className="text-sm hidden md:table-cell">
                        {formatRate(loan.interest_rate)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={progress}
                            className="w-20 h-2 [&>div]:bg-[#2BB5A0]"
                          />
                          <span className="text-xs text-muted-foreground">
                            {progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusColor(loan.status)}`}
                        >
                          {loan.status}
                        </Badge>
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
