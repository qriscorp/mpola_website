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
    onSuccess: (res) => {
      toast.success(
        res.dispute.respondent_id
          ? "Dispute filed — the other party has been notified."
          : "Dispute filed — our team will review it shortly.",
      );
      qc.invalidateQueries({ queryKey: ["disputes", "mine"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to file dispute."),
  });
}

export function useDispute(id: string) {
  return useQuery({
    queryKey: ["disputes", id],
    queryFn: () => api.getDispute(id),
    enabled: !!id,
  });
}

export function useMyLoansForDispute() {
  return useQuery({
    queryKey: ["loans", "mine-for-dispute"],
    queryFn: api.getMyLoansForDispute,
  });
}

function invalidateDispute(qc: ReturnType<typeof useQueryClient>, id: string) {
  qc.invalidateQueries({ queryKey: ["disputes", id] });
  qc.invalidateQueries({ queryKey: ["disputes", "mine"] });
}

export function usePostDisputeMessage(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => api.postDisputeMessage(id, message),
    onSuccess: () => invalidateDispute(qc, id),
    onError: (err: Error) => toast.error(err.message || "Failed to send message."),
  });
}

export function useProposeDisputeResolution(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { note: string; settlementAmount?: number; payer: "self" | "other" }) =>
      api.proposeDisputeResolution(id, data),
    onSuccess: () => {
      toast.success("Proposal sent to the other party.");
      invalidateDispute(qc, id);
    },
    onError: (err: Error) => toast.error(err.message || "Failed to send proposal."),
  });
}

export function useRespondToDisputeProposal(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (accept: boolean) => api.respondToDisputeProposal(id, accept),
    onSuccess: (res) => {
      toast.success(res.dispute.status === "resolved" ? "Dispute resolved." : "Proposal declined.");
      invalidateDispute(qc, id);
    },
    onError: (err: Error) => toast.error(err.message || "Failed to respond to proposal."),
  });
}

export function useEscalateDispute(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.escalateDispute(id),
    onSuccess: () => {
      toast.success("Escalated to Mpola support.");
      invalidateDispute(qc, id);
    },
    onError: (err: Error) => toast.error(err.message || "Failed to escalate."),
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
