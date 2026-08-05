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
