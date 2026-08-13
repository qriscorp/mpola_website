"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  FileText,
  AlertTriangle,
  MessageSquare,
  AlertCircle,
  Settings,
} from "lucide-react";
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
} from "@/hooks/use-notifications";
import { FadeSwap } from "@/components/motion/fade-swap";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";
import { CardSkeleton } from "@/components/skeletons";

type FilterKey = "all" | "unread" | "applications" | "loans" | "support";

const typeConfig: Record<
  string,
  { icon: typeof Bell; iconBg: string; iconColor: string }
> = {
  new_application: { icon: FileText, iconBg: "bg-[#E8F8F5] dark:bg-[#2BB5A0]/10", iconColor: "text-[#2BB5A0]" },
  loan_overdue: { icon: AlertCircle, iconBg: "bg-amber-50 dark:bg-amber-900/20", iconColor: "text-amber-600 dark:text-amber-400" },
  loan_defaulted: { icon: AlertCircle, iconBg: "bg-red-50 dark:bg-red-900/20", iconColor: "text-red-600 dark:text-red-400" },
  dispute: { icon: AlertTriangle, iconBg: "bg-red-50 dark:bg-red-900/20", iconColor: "text-red-600 dark:text-red-400" },
  dispute_update: { icon: AlertTriangle, iconBg: "bg-amber-50 dark:bg-amber-900/20", iconColor: "text-amber-600 dark:text-amber-400" },
  support_ticket: { icon: MessageSquare, iconBg: "bg-blue-50 dark:bg-blue-900/20", iconColor: "text-blue-600 dark:text-blue-400" },
};

const defaultTypeConfig = {
  icon: Settings,
  iconBg: "bg-gray-100 dark:bg-gray-800",
  iconColor: "text-gray-600 dark:text-gray-400",
};

function categoryOf(type: string | null): "applications" | "loans" | "support" | "other" {
  if (type === "new_application") return "applications";
  if (type === "loan_overdue" || type === "loan_defaulted") return "loans";
  if (type === "dispute" || type === "dispute_update" || type === "support_ticket") return "support";
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

export default function AdminNotificationsPage() {
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
      { key: "applications", label: "Applications" },
      { key: "loans", label: "Loans" },
      { key: "support", label: "Disputes & Support" },
    ];

  return (
    <FadeSwap
      loading={isLoading}
      skeleton={
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">Notifications</h1>
          <CardSkeleton count={3} height="h-20" />
        </div>
      }
    >
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">Notifications</h1>

      <div className="rounded-xl border border-[#9DDAD1] bg-[#E8F8F5] dark:border-[#2BB5A0]/30 dark:bg-[#2BB5A0]/10 px-4 py-3 sm:px-5">
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
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#2BB5A0] bg-white dark:bg-gray-900 px-3 py-2 text-sm font-semibold text-[#149D8E] transition-colors hover:bg-[#F2FBF9] dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
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
                  ? "border-[#2BB5A0] bg-[#2BB5A0] text-white"
                  : "border-gray-300 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-[#2BB5A0] hover:text-[#149D8E]"
              }`}
            >
              {pill.label}
              {typeof pill.count === "number" ? ` (${pill.count})` : ""}
            </button>
          );
        })}
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-12 text-center">
          <Bell className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">
            No notifications in this category.
          </p>
        </div>
      ) : (
        <StaggerList className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          {filteredItems.map((item, index) => {
            const cfg = (item.type && typeConfig[item.type]) || defaultTypeConfig;
            const Icon = cfg.icon;
            return (
              <StaggerItem key={item.id} className="w-full">
              <button
                onClick={() => !item.read && markRead.mutate(item.id)}
                className={`flex w-full items-start gap-4 px-4 py-4 text-left transition-colors sm:px-5 ${
                  index !== filteredItems.length - 1
                    ? "border-b border-gray-100 dark:border-gray-800"
                    : ""
                } ${!item.read ? "bg-[#E8F8F5]/50 hover:bg-[#E8F8F5] dark:bg-[#2BB5A0]/5 dark:hover:bg-[#2BB5A0]/10" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
              >
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cfg.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${cfg.iconColor}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm font-semibold ${!item.read ? "text-[#1B2B3A] dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
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
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#2BB5A0]" />
                )}
              </button>
              </StaggerItem>
            );
          })}
        </StaggerList>
      )}
    </div>
    </FadeSwap>
  );
}
