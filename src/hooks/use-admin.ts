"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: api.getAdminStats,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: api.getAdminUsers,
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "active" | "suspended" | "banned";
    }) => api.updateUserStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useAdminLoans() {
  return useQuery({
    queryKey: ["admin", "loans"],
    queryFn: api.getAdminLoans,
  });
}

export function useAdminApplications() {
  return useQuery({
    queryKey: ["admin", "applications"],
    queryFn: api.getAdminApplications,
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "approved" | "rejected";
    }) => api.updateApplicationStatus(id, status),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "applications"] }),
  });
}
