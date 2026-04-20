"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useInstalments(loanId?: string) {
  return useQuery({
    queryKey: ["instalments", loanId],
    queryFn: () => api.getInstalments(loanId),
  });
}
