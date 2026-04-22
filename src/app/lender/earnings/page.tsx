"use client";

import { LenderPageHeader } from "@/components/lender-top-nav";
import { useLenderEarnings } from "@/hooks/use-lender";
import { formatCurrency } from "@/lib/format";

const byType = [
  { type: "Business", amount: 3100000, pct: 50 },
  { type: "Personal", amount: 1800000, pct: 29 },
  { type: "Emergency", amount: 800000, pct: 13 },
  { type: "Agricultural", amount: 500000, pct: 8 },
];

export default function LenderEarningsPage() {
  const { data: earnings } = useLenderEarnings();
  const monthlyData = earnings?.monthlyData ?? [
    { month: "Jan", amount: 800000 },
    { month: "Feb", amount: 900000 },
    { month: "Mar", amount: 1100000 },
    { month: "Apr", amount: 1200000 },
    { month: "May", amount: 1400000 },
    { month: "Jun", amount: 800000 },
  ];
  const maxVal = Math.max(...monthlyData.map((entry) => entry.amount), 1);

  const stats = [
    {
      label: "Total Earned",
      value: earnings
        ? formatCurrency(earnings.totalEarnings)
        : "UGX 6,200,000",
      helper: "Since joining",
    },
    {
      label: "This Month",
      value: earnings ? formatCurrency(earnings.thisMonth) : "UGX 1,400,000",
      helper: "Up 18% vs last month",
      helperAccent: true,
    },
    {
      label: "Average Yield",
      value: `${earnings?.avgYield ?? 5.8}%`,
      helper: "Per active loan",
    },
    {
      label: "Loans Repaid",
      value: "14",
      helper: "100% recovery",
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
            <p
              className={`mt-1 text-xs ${stat.helperAccent ? "text-emerald-600" : "text-gray-400"}`}
            >
              {stat.helper}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_1fr]">
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

          <div className="flex h-56 items-end gap-2 sm:gap-3">
            {monthlyData.map((entry) => {
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
                    style={{ height: `${Math.max(14, heightPct)}%` }}
                  />
                  <span className="text-[11px] font-medium text-gray-500">
                    {entry.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
          <h2 className="text-xl font-black text-[#1B2B3A]">
            Earnings by Loan Type
          </h2>
          <p className="mb-5 text-xs text-gray-500">
            Distribution by funded category
          </p>

          <div className="space-y-4">
            {byType.map((item) => (
              <div key={item.type}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#1B2B3A]">
                    {item.type}
                  </span>
                  <span className="font-semibold text-gray-500">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#C4A55A]"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
