"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useReferralInfo() {
  return useQuery({
    queryKey: ["referrals", "me"],
    queryFn: api.getReferralInfo,
  });
}

export function useMySupportTickets() {
  return useQuery({
    queryKey: ["support", "mine"],
    queryFn: api.getMySupportTickets,
  });
}

export function useSupportTicket(id: string) {
  return useQuery({
    queryKey: ["support", id],
    queryFn: () => api.getSupportTicket(id),
    enabled: !!id,
  });
}

export function useCreateSupportTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createSupportTicket,
    onSuccess: () => {
      toast.success("Ticket submitted — our team will respond soon.");
      qc.invalidateQueries({ queryKey: ["support", "mine"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to submit ticket."),
  });
}

export function useReplySupportTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      api.replySupportTicket(id, message),
    onSuccess: (_res, variables) => {
      qc.invalidateQueries({ queryKey: ["support", variables.id] });
      qc.invalidateQueries({ queryKey: ["support", "mine"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to send reply."),
  });
}

export function useMyDisputes() {
  return useQuery({
    queryKey: ["disputes", "mine"],
    queryFn: api.getMyDisputes,
  });
}

export function useFileDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.fileDispute,
    onSuccess: () => {
      toast.success("Dispute filed — our team will review it shortly.");
      qc.invalidateQueries({ queryKey: ["disputes", "mine"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to file dispute."),
  });
}

export function useLoginSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: api.getLoginSessions,
  });
}

export function useSignOutEverywhere() {
  return useMutation({
    mutationFn: api.signOutEverywhere,
    onSuccess: (res) => toast.success(res.message),
    onError: (err: Error) => toast.error(err.message || "Failed to sign out everywhere."),
  });
}
