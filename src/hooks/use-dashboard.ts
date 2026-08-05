"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: api.getUser,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateProfile,
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update profile"),
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
