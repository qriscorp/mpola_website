"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: api.getAdminStats,
  });
}

export function useAdminActivity() {
  return useQuery({
    queryKey: ["admin", "activity"],
    queryFn: api.getAdminActivity,
  });
}

export function useAdminUsers(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    search?: string;
    status?: string;
    role?: string;
  },
) {
  return useQuery({
    queryKey: ["admin", "users", page, pageSize, filters],
    queryFn: () => api.getAdminUsers(page, pageSize, filters),
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

export function useSetUserAdminAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      username,
      isAdmin,
      isSuperAdmin,
    }: {
      username: string;
      isAdmin: boolean;
      isSuperAdmin?: boolean;
    }) => api.setUserAdminAccess(username, isAdmin, isSuperAdmin),
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

export function useAdminAuditLogs(
  page: number = 1,
  pageSize: number = 20,
  filters?: { action?: string; username?: string; search?: string },
) {
  return useQuery({
    queryKey: ["admin", "audit-logs", page, pageSize, filters],
    queryFn: () => api.getAdminAuditLogs(page, pageSize, filters),
  });
}

export function useAdminLoans(
  page: number = 1,
  pageSize: number = 20,
  filters?: { status?: string; search?: string },
) {
  return useQuery({
    queryKey: ["admin", "loans", page, pageSize, filters],
    queryFn: () => api.getAdminLoans(page, pageSize, filters),
  });
}

export function useAdminApplications(
  page: number = 1,
  pageSize: number = 20,
  filters?: { status?: string; search?: string },
) {
  return useQuery({
    queryKey: ["admin", "applications", page, pageSize, filters],
    queryFn: () => api.getAdminApplications(page, pageSize, filters),
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

export function useAdminPayments(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ["admin", "payments", page, pageSize],
    queryFn: () => api.getAdminPayments(page, pageSize),
  });
}

export function useAdminRevenue(page: number = 1, pageSize: number = 20, category?: string) {
  return useQuery({
    queryKey: ["admin", "revenue", page, pageSize, category],
    queryFn: () => api.getAdminRevenue(page, pageSize, category),
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
