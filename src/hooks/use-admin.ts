"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: api.getAdminStats,
  });
}

export function useAdminUsers(filters?: {
  search?: string;
  status?: string;
  role?: string;
}) {
  return useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: () => api.getAdminUsers(filters),
  });
}

export function useSuspendUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => api.suspendUser(username),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useChangeUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ username, role }: { username: string; role: string }) =>
      api.changeUserRole(username, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ username, reason }: { username: string; reason?: string }) =>
      api.deactivateUser(username, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useAdminUserDetail(username: string) {
  return useQuery({
    queryKey: ["admin", "user-detail", username],
    queryFn: () => api.getAdminUserDetail(username),
    enabled: !!username,
  });
}

export function useAdminAuditLogs(filters?: { action?: string; username?: string }) {
  return useQuery({
    queryKey: ["admin", "audit-logs", filters],
    queryFn: () => api.getAdminAuditLogs(filters),
  });
}

export function useAdminLoans(filters?: { status?: string }) {
  return useQuery({
    queryKey: ["admin", "loans", filters],
    queryFn: () => api.getAdminLoans(filters),
  });
}

export function useAdminApplications(filters?: { status?: string }) {
  return useQuery({
    queryKey: ["admin", "applications", filters],
    queryFn: () => api.getAdminApplications(filters),
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
      status: "approve" | "reject";
    }) => api.updateApplicationStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "applications"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useAdminPayments() {
  return useQuery({
    queryKey: ["admin", "payments"],
    queryFn: api.getAdminPayments,
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: api.getAdminSettings,
  });
}

export function useUpdateAdminSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      api.updateAdminSetting(key, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "settings"] }),
  });
}

export function useOfferTemplatesForReview(status?: string) {
  return useQuery({
    queryKey: ["admin", "offer-templates", status],
    queryFn: () => api.getOfferTemplatesForReview(status),
  });
}

export function useReviewOfferTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" }) =>
      api.reviewOfferTemplate(id, action),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "offer-templates"] }),
  });
}
