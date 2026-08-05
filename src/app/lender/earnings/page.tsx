"use client";

import { LenderPageHeader } from "@/components/lender-top-nav";
import { CardSkeleton } from "@/components/skeletons";
import { useLenderEarnings } from "@/hooks/use-lender";
import { formatCurrency } from "@/lib/format";

function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString("en-US", {
    month: "short",
  });
}

export default function LenderEarningsPage() {
  const { data: earnings, isLoading } = useLenderEarnings();

  if (isLoading) {
    return (
      <div className="max-w-6xl space-y-6">
        <LenderPageHeader title="Earnings Summary" />
        <CardSkeleton count={4} />
      </div>
    );
  }

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
    <div className="max-w-6xl space-y-6">
      <LenderPageHeader title="Earnings Summary" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-black text-[#1B2B3A]">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-gray-400">{stat.helper}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-[#1B2B3A]">
              Monthly Earnings
            </h2>
            <p className="text-xs text-gray-500">
              Interest revenue trend by month
            </p>
          </div>
          <span className="rounded-full border border-[#E8D9B0] bg-[#F5F0E0] px-3 py-1 text-xs font-semibold text-[#9F7F34]">
            Last 6 months
          </span>
        </div>

        {monthlyEarnings.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">
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
                  <span className="text-[10px] text-gray-400">
                    {(entry.amount / 1_000_000).toFixed(1)}M
                  </span>
                  <div
                    className="w-full rounded-t-md bg-[#C4A55A] transition-colors hover:bg-[#b3944a]"
                    style={{ height: `${Math.max(4, heightPct)}%` }}
                  />
                  <span className="text-[11px] font-medium text-gray-500">
                    {monthLabel(entry.month)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
