"use client";

import Link from "next/link";
import {
  Plus,
  FileText,
  CreditCard,
  Sparkles,
  Upload,
  ArrowRight,
  TriangleAlert,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useUser,
  useDashboardStats,
  useActiveLoan,
  useApplications,
} from "@/hooks/use-dashboard";
import { formatCurrency, getStatusColor, getStatusLabel } from "@/lib/format";
import { DashboardSkeleton } from "@/components/skeletons";

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activeLoan } = useActiveLoan();
  const { data: applications } = useApplications();

  if (userLoading || statsLoading) return <DashboardSkeleton />;

  const loanProgress = activeLoan
    ? Math.round(
        (activeLoan.paidInstalments / activeLoan.totalInstalments) * 100,
      )
    : 0;

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1B2B3A] dark:text-white">
            Hi {user?.fullName?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Thursday, 17 April 2026 · You have {stats?.newOffers || 0} new
            offers waiting for review
          </p>
        </div>
        <Link href="/dashboard/apply">
          <Button className="bg-white dark:bg-gray-800 text-[#1B2B3A] dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> New Loan Application
          </Button>
        </Link>
      </div>

      {/* Active Loan Card */}
      {activeLoan && (
        <Card className="border-l-4 border-l-[#2BB5A0] bg-white dark:bg-gray-900">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#2BB5A0] mb-1">
                  Active Loan
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-[#1B2B3A] dark:text-white">
                  <span className="text-sm font-normal text-gray-400 mr-1">
                    UGX
                  </span>
                  {activeLoan.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Lent by{" "}
                  <span className="font-semibold text-[#1B2B3A] dark:text-white">
                    {activeLoan.lenderName}
                  </span>{" "}
                  · {activeLoan.interestRate}% p.a.
                </p>
              </div>
              <div className="lg:text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activeLoan.paidInstalments} of {activeLoan.totalInstalments}{" "}
                  payments made
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Progress
                    value={loanProgress}
                    className="w-full sm:w-40 h-2 [&>div]:bg-[#2BB5A0]"
                  />
                  <span className="text-sm font-semibold text-[#2BB5A0]">
                    {loanProgress}%
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Next payment:{" "}
                  <span className="font-medium text-[#1B2B3A] dark:text-white">
                    {formatCurrency(activeLoan.nextPaymentAmount)}
                  </span>{" "}
                  due{" "}
                  <span className="font-medium text-[#1B2B3A] dark:text-white">
                    May 1, 2026
                  </span>
                </p>
              </div>
              <Link href="/dashboard/repayments/pay" className="lg:ml-2">
                <Button className="bg-[#2BB5A0] text-white hover:bg-[#239E8C] w-full lg:w-auto">
                  Make Payment
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Active Loans
            </p>
            <p className="text-3xl font-bold text-[#1B2B3A] dark:text-white">
              {stats?.activeLoans ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Applications Pending
            </p>
            <p className="text-3xl font-bold text-[#1B2B3A] dark:text-white">
              {stats?.applicationsPending ?? 0}
            </p>
            {stats && stats.newOffers > 0 && (
              <p className="text-xs text-[#2BB5A0] font-medium mt-2 flex items-center gap-1">
                <TriangleAlert className="w-3 h-3" /> {stats.newOffers} new
                offers
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Wallet Balance
            </p>
            <p className="text-3xl font-bold text-[#1B2B3A] dark:text-white">
              <span className="text-sm font-normal text-gray-400 mr-1">
                UGX
              </span>
              {(stats?.walletBalance ?? 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications Table */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1B2B3A] dark:text-white">
              My Applications
            </h2>
            <Link
              href="/dashboard/status"
              className="text-sm text-[#2BB5A0] font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          <Card className="bg-white dark:bg-gray-900 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    Reference
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    Amount
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 hidden sm:table-cell">
                    Type
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 hidden sm:table-cell">
                    Offers
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    Status
                  </TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications?.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium text-sm text-[#1B2B3A] dark:text-white">
                      {app.reference}
                    </TableCell>
                    <TableCell className="text-sm dark:text-gray-300">
                      <span className="text-[10px] text-gray-400">UGX</span>{" "}
                      {app.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${
                          app.loanType === "business"
                            ? "bg-[#E8F8F5] text-[#2BB5A0] border-[#2BB5A0]/20 dark:bg-[#2BB5A0]/10"
                            : "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400"
                        }`}
                      >
                        {app.loanType === "business" ? "Business" : "Personal"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm hidden sm:table-cell">
                      {app.offersCount > 0 ? (
                        <span className="text-[#2BB5A0] font-semibold">
                          {app.offersCount} received
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs font-medium ${getStatusColor(app.status)}`}
                      >
                        {app.status === "reviewing_offers" && (
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5 inline-block" />
                        )}
                        {app.status === "active" && (
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 inline-block" />
                        )}
                        {app.status === "completed" && (
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5 inline-block" />
                        )}
                        {getStatusLabel(app.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {app.status === "reviewing_offers" ? (
                        <Link
                          href="/dashboard/offers"
                          className="text-sm text-[#1B2B3A] dark:text-white font-medium inline-flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          View Offers <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : app.status === "active" ? (
                        <Link
                          href="/dashboard/repayments"
                          className="text-sm text-[#1B2B3A] dark:text-white font-medium border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          Schedule
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 inline-block">
                          Details
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-[#1B2B3A] dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            {[
              {
                icon: Plus,
                title: "New Application",
                desc: "Start a new loan request in 5 steps",
                href: "/dashboard/apply",
              },
              {
                icon: CreditCard,
                title: "Make a Payment",
                desc: "Pay current instalment or top-up",
                href: "/dashboard/repayments/pay",
              },
              {
                icon: Sparkles,
                title: "Review Offers",
                desc: "3 offers awaiting decision · expires in 6d",
                href: "/dashboard/offers",
              },
              {
                icon: Upload,
                title: "Update Documents",
                desc: "Keep KYC and payslips current",
                href: "/dashboard/profile",
              },
            ].map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="bg-white dark:bg-gray-900 hover:shadow-md transition-shadow cursor-pointer mb-3">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <action.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                        {action.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {action.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
