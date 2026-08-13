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

function clearSignupDraftCookies() {
  document.cookie = "lf_signup_flow=; path=/; max-age=0";
  document.cookie = "lf_signup_draft=; path=/; max-age=0";
  document.cookie = "lf_signup_role=; path=/; max-age=0";
  document.cookie = "lf_signup_email=; path=/; max-age=0";
  document.cookie = "lf_signup_phone=; path=/; max-age=0";
  document.cookie = "lf_signup_email_verified=; path=/; max-age=0";
  document.cookie = "lf_signup_phone_verified=; path=/; max-age=0";
  document.cookie = "lf_signup_form_draft=; path=/; max-age=0";
}

function resolveSignupDraftRoute(
  draft?: {
    next_step?: string;
    role?: string;
    email_verified?: boolean;
    phone_verified?: boolean;
    is_completed?: boolean;
  },
  fallbackRole?: string,
): string {
  const role =
    draft?.role || fallbackRole || getCookie("lf_signup_role") || "borrower";

  if (draft?.is_completed) {
    return role === "lender" ? "/auth/lender-signin" : "/auth/signin";
  }

  if (draft?.next_step === "verify_phone") {
    return "/auth/verify-phone";
  }
  if (draft?.next_step === "verify_email") {
    return "/auth/verify-email";
  }

  if (draft?.email_verified === true && draft?.phone_verified !== true) {
    return "/auth/verify-phone";
  }

  // Default to email verification whenever signup flow hints exist.
  if (
    getCookie("lf_signup_draft") ||
    getCookie("lf_signup_flow") === "true" ||
    getCookie("lf_signup_email")
  ) {
    return "/auth/verify-email";
  }

  return role === "lender" ? "/auth/lender-signin" : "/auth/signin";
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
  const isAdmin =
    role === "admin" || role === "super_admin" || getCookie("lf_is_admin") === "true";
  if (isAdmin) return "/admin";
  return role === "lender" ? "/lender" : "/dashboard";
}

/** The page a 401 (session expiry) or a guarded route sent them away from —
 * set as `?redirect=` on the sign-in URL. Only ever a same-origin path. */
function getRedirectParam(): string | null {
  if (typeof window === "undefined") return null;
  const redirect = new URLSearchParams(window.location.search).get("redirect");
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }
  return null;
}

/** Where to actually land after a successful sign-in — honors `?redirect=`
 * so a session-expiry round trip drops the user back where they were,
 * but only once required verification steps are out of the way. */
function resolvePostAuthDestination(role: string): string {
  const computed = getPostAuthRoute(role);
  if (computed === "/auth/verify-email" || computed === "/auth/verify-phone") {
    return computed;
  }
  return getRedirectParam() ?? computed;
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
    onSuccess: (result) => {
      if (result.requires2FA) return; // caller shows the 2FA code modal instead
      toast.success("Welcome back!");
      const role = getCookie("lf_role") || "borrower";
      router.push(resolvePostAuthDestination(role));
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid credentials. Please try again.");
    },
  });
}

export function useVerifyLogin2FA() {
  const router = useRouter();
  return useMutation({
    mutationFn: ({ username, code }: { username: string; code: string }) =>
      api.verifyLogin2FA(username, code),
    onSuccess: () => {
      toast.success("Welcome back!");
      const role = getCookie("lf_role") || "borrower";
      router.push(resolvePostAuthDestination(role));
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid code. Please try again.");
    },
  });
}

export function useRegister() {
  const router = useRouter();
  return useMutation({
    mutationFn: (
      data:
        | (RegisterIndividualFormData & { role?: "borrower" | "lender"; referredByCode?: string })
        | (RegisterBusinessFormData & { role?: "borrower" | "lender"; referredByCode?: string }),
    ) => api.register(data as unknown as Record<string, unknown>),
    onSuccess: (data) => {
      const role = data.draft?.role || getCookie("lf_signup_role") || "borrower";
      if (data.account_created || data.draft?.is_completed) {
        toast.success("Registration started. Please sign in.");
        router.push(role === "lender" ? "/auth/lender-signin" : "/auth/signin");
        return;
      }
      const dest = resolveSignupDraftRoute(data.draft, role);
      toast.success(
        dest === "/auth/verify-phone"
          ? "Registration started. Please verify your phone."
          : "Registration started. Please verify your email.",
      );
      router.push(dest);
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
    onSuccess: (result) => {
      if (result.requires2FA) return; // caller shows the 2FA code modal instead
      toast.success("Welcome back!");
      const role = getCookie("lf_role") || "lender";
      router.push(resolvePostAuthDestination(role));
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
    onSuccess: (data) => {
      const role = data.draft?.role || getCookie("lf_signup_role") || "lender";
      if (data.account_created || data.draft?.is_completed) {
        toast.success("Registration started. Please sign in.");
        router.push(role === "lender" ? "/auth/lender-signin" : "/auth/signin");
        return;
      }
      const dest = resolveSignupDraftRoute(data.draft, role);
      toast.success(
        dest === "/auth/verify-phone"
          ? "Registration started. Please verify your phone."
          : "Registration started. Please verify your email.",
      );
      router.push(dest);
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
    onSuccess: (data) => {
      toast.success("Email verified!");
      const role = data.draft?.role || getCookie("lf_signup_role") || "borrower";
      if (data.account_created || data.draft?.is_completed) {
        clearSignupDraftCookies();
        router.push(role === "lender" ? "/auth/lender-signin" : "/auth/signin");
        return;
      }
      router.push(resolveSignupDraftRoute(data.draft, role));
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
    onSuccess: (data) => {
      const role = data.draft?.role || getCookie("lf_signup_role") || "borrower";

      if (data.account_created || data.draft?.is_completed) {
        clearSignupDraftCookies();
        toast.success("Account verified! Please sign in to continue.");
        router.push(role === "lender" ? "/auth/lender-signin" : "/auth/signin");
        return;
      }

      router.push(resolveSignupDraftRoute(data.draft, role));
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
    mutationFn: ({
      email,
      phoneNumber,
      portal,
    }: {
      email: string;
      phoneNumber: string;
      portal?: "borrower" | "lender";
    }) => api.sendPasswordResetCode(email, phoneNumber, portal),
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
      const user = data.user!; // login OTP verification always returns a user
      const role = user.role;
      // Only a legacy pure-admin account (role itself is admin/super_admin,
      // no real borrower/lender identity) is exempt from this check. A
      // dual-role account (e.g. borrower + admin) still has exactly one true
      // portal and must sign in through the matching form — is_admin does
      // NOT bypass that (matches backend _enforce_portal_role).
      const isPureAdmin = role === "admin" || role === "super_admin";
      const isLenderRole = role === "lender";

      if (!isPureAdmin) {
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
      router.push(resolvePostAuthDestination(role));
    },
    onError: (error: Error) => {
      toast.error(error.message || "Invalid code. Please try again.");
    },
  });
}
