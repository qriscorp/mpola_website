"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useDraftApplication() {
  return useQuery({
    queryKey: ["applications", "draft"],
    queryFn: api.getDraftApplication,
  });
}

export function useSubmitApplication() {
  return useMutation({
    mutationFn: (data: {
      amount: number;
      duration: number;
      loan_type: string;
      purpose?: string;
      max_interest_rate?: number;
      valid_until?: string;
    }) => api.submitApplication(data),
    onError: (err: Error) => {
      toast.error(err.message || "Failed to submit application.");
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        amount: number;
        duration: number;
        loan_type: string;
        purpose: string;
        max_interest_rate: number | null;
        valid_until: string | null;
      }>;
    }) => api.updateApplication(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update request.");
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteApplication(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
    onError: (err: Error) => {
      toast.error(err.message || "Failed to withdraw request.");
    },
  });
}

export function useFreezeApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.freezeApplication(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
    onError: (err: Error) => {
      toast.error(err.message || "Failed to freeze request.");
    },
  });
}

export function useUnfreezeApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.unfreezeApplication(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
    onError: (err: Error) => {
      toast.error(err.message || "Failed to unfreeze request.");
    },
  });
}

export function useUploadDocument() {
  return useMutation({
    mutationFn: ({
      applicationId,
      file,
      documentType,
    }: {
      applicationId: string;
      file: File;
      documentType: string;
    }) => api.uploadDocument(applicationId, file, documentType),
    onError: (err: Error) => {
      toast.error(err.message || "Upload failed. Please try again.");
    },
  });
}
