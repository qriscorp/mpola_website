"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: api.getUser,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: api.getDashboardStats,
  });
}

export function useActiveLoan() {
  return useQuery({
    queryKey: ["active-loan"],
    queryFn: api.getActiveLoan,
  });
}

export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: api.getApplications,
  });
}

export function useRecentNotifications(limit = 3) {
  return useQuery({
    queryKey: ["recent-notifications", limit],
    queryFn: () => api.getRecentNotifications(limit),
  });
}
