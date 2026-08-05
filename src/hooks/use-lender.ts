import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function useLenderProfile() {
  return useQuery({
    queryKey: ["lender", "profile"],
    queryFn: api.getLenderProfile,
  });
}

export function useLenderDashboardStats() {
  return useQuery({
    queryKey: ["lender", "stats"],
    queryFn: api.getLenderDashboardStats,
  });
}

export function useBorrowerActivities() {
  return useQuery({
    queryKey: ["lender", "activities"],
    queryFn: api.getBorrowerActivities,
  });
}

export function useMarketplace(filters?: {
  loan_type?: string;
  min_amount?: number;
  max_amount?: number;
}) {
  return useQuery({
    queryKey: ["lender", "marketplace", filters],
    queryFn: () => api.getMarketplace(filters),
  });
}

export function useApplicationDetail(id: string) {
  return useQuery({
    queryKey: ["application", id],
    queryFn: () => api.getApplicationDetail(id),
    enabled: !!id,
  });
}

export function useMyOffers() {
  return useQuery({
    queryKey: ["lender", "offers"],
    queryFn: api.getMyOffers,
  });
}

export function useMakeOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      application_id: string;
      amount: number;
      interest_rate: number;
      duration: number;
    }) => api.makeOffer(data),
    onSuccess: (_result, variables) => {
      toast.success("Offer sent successfully!");
      qc.invalidateQueries({ queryKey: ["lender", "marketplace"] });
      qc.invalidateQueries({
        queryKey: ["application", variables.application_id],
      });
      qc.invalidateQueries({ queryKey: ["lender", "offers"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to send offer"),
  });
}

export function useLenderWallet() {
  return useQuery({
    queryKey: ["lender", "wallet"],
    queryFn: api.getLenderWallet,
  });
}

export function useLenderTransactions() {
  return useQuery({
    queryKey: ["lender", "transactions"],
    queryFn: api.getLenderTransactions,
  });
}

export function useLenderEarnings() {
  return useQuery({
    queryKey: ["lender", "earnings"],
    queryFn: api.getLenderEarnings,
  });
}
