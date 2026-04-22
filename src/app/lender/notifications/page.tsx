"use client";

import { LenderPageHeader } from "@/components/lender-top-nav";

const notifications = [
  {
    id: 1,
    title: "Agnes K. applied to your offer",
    desc: "Business loan · UGX 8M · 4 months",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 2,
    title: "Repayment received from Brian T.",
    desc: "UGX 2,400,000 received · On time",
    time: "Yesterday",
    unread: true,
  },
  {
    id: 3,
    title: "Overdue: Patrick Ssali — Payment missed",
    desc: "UGX 1,800,000 was due 3 days ago",
    time: "3 days ago",
    unread: false,
    alert: true,
  },
  {
    id: 4,
    title: "Patience N. applied to your offer",
    desc: "Emergency loan · UGX 3M · 2 months",
    time: "4 days ago",
    unread: false,
  },
  {
    id: 5,
    title: "Repayment received from Agnes K.",
    desc: "UGX 2,400,000 received · Instalment 1/4",
    time: "1 week ago",
    unread: false,
  },
];

export default function LenderNotificationsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <LenderPageHeader title="Notifications" />

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-4 p-4 sm:p-5 ${n.unread ? "bg-amber-50/40 dark:bg-amber-900/5" : ""}`}
          >
            <div
              className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.unread ? "bg-[#C4A55A]" : n.alert ? "bg-red-500" : "bg-transparent"}`}
            />
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${n.alert ? "text-red-600" : "text-[#1B2B3A] dark:text-white"}`}
              >
                {n.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
              {n.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
