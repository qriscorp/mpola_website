"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  useLenderEarnings,
  useLenderActiveLoans,
  useMarketplace,
} from "@/hooks/use-lender";
import { formatCurrency, formatRate, formatDuration, getInitials } from "@/lib/format";
import { CardSkeleton } from "@/components/skeletons";
import { LenderPageHeader } from "@/components/lender-top-nav";
import { FadeSwap } from "@/components/motion/fade-swap";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";

export default function LenderDashboardPage() {
  const { data: earnings, isLoading: earningsLoading } = useLenderEarnings();
  const { data: loans, isLoading: loansLoading } = useLenderActiveLoans();
  const { data: marketplace, isLoading: marketplaceLoading } =
    useMarketplace();

  const loading = earningsLoading || loansLoading || marketplaceLoading;

  const activeLoans = (loans ?? []).filter(
    (l) => l.status === "active" || l.status === "overdue",
  );
  const openApplications = marketplace?.applications ?? [];

  const statCards = [
    {
      label: "Total Deployed",
      value: formatCurrency(earnings?.total_deployed ?? 0),
    },
    {
      label: "Active Loans",
      value: String(earnings?.active_loans ?? 0),
    },
    {
      label: "Open Marketplace",
      value: String(openApplications.length),
      sub: "Applications you can offer on",
    },
    {
      label: "Total Earned",
      value: formatCurrency(earnings?.total_earned ?? 0),
    },
  ];

  return (
    <FadeSwap
      loading={loading}
      skeleton={
        <div className="space-y-6">
          <LenderPageHeader title="Dashboard" />
          <CardSkeleton count={4} />
        </div>
      }
    >
    <div className="space-y-6">
      <LenderPageHeader title="Dashboard" />

      {/* Stat cards */}
      <StaggerList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <StaggerItem
            key={s.label}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-[#C4A55A] p-5"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              {s.label}
            </p>
            <p className="text-2xl lg:text-3xl font-bold text-[#1B2B3A] dark:text-white mt-1">
              {s.value}
            </p>
            {s.sub && <p className="text-xs mt-1 text-gray-400">{s.sub}</p>}
          </StaggerItem>
        ))}
      </StaggerList>

      {/* Two-column main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Active Loans */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              My Active Loans
            </h2>
          </div>
          {activeLoans.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center text-sm text-gray-400">
              You don&apos;t have any active loans yet.
            </div>
          ) : (
            activeLoans.slice(0, 3).map((loan) => (
              <div
                key={loan.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
                      {formatCurrency(loan.amount)}
                    </p>
                    <p className="text-[#C4A55A] font-semibold text-sm mt-0.5">
                      {formatRate(loan.interest_rate)} ·{" "}
                      {formatDuration(loan.duration, loan.duration_days)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {loan.borrower_name ?? "Unknown borrower"}
                    </p>
                  </div>
                  <Badge
                    className={
                      loan.status === "overdue"
                        ? "self-center bg-red-50 text-red-600 border border-red-200 font-semibold text-xs dark:bg-red-900/20 dark:text-red-400 dark:border-red-900"
                        : "self-center bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold text-xs dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900"
                    }
                  >
                    {loan.status === "overdue" ? "Overdue" : "On Track"}
                  </Badge>
                </div>
              </div>
            ))
          )}
          <Link
            href="/lender/portfolio"
            className="flex items-center justify-center w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#C4A55A] hover:text-[#C4A55A] transition-colors"
          >
            View Full Portfolio →
          </Link>
        </div>

        {/* Open Marketplace Applications */}
        <div className="space-y-4">
          <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
            New Requests
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
            {openApplications.length === 0 ? (
              <p className="p-4 text-sm text-gray-400">
                No open requests right now.
              </p>
            ) : (
              openApplications.slice(0, 3).map((a) => (
                <div key={a.id} className="p-4 flex items-center gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-[#1B2B3A] text-white text-xs font-bold">
                      {getInitials(a.borrower?.full_name ?? "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white truncate">
                      {a.borrower?.full_name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {a.loan_type} · {formatDuration(a.duration, a.duration_days)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-[#1B2B3A] dark:text-white">
                      {formatCurrency(a.amount)}
                    </p>
                  </div>
                  <Link
                    href={`/lender/marketplace/${a.id}`}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-[#C4A55A] text-white text-xs font-semibold hover:bg-[#b3944a] transition-colors"
                  >
                    Review
                  </Link>
                </div>
              ))
            )}
          </div>
          <Link
            href="/lender/marketplace"
            className="flex items-center justify-center w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#C4A55A] hover:text-[#C4A55A] transition-colors"
          >
            Browse Marketplace →
          </Link>
        </div>
      </div>
    </div>
    </FadeSwap>
  );
}
