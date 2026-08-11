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
      duration?: number | null;
      duration_days?: number | null;
      required_documents?: string[];
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

export function useUpdateOfferTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.updateOfferTemplate>[1] }) =>
      api.updateOfferTemplate(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lender", "offer-templates"] }),
    onError: (err: Error) => toast.error(err.message || "Failed to update offer"),
  });
}

export function useDeleteOfferTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteOfferTemplate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lender", "offer-templates"] }),
    onError: (err: Error) => toast.error(err.message || "Failed to delete offer"),
  });
}

export function useFreezeMyOfferTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.freezeMyOfferTemplate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lender", "offer-templates"] }),
    onError: (err: Error) => toast.error(err.message || "Failed to freeze offer"),
  });
}

export function useUnfreezeMyOfferTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.unfreezeMyOfferTemplate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lender", "offer-templates"] }),
    onError: (err: Error) => toast.error(err.message || "Failed to unfreeze offer"),
  });
}

export function useExtendOfferTemplateExpiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, validUntil }: { id: string; validUntil: string | null }) =>
      api.extendOfferTemplateExpiry(id, validUntil),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lender", "offer-templates"] }),
    onError: (err: Error) => toast.error(err.message || "Failed to update expiry"),
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

export function useApproveDisbursement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (loanId: string) => api.approveDisbursement(loanId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lender", "active-loans"] });
      qc.invalidateQueries({ queryKey: ["lender", "earnings"] });
      qc.invalidateQueries({ queryKey: ["lender", "wallet"] });
      qc.invalidateQueries({ queryKey: ["lender", "transactions"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to approve disbursement"),
  });
}

export function useLenderLoanDetail(loanId: string) {
  return useQuery({
    queryKey: ["lender", "loan-detail", loanId],
    queryFn: () => api.getLoanDetail(loanId),
    enabled: !!loanId,
  });
}
