"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { useLenderDashboardStats } from "@/hooks/use-lender";

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
