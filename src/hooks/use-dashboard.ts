"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { KYCDocumentType, BorrowerDocumentType } from "@/lib/types";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: api.getUser,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateProfile,
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update profile"),
  });
}

export function useMyKycDocuments() {
  return useQuery({
    queryKey: ["kyc-documents"],
    queryFn: api.getMyKycDocuments,
  });
}

export function useUploadKycDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ documentType, file }: { documentType: KYCDocumentType; file: File }) =>
      api.uploadKycDocument(documentType, file),
    onSuccess: () => {
      toast.success("Document uploaded");
      qc.invalidateQueries({ queryKey: ["kyc-documents"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to upload document"),
  });
}

export function useMyBorrowerDocuments() {
  return useQuery({
    queryKey: ["borrower-documents"],
    queryFn: api.getMyBorrowerDocuments,
  });
}

export function useUploadBorrowerDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ documentType, file }: { documentType: BorrowerDocumentType; file: File }) =>
      api.uploadBorrowerDocument(documentType, file),
    onSuccess: () => {
      toast.success("Document uploaded");
      qc.invalidateQueries({ queryKey: ["borrower-documents"] });
      // A newly-uploaded document can be exactly what an already-received
      // offer was waiting on — refresh so its accept-gate re-evaluates.
      qc.invalidateQueries({ queryKey: ["borrower", "offers-received"] });
      qc.invalidateQueries({ queryKey: ["application"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to upload document"),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: api.getDashboardStats,
  });
}

export function useActiveLoan() {
  return useQuery({
    queryKey: ["active-loan"],
    queryFn: api.getActiveLoan,
  });
}

export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: api.getApplications,
  });
}

export function useRecentNotifications(limit = 3) {
  return useQuery({
    queryKey: ["recent-notifications", limit],
    queryFn: () => api.getRecentNotifications(limit),
  });
}
