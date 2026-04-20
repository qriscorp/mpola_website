"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useLenders() {
  return useQuery({
    queryKey: ["lenders"],
    queryFn: api.getLenders,
  });
}

export function useGuarantors() {
  return useQuery({
    queryKey: ["guarantors"],
    queryFn: api.getGuarantors,
  });
}

export function useSubmitApplication() {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.submitApplication(data),
    onSuccess: () => {
      toast.success("Application submitted successfully!");
    },
    onError: () => {
      toast.error("Failed to submit application.");
    },
  });
}

export function useUploadDocument() {
  return useMutation({
    mutationFn: ({ file, key }: { file: File; key: string }) =>
      api.uploadDocument(file, key),
    onSuccess: () => {
      toast.success("Document uploaded successfully.");
    },
    onError: () => {
      toast.error("Upload failed. Please try again.");
    },
  });
}
