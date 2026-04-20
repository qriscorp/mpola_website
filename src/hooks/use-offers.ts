"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useOffers(applicationId?: string) {
  return useQuery({
    queryKey: ["offers", applicationId],
    queryFn: () => api.getOffers(applicationId),
  });
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offerId: string) => api.acceptOffer(offerId),
    onSuccess: () => {
      toast.success("Offer accepted! Funds will be disbursed shortly.");
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: () => {
      toast.error("Failed to accept offer. Please try again.");
    },
  });
}
