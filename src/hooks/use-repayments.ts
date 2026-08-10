"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useLoanDetail(loanId: string | undefined) {
  return useQuery({
    queryKey: ["loan", loanId],
    queryFn: () => api.getLoanDetail(loanId as string),
    enabled: !!loanId,
  });
}

export function useMyRepayments(skip = 0, limit = 20) {
  return useQuery({
    queryKey: ["repayments", "mine", skip, limit],
    queryFn: () => api.getMyRepayments(skip, limit),
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
    // No toasts here — the pay page navigates to a dedicated
    // success/failure confirmation screen for both outcomes instead.
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["active-loan"] });
      queryClient.invalidateQueries({ queryKey: ["loan", variables.loan_id] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["repayments", "mine"] });
    },
  });
}
