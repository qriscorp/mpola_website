"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  CreditCard,
  Gift,
  UserCheck,
  Settings,
  Clock,
} from "lucide-react";
import {
  useMarkAllRead,
  useMarkRead,
  useNotificationsPage,
} from "@/hooks/use-notifications";
import { BorrowerPageHeader } from "@/components/top-nav";
import { CardSkeleton } from "@/components/skeletons";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";
import { WebPushPrompt } from "@/components/web-push-prompt";
import { notificationHref } from "@/lib/notifications";
import { PaginationControls } from "@/components/ui/pagination-controls";

const PAGE_SIZE = 20;

type FilterKey = "all" | "unread" | "offers" | "payments" | "guarantors";

const CATEGORY_TYPES: Record<Exclude<FilterKey, "all" | "unread">, string[]> = {
  offers: ["loan_offer", "offer_accepted", "offer_declined", "offer_awaiting_response", "offer_expired"],
  payments: ["payment", "repayment"],
  guarantors: ["guarantor_response", "guarantor_invite_received", "guarantor_still_pending", "guarantor_request_expired"],
};

const typeConfig: Record<
  string,
  { icon: typeof Bell; iconBg: string; iconColor: string }
> = {
  loan_offer: { icon: Gift, iconBg: "bg-[#E6F4F2] dark:bg-[#149D8E]/20", iconColor: "text-[#149D8E] dark:text-[#5EEAD4]" },
  offer_accepted: { icon: Gift, iconBg: "bg-[#E6F4F2] dark:bg-[#149D8E]/20", iconColor: "text-[#149D8E] dark:text-[#5EEAD4]" },
  offer_declined: { icon: Gift, iconBg: "bg-gray-100 dark:bg-gray-800", iconColor: "text-gray-600 dark:text-gray-300" },
  offer_awaiting_response: { icon: Gift, iconBg: "bg-amber-50 dark:bg-amber-900/20", iconColor: "text-amber-600 dark:text-amber-400" },
  offer_expired: { icon: Clock, iconBg: "bg-gray-100 dark:bg-gray-800", iconColor: "text-gray-600 dark:text-gray-300" },
  payment: { icon: CreditCard, iconBg: "bg-[#E6F4F2] dark:bg-[#149D8E]/20", iconColor: "text-[#149D8E] dark:text-[#5EEAD4]" },
  repayment: { icon: CreditCard, iconBg: "bg-[#E6F4F2] dark:bg-[#149D8E]/20", iconColor: "text-[#149D8E] dark:text-[#5EEAD4]" },
  guarantor_response: { icon: UserCheck, iconBg: "bg-blue-50 dark:bg-blue-900/20", iconColor: "text-blue-600 dark:text-blue-400" },
  guarantor_invite_received: { icon: UserCheck, iconBg: "bg-blue-50 dark:bg-blue-900/20", iconColor: "text-blue-600 dark:text-blue-400" },
  guarantor_still_pending: { icon: UserCheck, iconBg: "bg-amber-50 dark:bg-amber-900/20", iconColor: "text-amber-600 dark:text-amber-400" },
  application_expired: { icon: Clock, iconBg: "bg-gray-100 dark:bg-gray-800", iconColor: "text-gray-600 dark:text-gray-300" },
  guarantor_request_expired: { icon: Clock, iconBg: "bg-gray-100 dark:bg-gray-800", iconColor: "text-gray-600 dark:text-gray-300" },
};

const defaultTypeConfig = {
  icon: Settings,
  iconBg: "bg-gray-100 dark:bg-gray-800",
  iconColor: "text-gray-600 dark:text-gray-300",
};

function timeSince(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);
  const filterParams =
    filter === "unread" ? { isRead: false } : filter === "all" ? undefined : { types: CATEGORY_TYPES[filter] };
  const { data, isLoading } = useNotificationsPage(page, PAGE_SIZE, filterParams);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  const items = data?.notifications ?? [];
  const total = data?.total ?? 0;
  const totalAll = data?.totalAll ?? 0;
  const unreadCount = data?.unread ?? 0;

  const handleFilter = (key: FilterKey) => {
    setFilter(key);
    setPage(1);
  };

  const filterPills: Array<{ key: FilterKey; label: string; count?: number }> =
    [
      { key: "all", label: "All", count: totalAll },
      { key: "unread", label: "Unread", count: unreadCount },
      { key: "offers", label: "Offers" },
      { key: "payments", label: "Payments" },
      { key: "guarantors", label: "Guarantors" },
    ];

  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Notifications" />

      <WebPushPrompt />

      <div className="rounded-xl border border-[#9DDAD1] bg-[#E6F4F2] px-4 py-3 sm:px-5 dark:border-[#149D8E]/40 dark:bg-[#149D8E]/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
              : "All caught up. No unread notifications."}
          </p>
          {unreadCount > 0 && (
            <button
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#2BB5A0] bg-white px-3 py-2 text-sm font-semibold text-[#149D8E] transition-colors hover:bg-[#F2FBF9] disabled:cursor-not-allowed disabled:opacity-60 dark:text-[#5EEAD4] dark:bg-gray-900"
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
              onClick={() => handleFilter(pill.key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-[#2BB5A0] bg-[#2BB5A0] text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-[#2BB5A0] hover:text-[#149D8E] dark:border-gray-700 dark:text-gray-300 dark:bg-gray-900"
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
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center dark:border-gray-800 dark:bg-gray-900">
          <Bell className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            No notifications in this category.
          </p>
        </div>
      ) : (
        <>
        <StaggerList className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {items.map((item, index) => {
            const cfg = (item.type && typeConfig[item.type]) || defaultTypeConfig;
            const Icon = cfg.icon;
            const href = notificationHref(item.type, false);
            return (
              <StaggerItem key={item.id} className="w-full">
              <button
                onClick={() => {
                  if (!item.read) markRead.mutate(item.id);
                  if (href) router.push(href);
                }}
                className={`flex w-full items-start gap-4 px-4 py-4 text-left transition-colors sm:px-5 ${
                  index !== items.length - 1
                    ? "border-b border-gray-100 dark:border-gray-800"
                    : ""
                } ${!item.read ? "bg-[#F2FBF9] hover:bg-[#EAF8F5] dark:bg-[#149D8E]/10 dark:hover:bg-[#149D8E]/15" : "hover:bg-gray-50 dark:hover:bg-gray-800"} ${
                  href ? "cursor-pointer" : ""
                }`}
              >
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cfg.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${cfg.iconColor}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm font-semibold ${!item.read ? "text-[#1B2B3A] dark:text-white" : "text-gray-600 dark:text-gray-300"}`}
                    >
                      {item.title}
                    </p>
                    <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                      {timeSince(item.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                    {item.message}
                  </p>
                </div>

                {!item.read && (
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#2BB5A0]" />
                )}
              </button>
              </StaggerItem>
            );
          })}
        </StaggerList>
        <PaginationControls page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
