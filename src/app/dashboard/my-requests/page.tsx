"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BorrowerPageHeader } from "@/components/top-nav";
import { useApplications } from "@/hooks/use-dashboard";
import { formatCurrency, getStatusColor, getStatusLabel } from "@/lib/format";
import { TableSkeleton } from "@/components/skeletons";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";

const tabs = ["All", "Pending", "Funded", "Closed"] as const;
type Tab = (typeof tabs)[number];

export default function MyRequestsPage() {
  const { data: applications, isLoading } = useApplications();
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const filtered = useMemo(() => {
    if (!applications) return [];
    if (activeTab === "All") return applications;
    if (activeTab === "Pending")
      return applications.filter((a) => a.status === "pending");
    if (activeTab === "Funded")
      return applications.filter((a) => a.status === "funded");
    return applications.filter((a) =>
      ["completed", "rejected", "defaulted"].includes(a.status),
    );
  }, [applications, activeTab]);

  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="My Requests" />

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeTab === tab
                ? "bg-[#2BB5A0] text-white border-[#2BB5A0]"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-[#2BB5A0] hover:text-[#2BB5A0]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton rows={3} />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          No loan requests here yet.
        </div>
      ) : (
        <StaggerList className="space-y-4">
          {filtered.map((app) => (
            <StaggerItem
              key={app.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl sm:text-3xl leading-none font-black text-[#1B2B3A]">
                    {formatCurrency(app.amount)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}
                  >
                    {getStatusLabel(app.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 capitalize">
                  {app.loan_type} · {app.duration} months · #{app.id}
                </p>
              </div>
              {app.status === "pending" && (
                <Link
                  href={`/dashboard/offers-received?applicationId=${app.id}`}
                  className="px-5 py-2 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors whitespace-nowrap shrink-0"
                >
                  View Offers
                </Link>
              )}
            </StaggerItem>
          ))}
        </StaggerList>
      )}

      <div>
        <Link
          href="/dashboard/apply"
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors"
        >
          + New Loan Request
        </Link>
      </div>
    </div>
  );
}
