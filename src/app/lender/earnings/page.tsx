"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Percent } from "lucide-react";
import { useLenderEarnings } from "@/hooks/use-lender";
import { formatCurrency } from "@/lib/format";

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
