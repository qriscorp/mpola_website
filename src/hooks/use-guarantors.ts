"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useSearchGuarantorCandidate() {
  return useMutation({
    mutationFn: ({ email, phoneNumber }: { email: string; phoneNumber: string }) =>
      api.searchGuarantorCandidate(email, phoneNumber),
  });
}

export function useAttachGuarantors() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, guarantorUserIds }: { applicationId: string; guarantorUserIds: string[] }) =>
      api.attachGuarantors(applicationId, guarantorUserIds),
    onSuccess: (_result, variables) => {
      qc.invalidateQueries({ queryKey: ["application", variables.applicationId] });
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to add guarantors"),
  });
}

export function useGuarantorRequests(status?: string) {
  return useQuery({
    queryKey: ["guarantor-requests", status],
    queryFn: () => api.getGuarantorRequests(status),
  });
}

export function useRespondToGuarantorRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ guarantorId, status }: { guarantorId: string; status: "accepted" | "declined" }) =>
      api.respondToGuarantorRequest(guarantorId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["guarantor-requests"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to respond"),
  });
}

export function useRemindGuarantor() {
  return useMutation({
    mutationFn: (guarantorId: string) => api.remindGuarantor(guarantorId),
    onSuccess: () => toast.success("Reminder sent"),
    onError: (err: Error) => toast.error(err.message || "Failed to send reminder"),
  });
}

export function useReplaceGuarantor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicationId,
      guarantorId,
      newGuarantorUserId,
    }: {
      applicationId: string;
      guarantorId: string;
      newGuarantorUserId: string;
    }) => api.replaceGuarantor(applicationId, guarantorId, newGuarantorUserId),
    onSuccess: (_result, variables) => {
      qc.invalidateQueries({ queryKey: ["application", variables.applicationId] });
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to replace guarantor"),
  });
}
