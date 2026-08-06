"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  CreditCard,
  Gift,
  UserCheck,
  Settings,
} from "lucide-react";
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
} from "@/hooks/use-notifications";
import { LenderPageHeader } from "@/components/lender-top-nav";
import { CardSkeleton } from "@/components/skeletons";

type FilterKey = "all" | "unread" | "offers" | "payments" | "guarantors";

const typeConfig: Record<
  string,
  { icon: typeof Bell; iconBg: string; iconColor: string }
> = {
  loan_offer: { icon: Gift, iconBg: "bg-[#F5F0E0]", iconColor: "text-[#C4A55A]" },
  offer_accepted: { icon: Gift, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  offer_declined: { icon: Gift, iconBg: "bg-gray-100", iconColor: "text-gray-600" },
  payment: { icon: CreditCard, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  repayment: { icon: CreditCard, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  guarantor_response: { icon: UserCheck, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
};

const defaultTypeConfig = {
  icon: Settings,
  iconBg: "bg-gray-100",
  iconColor: "text-gray-600",
};

function categoryOf(type: string | null): "offers" | "payments" | "guarantors" | "other" {
  if (type === "loan_offer" || type === "offer_accepted" || type === "offer_declined") return "offers";
  if (type === "payment" || type === "repayment") return "payments";
  if (type === "guarantor_response") return "guarantors";
  return "other";
}

function timeSince(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function LenderNotificationsPage() {
  const { data: items = [], isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const [filter, setFilter] = useState<FilterKey>("all");

  const unreadCount = items.filter((item) => !item.read).length;

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "unread") return items.filter((item) => !item.read);
    return items.filter((item) => categoryOf(item.type) === filter);
  }, [items, filter]);

  const filterPills: Array<{ key: FilterKey; label: string; count?: number }> =
    [
      { key: "all", label: "All", count: items.length },
      { key: "unread", label: "Unread", count: unreadCount },
      { key: "offers", label: "Offers" },
      { key: "payments", label: "Payments" },
      { key: "guarantors", label: "Guarantors" },
    ];

  return (
    <div className="space-y-6 max-w-4xl">
      <LenderPageHeader title="Notifications" />

      <div className="rounded-xl border border-[#E8D9B0] bg-[#F5F0E0] px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-[#1B2B3A]">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
              : "All caught up. No unread notifications."}
          </p>
          {unreadCount > 0 && (
            <button
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#C4A55A] bg-white px-3 py-2 text-sm font-semibold text-[#9F7F34] transition-colors hover:bg-[#FBF7EC] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterPills.map((pill) => {
          const isActive = filter === pill.key;
          return (
            <button
              key={pill.key}
              onClick={() => setFilter(pill.key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-[#C4A55A] bg-[#C4A55A] text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-[#C4A55A] hover:text-[#9F7F34]"
              }`}
            >
              {pill.label}
              {typeof pill.count === "number" ? ` (${pill.count})` : ""}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <CardSkeleton count={3} height="h-20" />
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center">
          <Bell className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">
            No notifications in this category.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {filteredItems.map((item, index) => {
            const cfg = (item.type && typeConfig[item.type]) || defaultTypeConfig;
            const Icon = cfg.icon;
            return (
              <button
                key={item.id}
                onClick={() => !item.read && markRead.mutate(item.id)}
                className={`flex w-full items-start gap-4 px-4 py-4 text-left transition-colors sm:px-5 ${
                  index !== filteredItems.length - 1 ? "border-b border-gray-100" : ""
                } ${!item.read ? "bg-[#F5F0E0]/35 hover:bg-[#F5F0E0]/50" : "hover:bg-gray-50"}`}
              >
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cfg.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${cfg.iconColor}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm font-semibold ${!item.read ? "text-[#1B2B3A]" : "text-gray-600"}`}
                    >
                      {item.title}
                    </p>
                    <span className="shrink-0 text-xs text-gray-400">
                      {timeSince(item.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                    {item.message}
                  </p>
                </div>

                {!item.read && (
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#C4A55A]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
