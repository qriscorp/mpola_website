"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { pollUntilResolved } from "@/lib/poll";
import type { TransferStatusResult } from "@/lib/types";

/** All wallet queries invalidated together — borrower and lender share one wallet. */
const WALLET_KEYS = [
  ["wallet"],
  ["lender", "wallet"],
  ["transactions"],
  ["lender", "transactions"],
] as const;

export function useWallet() {
  return useQuery({
    queryKey: ["wallet"],
    queryFn: api.getWallet,
  });
}

export function useTransactions(page: number = 1, pageSize: number = 20) {
  return useQuery({
    queryKey: ["transactions", page, pageSize],
    queryFn: () => api.getTransactions(page, pageSize),
  });
}

/** Shared by both portals — wallet setup isn't role-specific. */
export function useSetupWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pin: string) => api.setupWallet(pin),
    onSuccess: () => {
      toast.success("Wallet set up successfully!");
      WALLET_KEYS.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key }),
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || "Wallet setup failed. Please try again.");
    },
  });
}

function notifyTransferResult(result: TransferStatusResult, action: string) {
  if (result.status === "completed") {
    toast.success(
      result.fee
        ? `${action} successful! UGX ${result.fee.toLocaleString()} fee charged.`
        : `${action} successful!`,
    );
  } else if (result.status === "failed") {
    toast.error(`${action} failed.`);
  } else {
    toast.info(
      `Still waiting on confirmation for your ${action.toLowerCase()} — check back shortly.`,
    );
  }
}

export function useDepositMobileMoney() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { amount: number; phone: string; carrier?: string }) =>
      api.depositMobileMoney(data),
    onSuccess: () => {
      toast.success("Deposit successful!");
      WALLET_KEYS.forEach((key) => qc.invalidateQueries({ queryKey: key }));
    },
    onError: (err: Error) => toast.error(err.message || "Deposit failed."),
  });
}

export function useWithdrawMobileMoney() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { amount: number; phone: string; carrier?: string }) =>
      api.withdrawMobileMoney(data),
    onSuccess: (result) => {
      toast.success(
        `Withdrawal successful! UGX ${result.fee.toLocaleString()} fee charged.`,
      );
      WALLET_KEYS.forEach((key) => qc.invalidateQueries({ queryKey: key }));
    },
    onError: (err: Error) => toast.error(err.message || "Withdrawal failed."),
  });
}

/** Opens the Flutterwave hosted checkout, then polls until it resolves. */
export function useCardDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { amount: number; redirect_url: string }) => {
      const { checkout_url, reference } = await api.initiateCardDeposit(data);
      const popup = window.open(checkout_url, "_blank", "noopener,noreferrer");
      if (!popup) {
        window.location.href = checkout_url;
      }
      return pollUntilResolved(() => api.getCardDepositStatus(reference));
    },
    onSuccess: (result) => {
      notifyTransferResult(result, "Card deposit");
      WALLET_KEYS.forEach((key) => qc.invalidateQueries({ queryKey: key }));
    },
    onError: (err: Error) => toast.error(err.message || "Card deposit failed."),
  });
}

export function useBanks(countryCode: string = "UG") {
  return useQuery({
    queryKey: ["wallet", "banks", countryCode],
    queryFn: () => api.getBanks(countryCode),
  });
}

/** Initiates a Flutterwave bank payout, then polls until it resolves. */
export function useBankWithdraw() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      amount: number;
      account_bank: string;
      account_number: string;
      beneficiary_name: string;
      narration?: string;
    }) => {
      const { reference } = await api.initiateBankWithdraw(data);
      return pollUntilResolved(() => api.getBankWithdrawStatus(reference));
    },
    onSuccess: (result) => {
      notifyTransferResult(result, "Bank transfer");
      WALLET_KEYS.forEach((key) => qc.invalidateQueries({ queryKey: key }));
    },
    onError: (err: Error) =>
      toast.error(err.message || "Bank transfer failed."),
  });
}
