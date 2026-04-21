"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type {
  SignInFormData,
  RegisterIndividualFormData,
  RegisterBusinessFormData,
} from "@/lib/schemas";

/** Read a cookie by name (client-side only). */
function getCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`))
    ?.split("=")[1];
}

/**
 * After a successful auth response the cookies are already written by storeTokens.
 * Decide where to send the user based on verification status.
 */
function getPostAuthRoute(role: string): string {
  const verified = getCookie("lf_verified");
  const phoneVerified = getCookie("lf_phone_verified");
  if (verified !== "true") return "/auth/verify-email";
  if (phoneVerified !== "true") return "/auth/verify-phone";
  return role === "lender" ? "/lender" : "/dashboard";
}

export function useSignIn() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: SignInFormData) =>
      api.signIn({ phoneOrEmail: data.phoneOrEmail, password: data.password }),
    onSuccess: () => {
      toast.success("Welcome back!");
      const role = getCookie("lf_role") || "borrower";
      router.push(getPostAuthRoute(role));
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid credentials. Please try again.");
    },
  });
}

export function useRegister() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: RegisterIndividualFormData | RegisterBusinessFormData) =>
      api.register(data as unknown as Record<string, unknown>),
    onSuccess: () => {
      document.cookie = "lf_signup_flow=true; path=/";
      toast.success("Account created! Please verify your email.");
      router.push("/auth/verify-email");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Registration failed. Please try again.");
    },
  });
}

export function useLenderSignIn() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: { phoneOrEmail: string; password: string }) =>
      api.lenderSignIn(data),
    onSuccess: () => {
      toast.success("Welcome back!");
      router.push(getPostAuthRoute("lender"));
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid credentials. Please try again.");
    },
  });
}

export function useLenderRegister() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.lenderRegister(data),
    onSuccess: () => {
      document.cookie = "lf_signup_flow=true; path=/";
      toast.success("Lender account created! Please verify your email.");
      router.push("/auth/verify-email");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Registration failed. Please try again.");
    },
  });
}

export function useSignOut() {
  const router = useRouter();
  return () => {
    api.signOut();
    router.push("/");
  };
}

// ─── OTP hooks ───────────────────────────────────────────────

export function useSendOtp() {
  return useMutation({
    mutationFn: (username: string) => api.sendOtp(username),
    onSuccess: () => {
      toast.success("Verification code sent to your email!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send OTP. Please try again.");
    },
  });
}

export function useVerifyOtp() {
  const router = useRouter();
  return useMutation({
    mutationFn: ({ username, code }: { username: string; code: string }) =>
      api.verifyOtp(username, code),
    onSuccess: () => {
      toast.success("Email verified!");
      router.push("/auth/verify-phone");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid code. Please try again.");
    },
  });
}

export function useSendPhoneOtp() {
  return useMutation({
    mutationFn: ({
      username,
      phoneNumber,
    }: {
      username: string;
      phoneNumber: string;
    }) => api.sendPhoneOtp(username, phoneNumber),
    onSuccess: () => {
      toast.success("Verification code sent to your phone!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send SMS. Please try again.");
    },
  });
}

export function useVerifyPhoneOtp() {
  const router = useRouter();
  return useMutation({
    mutationFn: ({
      username,
      phoneNumber,
      code,
    }: {
      username: string;
      phoneNumber: string;
      code: string;
    }) => api.verifyPhoneOtp(username, phoneNumber, code),
    onSuccess: () => {
      const isSignupFlow = getCookie("lf_signup_flow") === "true";
      if (isSignupFlow) {
        document.cookie = "lf_signup_flow=; path=/; max-age=0";
        toast.success("Account verified! Please sign in to continue.");
        router.push("/auth/signin");
      } else {
        toast.success("Phone verified! Your account is ready.");
        const role = getCookie("lf_role") || "borrower";
        router.push(role === "lender" ? "/lender" : "/dashboard");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid code. Please try again.");
    },
  });
}
