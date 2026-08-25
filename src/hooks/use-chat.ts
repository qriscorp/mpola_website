"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useChatConversations() {
  return useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: api.getChatConversations,
  });
}

export function useChatUnreadCount() {
  return useQuery({
    queryKey: ["chat", "unread-count"],
    queryFn: api.getChatUnreadCount,
    // Read receipts elsewhere (opening a thread) don't otherwise trigger a
    // refetch of this badge count while the modal is closed — a short
    // poll keeps it honest without needing a dedicated invalidation path
    // for every place a message could arrive.
    refetchInterval: 30_000,
  });
}

export function useLoanChat(loanId: string | null) {
  return useQuery({
    queryKey: ["chat", "loan", loanId],
    queryFn: () => api.getLoanChat(loanId as string),
    enabled: !!loanId,
  });
}

export function useSendChatMessage(loanId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ message, file }: { message: string; file?: File }) =>
      api.postChatMessage(loanId, message, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat", "loan", loanId] });
      qc.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to send message."),
  });
}

export function useAdminChat() {
  return useQuery({
    queryKey: ["chat", "admin"],
    queryFn: api.getAdminChat,
  });
}

export function useSendAdminChatMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ message, file }: { message: string; file?: File }) =>
      api.postAdminChatMessage(message, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat", "admin"] });
      qc.invalidateQueries({ queryKey: ["chat", "unread-count"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to send message."),
  });
}
