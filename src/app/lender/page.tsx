"use client";

import Link from "next/link";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  useLenderDashboardStats,
  useBorrowerActivities,
} from "@/hooks/use-lender";
import { formatCurrency } from "@/lib/format";
import { LenderPageHeader } from "@/components/lender-top-nav";

export default function LenderDashboardPage() {
  const { data: stats } = useLenderDashboardStats();
  const { data: activities = [] } = useBorrowerActivities();

  const statCards = [
    {
      label: "Total Deployed",
      value: stats
        ? `UGX ${(stats.totalDeployed / 1_000_000).toFixed(1)}M`
        : "—",
      sub: "↑ +8 loans this month",
      subColor: "text-emerald-500",
      borderColor: "border-t-[#C4A55A]",
    },
    {
      label: "Active Loans",
      value: stats?.activeLoans?.toString() ?? "—",
      borderColor: "border-t-[#C4A55A]",
    },
    {
      label: "Monthly Returns",
      value: stats
        ? `UGX ${(stats.monthlyReturns / 1_000_000).toFixed(2)}M`
        : "—",
      sub: "↑ +12.4% vs last month",
      subColor: "text-emerald-500",
      borderColor: "border-t-[#C4A55A]",
    },
    {
      label: "Repayment Rate",
      value: stats ? `${stats.repaymentRate}%` : "—",
      borderColor: "border-t-[#C4A55A]",
    },
  ];

  const barData = [68, 72, 80, 85, 90, 88];
  const barLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  return (
    <div className="space-y-6">
      <LenderPageHeader title="Dashboard" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card
            key={s.label}
            className={`bg-white dark:bg-gray-900 border-t-4 ${s.borderColor}`}
          >
            <CardContent className="p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
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

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Borrower Activity */}
        <Card className="bg-white dark:bg-gray-900 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                Recent Borrower Activity
              </h2>
              <Link
                href="/lender/applications"
                className="text-sm text-[#C4A55A] hover:underline"
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
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-[#1B2B3A] text-white text-xs font-bold">
                            {a.borrowerInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                            {a.borrowerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {a.location}
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
                        className={`text-xs ${
                          a.status === "Repaying"
                            ? "bg-emerald-50 text-emerald-600"
                            : a.status === "New Application"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href="/lender/applicant"
                        className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:border-[#C4A55A] hover:text-[#C4A55A] transition-colors"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          {/* Portfolio Health chart */}
          <Card className="bg-white dark:bg-gray-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                  Portfolio Health
                </h2>
                <Badge className="bg-emerald-50 text-emerald-600 text-xs border-0">
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
                      className="w-full rounded-t bg-[#C4A55A] hover:bg-[#b3944a] transition-colors"
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

          {/* New matches */}
          <Card className="bg-white dark:bg-gray-900 border-l-4 border-l-[#C4A55A]">
            <CardContent className="p-5">
              <p className="font-semibold text-sm text-[#1B2B3A] dark:text-white">
                7 new applications
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Borrowers have applied to your active offers. Review and
                approve.
              </p>
              <Link
                href="/lender/applications"
                className="inline-flex mt-3 px-3 py-1.5 rounded-lg bg-[#C4A55A] text-white text-xs font-semibold hover:bg-[#b3944a] transition-colors"
              >
                Review Applications
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
