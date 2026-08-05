"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  useUser,
  useDashboardStats,
  useActiveLoan,
} from "@/hooks/use-dashboard";
import { formatCurrency } from "@/lib/format";
import { DashboardSkeleton } from "@/components/skeletons";
import { BorrowerPageHeader } from "@/components/top-nav";

export default function DashboardPage() {
  const { isLoading: userLoading } = useUser();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activeLoan } = useActiveLoan();

  if (userLoading || statsLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 max-w-300">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-[#2BB5A0] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Loan Balance
          </p>
          <p className="text-3xl font-bold text-[#1B2B3A] dark:text-white mt-1">
            UGX 4.8M
          </p>
          <p className="text-xs text-[#2BB5A0] mt-1">2 payments remaining</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-[#2BB5A0] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Total Repaid
          </p>
          <p className="text-3xl font-bold text-[#1B2B3A] dark:text-white mt-1">
            UGX 4.8M
          </p>
          <p className="text-xs text-gray-400 mt-1">50% complete</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-[#2BB5A0] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Lender Offers Available
          </p>
          <p className="text-3xl font-bold text-[#1B2B3A] dark:text-white mt-1">
            {stats?.newOffers ?? 47}
          </p>
          <Link
            href="/dashboard/offers"
            className="text-xs text-[#2BB5A0] hover:underline mt-1 block"
          >
            Browse now →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-bold text-[#1B2B3A] dark:text-white mb-5">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard/offers"
              className="flex items-center justify-center py-4 px-3 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors text-center"
            >
              Browse Offers
            </Link>
            <Link
              href="/dashboard/post-request"
              className="flex items-center justify-center py-4 px-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-[#1B2B3A] dark:text-white text-sm font-semibold hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors text-center"
            >
              Post a Request
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
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2BB5A0]/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[#2BB5A0] text-sm">↗</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                  New offer on your request
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  James M. offered UGX 8M at 5%/mo — 2hr ago
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2BB5A0]/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[#2BB5A0] text-sm">✓</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                  Payment confirmed
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  UGX 2,400,000 received — 2 days ago
                </p>
              </div>
            </div>
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
  );
}
