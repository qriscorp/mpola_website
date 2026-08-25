"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
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
    placeholderData: keepPreviousData,
  });
}

export function useSuspendUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => api.suspendUser(username),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "user-detail"] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useChangeUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ username, role }: { username: string; role: string }) =>
      api.changeUserRole(username, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "user-detail"] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "user-detail"] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useDeactivatedAccounts(page: number = 1, pageSize: number = 20, search?: string) {
  return useQuery({
    queryKey: ["admin", "deactivated-accounts", page, pageSize, search],
    queryFn: () => api.getDeactivatedAccounts(page, pageSize, search),
    placeholderData: keepPreviousData,
  });
}

export function useRestoreDeactivatedAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => api.restoreDeactivatedAccount(username),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "deactivated-accounts"] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't restore this account."),
  });
}

export function useAdminUserDetail(username: string) {
  return useQuery({
    queryKey: ["admin", "user-detail", username],
    queryFn: () => api.getAdminUserDetail(username),
    enabled: !!username,
  });
}

export function useAdminUserTransactions(username: string, page: number, pageSize: number = 20) {
  return useQuery({
    queryKey: ["admin", "user-transactions", username, page, pageSize],
    queryFn: () => api.getAdminUserTransactions(username, (page - 1) * pageSize, pageSize),
    enabled: !!username,
    placeholderData: keepPreviousData,
  });
}

export function useReviewKyc(username: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ status, note }: { status: "verified" | "rejected"; note?: string }) =>
      api.reviewKyc(username, status, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "user-detail", username] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useVerifyDocument(username: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, verified }: { documentId: string; verified: boolean }) =>
      api.verifyDocument(documentId, verified),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "user-detail", username] }),
  });
}

export function useVerifyKycDocument(username: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, verified, reason }: { documentId: string; verified: boolean; reason?: string }) =>
      api.verifyKycDocument(documentId, verified, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "user-detail", username] }),
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
    placeholderData: keepPreviousData,
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
    placeholderData: keepPreviousData,
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
    placeholderData: keepPreviousData,
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
      status: "reject";
    }) => api.updateApplicationStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "applications"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useFreezeAdminApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.freezeAdminApplication(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "applications"] }),
  });
}

export function useUnfreezeAdminApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.unfreezeAdminApplication(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "applications"] }),
  });
}

export function useAdminPayments(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ["admin", "payments", page, pageSize],
    queryFn: () => api.getAdminPayments(page, pageSize),
    placeholderData: keepPreviousData,
  });
}

export function useAdminRevenue(page: number = 1, pageSize: number = 20, category?: string) {
  return useQuery({
    queryKey: ["admin", "revenue", page, pageSize, category],
    queryFn: () => api.getAdminRevenue(page, pageSize, category),
    placeholderData: keepPreviousData,
  });
}

export function useAdminReconciliation(lookbackDays: number = 7) {
  return useQuery({
    queryKey: ["admin", "reconciliation", lookbackDays],
    queryFn: () => api.getAdminReconciliation(lookbackDays),
  });
}

export function useRecheckReconciliationTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (transactionId: string) => api.recheckReconciliationTransaction(transactionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "reconciliation"] }),
  });
}

export function useToggleWalletFreeze(username: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string) => api.toggleWalletFreeze(username, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "user-detail", username] }),
  });
}

export function useAdjustWalletBalance(username: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ amount, reason }: { amount: number; reason: string }) =>
      api.adjustWalletBalance(username, amount, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "user-detail", username] });
      qc.invalidateQueries({ queryKey: ["admin", "reconciliation"] });
    },
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

export function useExportAllPlatformData() {
  return useMutation({
    mutationFn: api.exportAllPlatformData,
    onSuccess: () => toast.success("Export downloaded"),
    onError: (err: Error) => toast.error(err.message || "Export failed"),
  });
}

export function useOfferTemplatesForReview(status?: string) {
  return useQuery({
    queryKey: ["admin", "offer-templates", status],
    queryFn: () => api.getOfferTemplatesForReview(status),
    placeholderData: keepPreviousData,
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

export function useFreezeOfferTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.freezeOfferTemplate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "offer-templates"] }),
  });
}

export function useUnfreezeOfferTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.unfreezeOfferTemplate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "offer-templates"] }),
  });
}

export function useAdminSupportTickets(page: number = 1, pageSize: number = 20, status?: string) {
  return useQuery({
    queryKey: ["admin", "support-tickets", page, pageSize, status],
    queryFn: () => api.getAdminSupportTickets(page, pageSize, status),
    placeholderData: keepPreviousData,
  });
}

export function useAdminSupportTicketDetail(id: string) {
  return useQuery({
    queryKey: ["admin", "support-tickets", "detail", id],
    queryFn: () => api.getAdminSupportTicketDetail(id),
    enabled: !!id,
  });
}

export function useReplyAdminSupportTicket(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => api.replyAdminSupportTicket(id, message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "support-tickets"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to send reply."),
  });
}

export function useAdminChatConversations() {
  return useQuery({
    queryKey: ["admin", "chat-conversations"],
    queryFn: api.getAdminChatConversations,
  });
}

export function useAdminChatThread(userId: string) {
  return useQuery({
    queryKey: ["admin", "chat-conversations", "detail", userId],
    queryFn: () => api.getAdminChatThread(userId),
    enabled: !!userId,
  });
}

export function useReplyAdminChat(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ message, file }: { message: string; file?: File }) =>
      api.replyAdminChatThread(userId, message, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "chat-conversations"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to send reply."),
  });
}

export function useUpdateSupportTicketStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: "open" | "in_progress" | "resolved" | "closed") =>
      api.updateSupportTicketStatus(id, status),
    onSuccess: () => {
      toast.success("Ticket status updated.");
      qc.invalidateQueries({ queryKey: ["admin", "support-tickets"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update ticket."),
  });
}

export function useAdminDisputes(page: number = 1, pageSize: number = 20, status?: string) {
  return useQuery({
    queryKey: ["admin", "disputes", page, pageSize, status],
    queryFn: () => api.getAdminDisputes(page, pageSize, status),
    placeholderData: keepPreviousData,
  });
}

export function useAdminDisputeDetail(id: string) {
  return useQuery({
    queryKey: ["admin", "disputes", "detail", id],
    queryFn: () => api.getAdminDisputeDetail(id),
    enabled: !!id,
  });
}

export function useResolveDispute(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      status: "investigating" | "resolved" | "rejected";
      resolutionNote?: string;
      settlementAmount?: number;
      settlementPayer?: "filer" | "respondent";
    }) => api.resolveDispute(id, data),
    onSuccess: () => {
      toast.success("Dispute updated.");
      qc.invalidateQueries({ queryKey: ["admin", "disputes"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update dispute."),
  });
}
