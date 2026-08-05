"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useWallet() {
  return useQuery({
    queryKey: ["wallet"],
    queryFn: api.getWallet,
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: api.getTransactions,
  });
}

/** Shared by both portals — wallet setup isn't role-specific. */
export function useSetupWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pin: string) => api.setupWallet(pin),
    onSuccess: () => {
      toast.success("Wallet set up successfully!");
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["lender", "wallet"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Wallet setup failed. Please try again.");
    },
  });
}

export function useTopUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { amount: number; method: string; phone: string }) =>
      api.topUp(data),
    onSuccess: () => {
      toast.success("Top-up successful!");
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: () => {
      toast.error("Top-up failed. Please try again.");
    },
  });
}
