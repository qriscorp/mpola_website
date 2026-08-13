"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: api.getNotifications,
  });
}

// Paginated + filterable — for the full Notifications pages (admin/lender/
// borrower), which can't just render a flat capped list once a real
// account accumulates hundreds or thousands of notifications.
export function useNotificationsPage(
  page: number = 1,
  pageSize: number = 20,
  filters?: { isRead?: boolean; types?: string[] },
) {
  return useQuery({
    queryKey: ["notifications", "page", page, pageSize, filters],
    queryFn: () => api.getNotificationsPage(page, pageSize, filters),
    placeholderData: keepPreviousData,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    // Prefix match — also invalidates every ["notifications", "page", ...] query.
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
