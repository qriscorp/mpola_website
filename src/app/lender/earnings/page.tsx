"use client";

import { useLenderEarnings } from "@/hooks/use-lender";
import { formatCurrency } from "@/lib/format";
import { LenderPageHeader } from "@/components/lender-top-nav";

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
  const maxVal = Math.max(...monthlyData.map((d) => d.amount), 1);

  return (
    <div className="space-y-6 max-w-5xl">
      <LenderPageHeader title="Earnings" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Earned",
            value: earnings
              ? formatCurrency(earnings.totalEarnings)
              : "UGX 6.2M",
            sub: "Since joining",
          },
          {
            label: "This Month",
            value: earnings ? formatCurrency(earnings.thisMonth) : "UGX 1.4M",
            sub: "↑ 18% vs last month",
            subGreen: true,
          },
          {
            label: "Avg Return",
            value: `${earnings?.avgYield ?? 5.8}%`,
            sub: "per loan",
          },
          { label: "Loans Repaid", value: "14", sub: "100% recovery" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-[#C4A55A] p-5"
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {s.label}
            </p>
            <p className="text-2xl lg:text-3xl font-bold text-[#1B2B3A] dark:text-white mt-1">
              {s.value}
            </p>
            {s.sub && (
              <p
                className={`text-xs mt-1 ${s.subGreen ? "text-emerald-500" : "text-gray-400"}`}
              >
                {s.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
          <h3 className="font-semibold text-[#1B2B3A] dark:text-white">
            Monthly Earnings
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Interest revenue per month (UGX)
          </p>
          <div className="flex items-end gap-3 h-40 mt-4">
            {monthlyData.map((d, i) => {
              const pct = (d.amount / maxVal) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-[10px] text-gray-400 text-center leading-tight">
                    {(d.amount / 1_000_000).toFixed(1)}M
                  </span>
                  <div
                    className="w-full rounded-t bg-[#C4A55A] hover:bg-[#b3944a] transition-colors"
                    style={{ height: `${pct}%` }}
                  />
                  <span className="text-[10px] text-gray-400">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* By loan type */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
          <h3 className="font-semibold text-[#1B2B3A] dark:text-white mb-4">
            Earnings By Loan Type
          </h3>
          <div className="space-y-4">
            {byType.map((t) => (
              <div key={t.type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#1B2B3A] dark:text-white font-medium">
                    {t.type}
                  </span>
                  <span className="text-gray-500">
                    {formatCurrency(t.amount)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#C4A55A]"
                    style={{ width: `${t.pct}%` }}
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

export default function LenderEarningsPage() {
  const { data: earnings } = useLenderEarnings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1B2B3A] dark:text-white">
          Earnings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your lending returns and yield
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#E8F8F5] dark:bg-[#2BB5A0]/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-[#2BB5A0]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Earnings</p>
                <p className="text-xl font-bold text-[#1B2B3A] dark:text-white">
                  {earnings ? formatCurrency(earnings.totalEarnings) : "UGX 0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#F5F0E0] dark:bg-[#C4A55A]/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-[#C4A55A]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="text-xl font-bold text-[#C4A55A]">
                  {earnings ? formatCurrency(earnings.thisMonth) : "UGX 0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Percent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg. Yield</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {earnings?.avgYield ?? 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Chart */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
            Monthly Returns
          </h2>
          <p className="text-xs text-muted-foreground">
            Interest revenue over the last 6 months
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-48">
            {earnings?.monthlyData.map((d, i) => {
              const maxVal = Math.max(
                ...(earnings?.monthlyData.map((m) => m.amount) ?? [1]),
              );
              const pct = (d.amount / maxVal) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(d.amount)}
                  </span>
                  <div
                    className="w-full rounded-t bg-[#2BB5A0]/80 dark:bg-[#2BB5A0]/60 hover:bg-[#2BB5A0] transition-colors"
                    style={{ height: `${pct}%` }}
                  />
                  <span className="text-xs text-muted-foreground font-medium">
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
