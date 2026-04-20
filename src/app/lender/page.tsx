"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  useLenderDashboardStats,
  useBorrowerActivities,
} from "@/hooks/use-lender";
import { formatCurrency } from "@/lib/format";

export default function LenderDashboardPage() {
  const { data: stats } = useLenderDashboardStats();
  const { data: activities = [] } = useBorrowerActivities();

  const statCards = [
    {
      label: "TOTAL DEPLOYED",
      value: stats
        ? `UGX ${(stats.totalDeployed / 1000000).toFixed(1)}M`
        : "UGX 0",
      sub: "▲ +8 loans this month",
      subColor: "text-[#2BB5A0]",
    },
    { label: "ACTIVE LOANS", value: stats?.activeLoans?.toString() ?? "0" },
    {
      label: "MONTHLY RETURNS",
      value: stats
        ? `UGX ${(stats.monthlyReturns / 1000000).toFixed(2)}M`
        : "UGX 0",
      sub: "▲ +12.4% vs. last month",
      subColor: "text-[#2BB5A0]",
    },
    {
      label: "REPAYMENT RATE",
      value: stats ? `${stats.repaymentRate}%` : "0%",
    },
  ];

  const statusColor = (s: string) => {
    switch (s) {
      case "New Application":
        return "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
      case "Reviewing":
        return "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400";
      case "Offer Sent":
        return "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400";
      case "Repaying":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400";
      case "Accepted":
        return "bg-[#E8F8F5] text-[#2BB5A0] dark:bg-[#2BB5A0]/10";
      default:
        return "";
    }
  };

  // simple bar data for Portfolio Health
  const barData = [68, 72, 80, 85, 90, 88];
  const barLabels = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1B2B3A] dark:text-white">
            Welcome back, David 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Thursday, 17 April 2026 · 3 new applications match your criteria
          </p>
        </div>
        <Link href="/lender/marketplace">
          <Button className="bg-[#2BB5A0] hover:bg-[#239E8C] text-white gap-2">
            Browse Borrowers <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="bg-white dark:bg-gray-900">
            <CardContent className="p-5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {s.label}
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-[#1B2B3A] dark:text-white mt-1">
                {s.value}
              </p>
              {s.sub && <p className={`text-xs mt-1 ${s.subColor}`}>{s.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid: Activity Table + Portfolio Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Borrower Activity Table */}
        <Card className="bg-white dark:bg-gray-900 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                Recent Borrower Activity
              </h2>
              <Link
                href="/lender/marketplace"
                className="text-sm text-[#2BB5A0] hover:underline"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] uppercase text-muted-foreground">
                    Borrower
                  </TableHead>
                  <TableHead className="text-[10px] uppercase text-muted-foreground hidden sm:table-cell">
                    Amount
                  </TableHead>
                  <TableHead className="text-[10px] uppercase text-muted-foreground hidden md:table-cell">
                    Type
                  </TableHead>
                  <TableHead className="text-[10px] uppercase text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-[#2BB5A0] text-white text-xs font-bold">
                            {a.borrowerInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                            {a.borrowerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {a.location} · Verified
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {formatCurrency(a.amount)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {a.loanType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${statusColor(a.status)}`}
                      >
                        ● {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/lender/marketplace/${a.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right Column: Portfolio Health + Matches */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-gray-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                  Portfolio Health
                </h2>
                <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 text-xs">
                  ● Healthy
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly returns (UGX millions)
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-32">
                {barData.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full rounded-t bg-[#2BB5A0]/80 dark:bg-[#2BB5A0]/60 hover:bg-[#2BB5A0] transition-colors"
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      {barLabels[i]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#E8F8F5] dark:bg-[#2BB5A0]/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-[#2BB5A0]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#1B2B3A] dark:text-white">
                    3 new matches
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    New borrower applications match your lending criteria
                    (Business loans, 5–15M, 12–24 months).
                  </p>
                  <Link href="/lender/marketplace">
                    <Button
                      size="sm"
                      className="mt-3 bg-[#1B2B3A] hover:bg-[#152230] text-white text-xs"
                    >
                      Review Matches
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
