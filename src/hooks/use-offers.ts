"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useRespondToOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      offerId,
      status,
    }: {
      offerId: string;
      applicationId: string;
      status: "accepted" | "declined";
    }) => api.respondToOffer(offerId, status),
    onSuccess: (_result, variables) => {
      if (variables.status === "accepted") {
        toast.success("Offer accepted! The lender has been notified to approve and release the funds.");
      } else {
        toast.success("Offer declined.");
      }
      queryClient.invalidateQueries({
        queryKey: ["application", variables.applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["active-loan"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to respond to offer. Please try again.");
    },
  });
}
