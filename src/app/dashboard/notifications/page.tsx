"use client";

import { useState } from "react";
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
} from "@/hooks/use-notifications";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Gift,
  CreditCard,
  Info,
  Settings,
  CheckCheck,
} from "lucide-react";
import type { Notification } from "@/lib/types";

const typeConfig: Record<
  Notification["type"],
  { icon: typeof Bell; color: string; bg: string }
> = {
  offer: {
    icon: Gift,
    color: "text-[#2BB5A0]",
    bg: "bg-[#E8F8F5] dark:bg-[#2BB5A0]/10",
  },
  payment: {
    icon: CreditCard,
    color: "text-[#C4A55A]",
    bg: "bg-[#F5F0E0] dark:bg-[#C4A55A]/10",
  },
  status: {
    icon: Info,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  system: {
    icon: Settings,
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-100 dark:bg-gray-800",
  },
};

function timeSince(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const { data: items = [], isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const [tab, setTab] = useState("all");

  const unreadCount = items.filter((n) => !n.read).length;
  const filtered =
    tab === "all"
      ? items
      : tab === "unread"
        ? items.filter((n) => !n.read)
        : items.filter((n) => n.type === tab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread{" "}
            {unreadCount > 0 && (
              <Badge className="ml-1 bg-[#2BB5A0] text-white text-xs px-1.5">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="offer">Offers</TabsTrigger>
          <TabsTrigger value="payment">Payments</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No notifications</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((n) => {
              const cfg = typeConfig[n.type];
              const Icon = cfg.icon;
              return (
                <Card
                  key={n.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !n.read
                      ? "border-l-4 border-l-[#2BB5A0] bg-[#E8F8F5]/30 dark:bg-[#2BB5A0]/5"
                      : ""
                  }`}
                  onClick={() => !n.read && markRead.mutate(n.id)}
                >
                  <CardContent className="flex items-start gap-4 py-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}
                    >
                      <Icon className={`h-5 w-5 ${cfg.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`text-sm font-semibold ${!n.read ? "text-[#1B2B3A] dark:text-white" : "text-muted-foreground"}`}
                        >
                          {n.title}
                        </h3>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {timeSince(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#2BB5A0]" />
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
