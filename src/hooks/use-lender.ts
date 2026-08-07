import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function useMarketplace(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    loan_type?: string;
    min_amount?: number;
    max_amount?: number;
  },
) {
  return useQuery({
    queryKey: ["lender", "marketplace", page, pageSize, filters],
    queryFn: () => api.getMarketplace(page, pageSize, filters),
  });
}

export function useSkipApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) => api.skipApplication(applicationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lender", "marketplace"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to hide application"),
  });
}

export function useApplicationDetail(id: string) {
  return useQuery({
    queryKey: ["application", id],
    queryFn: () => api.getApplicationDetail(id),
    enabled: !!id,
  });
}

export function useApplicationDocuments(id: string) {
  return useQuery({
    queryKey: ["application", id, "documents"],
    queryFn: () => api.getApplicationDocuments(id),
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

export function useCreateOfferTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createOfferTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lender", "offer-templates"] }),
    onError: (err: Error) =>
      toast.error(err.message || "Failed to save offer"),
  });
}

export function useOfferTemplates() {
  return useQuery({
    queryKey: ["lender", "offer-templates"],
    queryFn: api.getOfferTemplates,
  });
}

export function useLenderWallet() {
  return useQuery({
    queryKey: ["lender", "wallet"],
    queryFn: api.getLenderWallet,
  });
}

export function useLenderTransactions(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ["lender", "transactions", page, pageSize],
    queryFn: () => api.getLenderTransactions(page, pageSize),
  });
}

export function useLenderEarnings() {
  return useQuery({
    queryKey: ["lender", "earnings"],
    queryFn: api.getLenderEarnings,
  });
}

export function useLenderActiveLoans() {
  return useQuery({
    queryKey: ["lender", "active-loans"],
    queryFn: api.getMyActiveLoans,
  });
}

export function useLenderLoanDetail(loanId: string) {
  return useQuery({
    queryKey: ["lender", "loan-detail", loanId],
    queryFn: () => api.getLoanDetail(loanId),
    enabled: !!loanId,
  });
}
