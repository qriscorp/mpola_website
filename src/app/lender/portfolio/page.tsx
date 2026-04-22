"use client";

import { useState } from "react";
import Link from "next/link";
import { LenderPageHeader } from "@/components/lender-top-nav";

type LoanStatus = "On Track" | "Overdue" | "Completed";

const loans: Array<{
  id: string;
  borrower: string;
  initials: string;
  amount: string;
  rate: string;
  paid: number;
  total: number;
  nextPayment: string;
  status: LoanStatus;
}> = [
  {
    id: "L1",
    borrower: "Agnes Kyomuhendo",
    initials: "AK",
    amount: "UGX 8M",
    rate: "5%/mo",
    paid: 1,
    total: 4,
    nextPayment: "Jun 1, 2024",
    status: "On Track",
  },
  {
    id: "L2",
    borrower: "Brian Tumwine",
    initials: "BT",
    amount: "UGX 3M",
    rate: "7%/mo",
    paid: 0,
    total: 2,
    nextPayment: "May 25, 2024",
    status: "Overdue",
  },
  {
    id: "L3",
    borrower: "Patience Nakato",
    initials: "PN",
    amount: "UGX 5M",
    rate: "6%/mo",
    paid: 3,
    total: 3,
    nextPayment: "—",
    status: "Completed",
  },
  {
    id: "L4",
    borrower: "James Okello",
    initials: "JO",
    amount: "UGX 10M",
    rate: "5%/mo",
    paid: 2,
    total: 6,
    nextPayment: "Jun 5, 2024",
    status: "On Track",
  },
  {
    id: "L5",
    borrower: "Christine Tumuheirwe",
    initials: "CT",
    amount: "UGX 5M",
    rate: "6%/mo",
    paid: 1,
    total: 2,
    nextPayment: "Jun 10, 2024",
    status: "Overdue",
  },
];

const tabs: Array<"All" | LoanStatus> = [
  "All",
  "On Track",
  "Overdue",
  "Completed",
];

export default function LenderPortfolioPage() {
  const [tab, setTab] = useState<"All" | LoanStatus>("All");
  const filtered =
    tab === "All" ? loans : loans.filter((l) => l.status === tab);

  const statBadge = (s: LoanStatus) => {
    if (s === "On Track")
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
          {s}
        </span>
      );
    if (s === "Overdue")
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
          {s}
        </span>
      );
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
        {s}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <LenderPageHeader title="Portfolio" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-[#C4A55A] p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Active Loans
          </p>
          <p className="text-3xl font-bold text-[#1B2B3A] dark:text-white mt-1">
            8
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-[#C4A55A] p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Outstanding
          </p>
          <p className="text-3xl font-bold text-[#1B2B3A] dark:text-white mt-1">
            UGX 42M
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-red-500 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Overdue
          </p>
          <p className="text-3xl font-bold text-red-600 mt-1">2</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              tab === t
                ? "bg-[#C4A55A] border-[#C4A55A] text-white"
                : "bg-white border-gray-300 text-gray-600 hover:border-[#C4A55A]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                Borrower
              </th>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider hidden sm:table-cell">
                Amount
              </th>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider hidden md:table-cell">
                Rate
              </th>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                Progress
              </th>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider hidden sm:table-cell">
                Next Payment
              </th>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                Status
              </th>
              <th className="w-16 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {filtered.map((loan) => (
              <tr key={loan.id}>
                <td className="px-4 py-3 font-semibold text-[#1B2B3A] dark:text-white">
                  {loan.borrower}
                </td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                  {loan.amount}
                </td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                  {loan.rate}
                </td>
                <td className="px-4 py-3 min-w-30">
                  <p className="text-xs text-gray-400 mb-1">
                    {loan.paid}/{loan.total} paid
                  </p>
                  <div className="h-1.5 w-24 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#C4A55A]"
                      style={{ width: `${(loan.paid / loan.total) * 100}%` }}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">
                  {loan.nextPayment}
                </td>
                <td className="px-4 py-3">{statBadge(loan.status)}</td>
                <td className="px-4 py-3">
                  <Link
                    href="/lender/loan-detail"
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#C4A55A] text-white font-semibold hover:bg-[#b3944a] transition-colors"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const portfolioLoans = [
  {
    borrower: "Sarah Nakato",
    amount: 8000000,
    rate: 16,
    paid: 3,
    total: 18,
    status: "Active",
  },
  {
    borrower: "James Okello",
    amount: 3500000,
    rate: 14,
    paid: 5,
    total: 12,
    status: "Active",
  },
  {
    borrower: "Brenda Achieng",
    amount: 12000000,
    rate: 15,
    paid: 0,
    total: 24,
    status: "Disbursing",
  },
  {
    borrower: "Ismail Ssemakadde",
    amount: 2000000,
    rate: 18,
    paid: 4,
    total: 6,
    status: "Active",
  },
  {
    borrower: "Christine Tumuheirwe",
    amount: 5500000,
    rate: 13,
    paid: 12,
    total: 18,
    status: "Active",
  },
];

export default function LenderPortfolioPage() {
  const { data: stats } = useLenderDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1B2B3A] dark:text-white">
          My Portfolio
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and monitor your active loans
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Deployed</p>
            <p className="text-xl font-bold text-[#1B2B3A] dark:text-white">
              {stats ? formatCurrency(stats.totalDeployed) : "UGX 0"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active Loans</p>
            <p className="text-xl font-bold text-[#2BB5A0]">
              {stats?.activeLoans ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Avg. Rate</p>
            <p className="text-xl font-bold text-[#C4A55A]">15.2%</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Repayment Rate</p>
            <p className="text-xl font-bold text-emerald-600">
              {stats?.repaymentRate ?? 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
            Active Loans
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolioLoans.map((loan) => (
              <div
                key={loan.borrower}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b last:border-0 dark:border-gray-800 gap-2"
              >
                <div>
                  <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                    {loan.borrower}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(loan.amount)} · {loan.rate}% · {loan.paid}/
                    {loan.total} paid
                  </p>
                </div>
                <Badge
                  className={`text-xs ${
                    loan.status === "Active"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                      : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  }`}
                >
                  {loan.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
