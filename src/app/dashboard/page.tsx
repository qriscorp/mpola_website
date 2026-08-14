"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  useUser,
  useDashboardStats,
  useActiveLoan,
  useRecentNotifications,
} from "@/hooks/use-dashboard";
import { formatCurrency } from "@/lib/format";
import { DashboardSkeleton } from "@/components/skeletons";
import { BorrowerPageHeader } from "@/components/top-nav";
import { FadeSwap } from "@/components/motion/fade-swap";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activeLoan } = useActiveLoan();
  const { data: recentNotifications } = useRecentNotifications();

  const loading = userLoading || statsLoading;

  const loanBalance = activeLoan
    ? Math.max(activeLoan.total_repayable - activeLoan.total_paid, 0)
    : 0;
  const remainingInstalments = activeLoan
    ? Math.max(activeLoan.total_instalments - activeLoan.paid_instalments, 0)
    : 0;
  const repaidPct = activeLoan?.total_repayable
    ? Math.round((activeLoan.total_paid / activeLoan.total_repayable) * 100)
    : 0;

  return (
    <FadeSwap loading={loading} skeleton={<DashboardSkeleton />}>
    <div className="space-y-6">
      <BorrowerPageHeader title="Dashboard" />

      {/* Active Loan Hero Banner */}
      {activeLoan && (
        <div className="rounded-2xl bg-[#2BB5A0] p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Active Loan
            </p>
            <p className="text-4xl font-extrabold mt-1">
              UGX {activeLoan.amount.toLocaleString()}
            </p>
            {activeLoan.next_payment_amount && (
              <p className="text-sm text-white/80 mt-1">
                Next payment: {formatCurrency(activeLoan.next_payment_amount)}
                {activeLoan.next_payment_date &&
                  ` due ${new Date(activeLoan.next_payment_date).toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" })}`}
              </p>
            )}
          </div>
          <Link
            href={`/dashboard/repayments/pay?loanId=${activeLoan.id}`}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-white text-[#2BB5A0] font-bold text-sm hover:bg-white/90 transition-colors shrink-0"
          >
            Pay Now
          </Link>
        </div>
      )}

      {/* Stats Row */}
      <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-[#2BB5A0] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Loan Balance
          </p>
          <p className="text-3xl font-bold text-[#1B2B3A] dark:text-white mt-1">
            {formatCurrency(loanBalance)}
          </p>
          <p className="text-xs text-[#2BB5A0] mt-1">
            {activeLoan
              ? `${remainingInstalments} payment${remainingInstalments === 1 ? "" : "s"} remaining`
              : "No active loan"}
          </p>
        </StaggerItem>
        <StaggerItem className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-[#2BB5A0] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Total Repaid
          </p>
          <p className="text-3xl font-bold text-[#1B2B3A] dark:text-white mt-1">
            {formatCurrency(activeLoan?.total_paid ?? 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{repaidPct}% complete</p>
        </StaggerItem>
        <StaggerItem className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-[#2BB5A0] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Offers Received
          </p>
          <p className="text-3xl font-bold text-[#1B2B3A] dark:text-white mt-1">
            {stats?.newOffers ?? 0}
          </p>
          <Link
            href="/dashboard/my-requests"
            className="text-xs text-[#2BB5A0] hover:underline mt-1 block"
          >
            Review now →
          </Link>
        </StaggerItem>
        <StaggerItem className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-[#C4A55A] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Credit Score
          </p>
          <p className="text-3xl font-bold text-[#1B2B3A] dark:text-white mt-1">
            {user?.creditScore || "—"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Higher scores unlock better rates
          </p>
        </StaggerItem>
      </StaggerList>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-bold text-[#1B2B3A] dark:text-white mb-5">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard/offers-received"
              className="flex items-center justify-center py-4 px-3 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors text-center"
            >
              Offers Received
            </Link>
            <Link
              href="/dashboard/apply"
              className="flex items-center justify-center py-4 px-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-[#1B2B3A] dark:text-white text-sm font-semibold hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors text-center"
            >
              Apply for a Loan
            </Link>
            <Link
              href="/dashboard/my-requests"
              className="flex items-center justify-center py-4 px-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-[#1B2B3A] dark:text-white text-sm font-semibold hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors text-center"
            >
              My Requests
            </Link>
            <Link
              href="/dashboard/repayments"
              className="flex items-center justify-center py-4 px-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-[#1B2B3A] dark:text-white text-sm font-semibold hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors text-center"
            >
              Repayment
            </Link>
            <Link
              href="/dashboard/wallet"
              className="flex items-center justify-center py-4 px-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-[#1B2B3A] dark:text-white text-sm font-semibold hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors text-center"
            >
              My Wallet
            </Link>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-bold text-[#1B2B3A] dark:text-white mb-5">
            Recent Notifications
          </h2>
          <div className="space-y-4">
            {!recentNotifications || recentNotifications.length === 0 ? (
              <p className="text-sm text-gray-400">No notifications yet.</p>
            ) : (
              recentNotifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#2BB5A0]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[#2BB5A0] text-sm">•</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {n.message} —{" "}
                      {new Date(n.created_at).toLocaleDateString("en-UG", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link
            href="/dashboard/notifications"
            className="block text-center text-sm text-[#2BB5A0] font-medium hover:underline mt-5"
          >
            View all notifications
          </Link>
        </div>
      </div>
    </div>
    </FadeSwap>
  );
}
