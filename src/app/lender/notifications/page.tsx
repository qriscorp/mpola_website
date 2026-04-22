"use client";

import {
  Bell,
  CircleAlert,
  CircleCheckBig,
  CircleDollarSign,
} from "lucide-react";
import { LenderPageHeader } from "@/components/lender-top-nav";

const sections = [
  {
    title: "Today",
    items: [
      {
        id: 1,
        icon: Bell,
        iconBg: "bg-[#F5F0E0]",
        iconColor: "text-[#C4A55A]",
        title: "Agnes K. applied to your offer",
        desc: "Business loan · UGX 8M · 4 months",
        time: "2h ago",
        unread: true,
      },
      {
        id: 2,
        icon: CircleDollarSign,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        title: "Repayment received from Brian T.",
        desc: "UGX 2,400,000 received · On time",
        time: "5h ago",
        unread: true,
      },
    ],
  },
  {
    title: "Earlier",
    items: [
      {
        id: 3,
        icon: CircleAlert,
        iconBg: "bg-red-50",
        iconColor: "text-red-600",
        title: "Overdue: Patrick Ssali — Payment missed",
        desc: "UGX 1,800,000 was due 3 days ago",
        time: "3d ago",
        unread: false,
      },
      {
        id: 4,
        icon: CircleCheckBig,
        iconBg: "bg-[#F5F0E0]",
        iconColor: "text-[#C4A55A]",
        title: "Patience N. applied to your offer",
        desc: "Emergency loan · UGX 3M · 2 months",
        time: "4d ago",
        unread: false,
      },
    ],
  },
];

export default function LenderNotificationsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <LenderPageHeader title="Notifications" />

      {sections.map((section) => (
        <div
          key={section.title}
          className="rounded-xl border border-gray-200 bg-white overflow-hidden"
        >
          <div className="border-b border-gray-100 px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {section.title}
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {section.items.map((n) => {
              const Icon = n.icon;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 px-5 py-4 ${n.unread ? "bg-[#F5F0E0]/35" : ""}`}
                >
                  <div
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${n.iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${n.iconColor}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1B2B3A]">
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">{n.desc}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{n.time}</span>
                    {n.unread && (
                      <span className="h-2.5 w-2.5 rounded-full bg-[#C4A55A]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
