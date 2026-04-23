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
  if (role === "admin" || role === "super_admin") return "/admin";
  return role === "lender" ? "/lender" : "/dashboard";
}

export function useSignIn() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: SignInFormData) =>
      api.signIn({
        phoneOrEmail: data.phoneOrEmail,
        password: data.password,
        portal: "borrower",
      }),
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
    mutationFn: (
      data:
        | (RegisterIndividualFormData & { role?: "borrower" | "lender" })
        | (RegisterBusinessFormData & { role?: "borrower" | "lender" }),
    ) => api.register(data as unknown as Record<string, unknown>),
    onSuccess: () => {
      toast.success("Registration started. Please verify your email.");
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
      api.lenderSignIn({
        phoneOrEmail: data.phoneOrEmail,
        password: data.password,
      }),
    onSuccess: () => {
      toast.success("Welcome back!");
      const role = getCookie("lf_role") || "lender";
      router.push(getPostAuthRoute(role));
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid credentials. Please try again.");
    },
  });
}

export function useLenderRegister() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.register({ ...data, role: "lender" }),
    onSuccess: () => {
      toast.success("Registration started. Please verify your email.");
      router.push("/auth/verify-email");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Registration failed. Please try again.");
    },
  });
}

export function useSendSignupEmailOtp() {
  return useMutation({
    mutationFn: (draftId: string) => api.sendSignupEmailOtp(draftId),
    onSuccess: () => {
      toast.success("Verification code sent to your email!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send OTP. Please try again.");
    },
  });
}

export function useVerifySignupEmailOtp() {
  const router = useRouter();
  return useMutation({
    mutationFn: ({ draftId, code }: { draftId: string; code: string }) =>
      api.verifySignupEmailOtp(draftId, code),
    onSuccess: () => {
      toast.success("Email verified!");
      router.push("/auth/verify-phone");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid code. Please try again.");
    },
  });
}

export function useSendSignupPhoneOtp() {
  return useMutation({
    mutationFn: ({
      draftId,
      phoneNumber,
    }: {
      draftId: string;
      phoneNumber: string;
    }) => api.sendSignupPhoneOtp(draftId, phoneNumber),
    onSuccess: () => {
      toast.success("Verification code sent to your phone!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send SMS. Please try again.");
    },
  });
}

export function useVerifySignupPhoneOtp() {
  const router = useRouter();
  return useMutation({
    mutationFn: ({
      draftId,
      phoneNumber,
      code,
    }: {
      draftId: string;
      phoneNumber: string;
      code: string;
    }) => api.verifySignupPhoneOtp(draftId, phoneNumber, code),
    onSuccess: () => {
      const role = getCookie("lf_signup_role") || "borrower";
      document.cookie = "lf_signup_flow=; path=/; max-age=0";
      document.cookie = "lf_signup_draft=; path=/; max-age=0";
      document.cookie = "lf_signup_role=; path=/; max-age=0";
      document.cookie = "lf_signup_email=; path=/; max-age=0";
      document.cookie = "lf_signup_phone=; path=/; max-age=0";
      document.cookie = "lf_signup_email_verified=; path=/; max-age=0";
      document.cookie = "lf_signup_phone_verified=; path=/; max-age=0";
      toast.success("Account verified! Please sign in to continue.");
      router.push(role === "lender" ? "/auth/lender-signin" : "/auth/signin");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid code. Please try again.");
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

// ─── Forgot-password hooks ────────────────────────────────

export function useSendPasswordResetCode() {
  return useMutation({
    mutationFn: (identifier: string) => api.sendPasswordResetCode(identifier),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send reset code.");
    },
  });
}

export function useVerifyPasswordResetCode() {
  return useMutation({
    mutationFn: ({ identifier, code }: { identifier: string; code: string }) =>
      api.verifyPasswordResetCode(identifier, code),
    onError: (error: Error) => {
      toast.error(error.message || "Invalid code. Please try again.");
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({
      newPassword,
      accessToken,
    }: {
      newPassword: string;
      accessToken: string;
    }) => api.resetPassword(newPassword, accessToken),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reset password.");
    },
  });
}

// ─── Sign-in with phone OTP hooks ────────────────────────

export function useSendLoginPhoneOtp() {
  return useMutation({
    mutationFn: (phoneNumber: string) => api.sendLoginPhoneOtp(phoneNumber),
    onSuccess: () => {
      toast.success("If this number is registered, a code has been sent.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send OTP. Please try again.");
    },
  });
}

export function useVerifyLoginPhoneOtp(portal?: "borrower" | "lender") {
  const router = useRouter();
  return useMutation({
    mutationFn: ({
      phoneNumber,
      code,
    }: {
      phoneNumber: string;
      code: string;
    }) => api.verifyLoginPhoneOtp(phoneNumber, code, portal),
    onSuccess: (data) => {
      const role = data.user.role;
      const isAdmin = role === "admin" || role === "super_admin";
      const isLenderRole = role === "lender" || isAdmin;

      // Admins can sign in from either portal — skip portal enforcement for them
      if (!isAdmin) {
        if (portal === "borrower" && isLenderRole) {
          api.signOut();
          toast.error(
            "This number belongs to a lender account. Please sign in from the Lender portal.",
          );
          return;
        }
        if (portal === "lender" && !isLenderRole) {
          api.signOut();
          toast.error(
            "This number belongs to a borrower account. Please sign in from the Borrower portal.",
          );
          return;
        }
      }

      toast.success("Signed in!");
      router.push(getPostAuthRoute(role));
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid code. Please try again.");
    },
  });
}
