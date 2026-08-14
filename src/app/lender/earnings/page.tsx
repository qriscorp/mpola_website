"use client";

import { LenderPageHeader } from "@/components/lender-top-nav";
import { CardSkeleton } from "@/components/skeletons";
import { useLenderEarnings } from "@/hooks/use-lender";
import { formatCurrency } from "@/lib/format";
import { FadeSwap } from "@/components/motion/fade-swap";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";

function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString("en-US", {
    month: "short",
  });
}

export default function LenderEarningsPage() {
  const { data: earnings, isLoading } = useLenderEarnings();

  const monthlyEarnings = earnings?.monthly_earnings ?? [];
  const maxVal = Math.max(...monthlyEarnings.map((entry) => entry.amount), 1);

  const stats = [
    {
      label: "Total Earned",
      value: formatCurrency(earnings?.total_earned ?? 0),
      helper: "Since joining",
    },
    {
      label: "This Month",
      value: formatCurrency(earnings?.this_month_earned ?? 0),
      helper: "Interest earned this month",
    },
    {
      label: "Average Yield",
      value: `${(earnings?.avg_yield ?? 0).toFixed(1)}%`,
      helper: "Per active loan",
    },
    {
      label: "Active Loans",
      value: String(earnings?.active_loans ?? 0),
      helper: `${formatCurrency(earnings?.total_deployed ?? 0)} deployed`,
    },
  ];

  return (
    <FadeSwap
      loading={isLoading}
      skeleton={
        <div className="space-y-6">
          <LenderPageHeader title="Earnings Summary" />
          <CardSkeleton count={4} />
        </div>
      }
    >
    <div className="space-y-6">
      <LenderPageHeader title="Earnings Summary" />

      {earnings?.concentration_warning && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20">
          <span className="font-semibold">{earnings.concentration_warning.pct}%</span> of your
          active lending is concentrated in{" "}
          {earnings.concentration_warning.type === "borrower"
            ? `one borrower (${earnings.concentration_warning.label})`
            : `one loan type (${earnings.concentration_warning.label})`}
          {" "}— consider diversifying to spread your risk.
        </div>
      )}

      <StaggerList className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StaggerItem
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-black text-[#1B2B3A] dark:text-white">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{stat.helper}</p>
          </StaggerItem>
        ))}
      </StaggerList>

      <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-[#1B2B3A] dark:text-white">
              Monthly Earnings
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Interest revenue trend by month
            </p>
          </div>
          <span className="rounded-full border border-[#E8D9B0] bg-[#F5F0E0] px-3 py-1 text-xs font-semibold text-[#9F7F34] dark:bg-[#C4A55A]/15">
            Last 6 months
          </span>
        </div>

        {monthlyEarnings.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
            No earnings recorded yet.
          </p>
        ) : (
          <div className="flex h-56 items-end gap-2 sm:gap-3">
            {monthlyEarnings.map((entry) => {
              const heightPct = (entry.amount / maxVal) * 100;
              return (
                <div
                  key={entry.month}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {(entry.amount / 1_000_000).toFixed(1)}M
                  </span>
                  <div
                    className="w-full rounded-t-md bg-[#C4A55A] transition-colors hover:bg-[#b3944a]"
                    style={{ height: `${Math.max(4, heightPct)}%` }}
                  />
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    {monthLabel(entry.month)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </FadeSwap>
  );
}
