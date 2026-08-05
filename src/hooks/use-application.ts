"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useSubmitApplication() {
  return useMutation({
    mutationFn: (data: {
      amount: number;
      duration: number;
      loan_type: string;
      purpose?: string;
    }) => api.submitApplication(data),
    onError: (err: Error) => {
      toast.error(err.message || "Failed to submit application.");
    },
  });
}

export function useAddGuarantor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: { name: string; phone: string; relationship_type?: string };
    }) => api.addGuarantor(applicationId, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["application", variables.applicationId],
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to add guarantor.");
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
