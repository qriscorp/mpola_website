"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useLoanDetail(loanId: string | undefined) {
  return useQuery({
    queryKey: ["loan", loanId],
    queryFn: () => api.getLoanDetail(loanId as string),
    enabled: !!loanId,
  });
}

export function useMakeRepayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      loan_id: string;
      amount: number;
      payment_method: "wallet" | "mobile_money";
      phone_number?: string;
      carrier?: string;
    }) => api.makeRepayment(data),
    onSuccess: (_result, variables) => {
      toast.success("Payment successful!");
      queryClient.invalidateQueries({ queryKey: ["active-loan"] });
      queryClient.invalidateQueries({ queryKey: ["loan", variables.loan_id] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Payment failed. Please try again.");
    },
  });
}
