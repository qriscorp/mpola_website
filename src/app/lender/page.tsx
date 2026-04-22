"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  useLenderDashboardStats,
  useBorrowerActivities,
} from "@/hooks/use-lender";
import { formatCurrency } from "@/lib/format";
import { LenderPageHeader } from "@/components/lender-top-nav";

const mockOffers = [
  {
    id: "LF-2024-001",
    amount: "UGX 50M",
    rate: "5%/mo",
    maxDuration: "Max 6 months",
    types: ["Business", "Personal", "Emergency"],
    applied: 12,
    approved: 3,
    status: "Active",
  },
  {
    id: "LF-2024-002",
    amount: "UGX 20M",
    rate: "7%/mo",
    maxDuration: "Max 3 months",
    types: ["Personal", "Emergency"],
    applied: 9,
    approved: 2,
    status: "Active",
  },
];

export default function LenderDashboardPage() {
  const { data: stats } = useLenderDashboardStats();
  const { data: activities = [] } = useBorrowerActivities();

  const statCards = [
    {
      label: "Total Deployed",
      value: stats
        ? `UGX ${(stats.totalDeployed / 1_000_000).toFixed(0)}M`
        : "UGX 48M",
      sub: "↑ 12% this month",
      subColor: "text-emerald-500",
    },
    {
      label: "Active Offers",
      value: stats?.activeLoans?.toString() ?? "3",
      sub: "28 total applicants",
      subColor: "text-gray-400",
    },
    {
      label: "Pending Applications",
      value: "7",
      sub: "Awaiting review",
      subColor: "text-amber-500",
    },
    {
      label: "Total Earned",
      value: stats
        ? `UGX ${(stats.monthlyReturns / 1_000_000).toFixed(1)}M`
        : "UGX 6.2M",
      sub: "↑ 18% vs last month",
      subColor: "text-emerald-500",
    },
  ];

  return (
    <div className="space-y-6">
      <LenderPageHeader title="Dashboard" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-[#C4A55A] p-5"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              {s.label}
            </p>
            <p className="text-2xl lg:text-3xl font-bold text-[#1B2B3A] dark:text-white mt-1">
              {s.value}
            </p>
            {s.sub && <p className={`text-xs mt-1 ${s.subColor}`}>{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Two-column main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Active Offers */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              My Active Offers
            </h2>
          </div>
          {mockOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
                    {offer.amount}
                  </p>
                  <p className="text-[#C4A55A] font-semibold text-sm mt-0.5">
                    {offer.rate} · {offer.maxDuration}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {offer.types.join(" · ")}
                  </p>
                </div>
                <div className="flex gap-6 sm:gap-8 shrink-0">
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#1B2B3A] dark:text-white">
                      {offer.applied}
                    </p>
                    <p className="text-[11px] text-gray-400">Apps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#1B2B3A] dark:text-white">
                      {offer.approved}
                    </p>
                    <p className="text-[11px] text-gray-400">Approved</p>
                  </div>
                  <Badge className="self-center bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold text-xs">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          ))}
          <Link
            href="/lender/offers"
            className="flex items-center justify-center w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#C4A55A] hover:text-[#C4A55A] transition-colors"
          >
            View All Offers →
          </Link>
        </div>

        {/* Recent Applications */}
        <div className="space-y-4">
          <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
            Recent Applications
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
            {activities.slice(0, 3).map((a, i) => (
              <div key={a.id ?? i} className="p-4 flex items-center gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-[#1B2B3A] text-white text-xs font-bold">
                    {a.borrowerInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white truncate">
                    {a.borrowerName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {a.loanType} · #LF-001
                  </p>
                  <div className="w-16 h-1 rounded-full bg-[#C4A55A] mt-1 opacity-60" />
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-[#1B2B3A] dark:text-white">
                    {formatCurrency(a.amount)}
                  </p>
                  <p className="text-xs text-gray-400">2 mo</p>
                </div>
                <Link
                  href="/lender/applicant"
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-[#C4A55A] text-white text-xs font-semibold hover:bg-[#b3944a] transition-colors"
                >
                  Review
                </Link>
              </div>
            ))}
            {activities.length === 0 && (
              <>
                {[
                  {
                    initials: "AK",
                    name: "Agnes Kyomuhendo",
                    type: "Business",
                    amount: "UGX 8M",
                    offer: "#LF-001",
                  },
                  {
                    initials: "BT",
                    name: "Brian Tumwine",
                    type: "Personal",
                    amount: "UGX 3M",
                    offer: "#LF-001",
                  },
                ].map((row) => (
                  <div
                    key={row.initials}
                    className="p-4 flex items-center gap-3"
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-[#1B2B3A] text-white text-xs font-bold">
                        {row.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white truncate">
                        {row.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {row.type} · {row.offer}
                      </p>
                      <div className="w-16 h-1 rounded-full bg-[#C4A55A] mt-1 opacity-60" />
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-[#1B2B3A] dark:text-white">
                        {row.amount}
                      </p>
                      <p className="text-xs text-gray-400">2 mo</p>
                    </div>
                    <Link
                      href="/lender/applicant"
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-[#C4A55A] text-white text-xs font-semibold hover:bg-[#b3944a] transition-colors"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </>
            )}
          </div>
          <Link
            href="/lender/applications"
            className="flex items-center justify-center w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#C4A55A] hover:text-[#C4A55A] transition-colors"
          >
            View All Applications →
          </Link>
        </div>
      </div>
    </div>
  );
}

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
