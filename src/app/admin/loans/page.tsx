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
import { Search, Download, Eye } from "lucide-react";
import { useAdminLoans } from "@/hooks/use-admin";
import { formatCurrency } from "@/lib/format";

export default function AdminLoansPage() {
  const { data: loans = [], isLoading } = useAdminLoans();
  const [search, setSearch] = useState("");

  const filtered = loans.filter(
    (l) =>
      l.borrowerName.toLowerCase().includes(search.toLowerCase()) ||
      l.reference.toLowerCase().includes(search.toLowerCase()) ||
      l.lenderName.toLowerCase().includes(search.toLowerCase()),
  );

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

  const totalDisbursed = loans.reduce((sum, l) => sum + l.amount, 0);
  const avgRate =
    loans.length > 0
      ? (
          loans.reduce((sum, l) => sum + l.interestRate, 0) / loans.length
        ).toFixed(1)
      : "0";

  return (
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
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Loans</p>
            <p className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
              {loans.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-[#2BB5A0]">
              {loans.filter((l) => l.status === "active").length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Disbursed</p>
            <p className="text-lg font-bold text-[#1B2B3A] dark:text-white">
              {formatCurrency(totalDisbursed)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Avg. Rate</p>
            <p className="text-2xl font-bold text-[#C4A55A]">{avgRate}%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search loans..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="animate-pulse text-muted-foreground">
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((loan) => {
                  const progress = Math.round(
                    (loan.paidInstalments / loan.totalInstalments) * 100,
                  );
                  return (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium text-sm text-[#1B2B3A] dark:text-white">
                        {loan.reference}
                      </TableCell>
                      <TableCell className="text-sm">
                        {loan.borrowerName}
                      </TableCell>
                      <TableCell className="text-sm hidden sm:table-cell">
                        {loan.lenderName}
                      </TableCell>
                      <TableCell className="text-sm hidden md:table-cell">
                        {formatCurrency(loan.amount)}
                      </TableCell>
                      <TableCell className="text-sm hidden md:table-cell">
                        {loan.interestRate}%
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={progress}
                            className="w-20 h-2 [&>div]:bg-[#2BB5A0]"
                          />
                          <span className="text-xs text-muted-foreground">
                            {loan.paidInstalments}/{loan.totalInstalments}
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
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
