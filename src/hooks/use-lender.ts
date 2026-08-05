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

export function useMarketplaceBorrowers() {
  return useQuery({
    queryKey: ["lender", "marketplace"],
    queryFn: api.getMarketplaceBorrowers,
  });
}

export function useBorrowerProfile(id: string) {
  return useQuery({
    queryKey: ["lender", "borrower", id],
    queryFn: () => api.getBorrowerProfile(id),
  });
}

export function useMakeOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      borrowerId,
      data,
    }: {
      borrowerId: string;
      data: Record<string, unknown>;
    }) => api.makeOffer(borrowerId, data),
    onSuccess: () => {
      toast.success("Offer sent successfully!");
      qc.invalidateQueries({ queryKey: ["lender"] });
    },
    onError: () => toast.error("Failed to send offer"),
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
