"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LenderPageHeader } from "@/components/lender-top-nav";

type AppStatus = "Pending" | "Approved" | "Declined";

const applications = [
  {
    id: "APP-001",
    initials: "AK",
    name: "Agnes Kyomuhendo",
    type: "Business",
    age: "2 days ago",
    score: 78,
    amount: "UGX 8M",
    duration: "4 months",
    bgColor: "bg-[#1B2B3A]",
    status: "Pending" as AppStatus,
  },
  {
    id: "APP-002",
    initials: "BT",
    name: "Brian Tumwine",
    type: "Personal",
    age: "3 days ago",
    score: 62,
    amount: "UGX 3M",
    duration: "2 months",
    bgColor: "bg-red-700",
    status: "Pending" as AppStatus,
  },
  {
    id: "APP-003",
    initials: "PN",
    name: "Patience Nakato",
    type: "Emergency",
    age: "1 day ago",
    score: 85,
    amount: "UGX 5M",
    duration: "3 months",
    bgColor: "bg-emerald-700",
    status: "Pending" as AppStatus,
  },
];

const tabs: Array<"All" | AppStatus> = [
  "All",
  "Pending",
  "Approved",
  "Declined",
];

export default function ApplicationsPage() {
  const [tab, setTab] = useState<"All" | AppStatus>("All");
  const [approveModal, setApproveModal] = useState<
    (typeof applications)[0] | null
  >(null);
  const [confirming, setConfirming] = useState(false);

  const filtered =
    tab === "All" ? applications : applications.filter((a) => a.status === tab);

  async function confirmApprove() {
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 800));
    setConfirming(false);
    setApproveModal(null);
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <LenderPageHeader title="Applications Inbox" />

      {/* Offer context banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
        <div>
          <span className="font-bold text-[#1B2B3A] dark:text-white">
            Offer #LF-2024-001
          </span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
            Active
          </span>
        </div>
        <span className="text-sm text-gray-500 ml-auto hidden sm:inline">
          UGX 50M · 5%/mo · Max 6 months
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              tab === t
                ? "bg-[#C4A55A] border-[#C4A55A] text-white"
                : "bg-white border-gray-300 text-gray-600 hover:border-[#C4A55A]"
            }`}
          >
            {t}{" "}
            {t === "All"
              ? `(${applications.length})`
              : t === "Pending"
                ? "(7)"
                : t === "Approved"
                  ? "(3)"
                  : "(2)"}
          </button>
        ))}
      </div>

      {/* Application rows */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
        {filtered.map((app) => (
          <div
            key={app.id}
            className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5"
          >
            {/* Avatar + name */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback
                  className={`${app.bgColor} text-white text-sm font-bold`}
                >
                  {app.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold text-[#1B2B3A] dark:text-white text-sm">
                  {app.name}
                </p>
                <p className="text-xs text-gray-400">
                  {app.type} · {app.age} · Score {app.score}/100
                </p>
                {/* Score bar */}
                <div className="mt-1 h-1 w-24 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#C4A55A]"
                    style={{ width: `${app.score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="shrink-0 text-right sm:text-center">
              <p className="font-bold text-[#1B2B3A] dark:text-white">
                {app.amount}
              </p>
              <p className="text-xs text-gray-400">{app.duration}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setApproveModal(app)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
              >
                Approve
              </button>
              <button className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors">
                Decline
              </button>
              <Link
                href="/lender/applicant"
                className="px-3 py-1.5 rounded-lg bg-[#C4A55A] text-white text-xs font-semibold hover:bg-[#b3944a] transition-colors"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Approve confirmation modal */}
      {approveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#1B2B3A] dark:text-white">
              Approve Loan Application
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Confirm terms for {approveModal.name}
            </p>

            <div className="mt-5 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 p-4 space-y-3 text-sm">
              {[
                ["Borrower", approveModal.name],
                ["Amount", approveModal.amount],
                ["Duration", approveModal.duration],
                ["Interest (5%/mo)", "UGX 1,600,000"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-[#1B2B3A] dark:text-white">
                    {v}
                  </span>
                </div>
              ))}
              <div className="flex justify-between border-t border-amber-200 pt-3">
                <span className="font-semibold text-[#1B2B3A] dark:text-white">
                  Total Repayable
                </span>
                <span className="font-bold text-[#C4A55A]">UGX 9,600,000</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-3">
              Mpola will disburse funds from your wallet within 24 hours.
            </p>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setApproveModal(null)}
                className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:border-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                disabled={confirming}
                className="px-5 py-2 rounded-lg bg-[#C4A55A] text-white text-sm font-semibold hover:bg-[#b3944a] disabled:opacity-50"
              >
                {confirming ? "Confirming…" : "Confirm Approval"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
