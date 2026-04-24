import {
  currentUser,
  dashboardStats,
  activeLoan,
  applications,
  loanOffers,
  lenders,
  guarantors,
  instalments,
  walletTransactions,
  notifications,
  adminStats,
  adminUsers,
  adminLoans,
  adminApplications,
  lenderProfile,
  lenderDashboardStats,
  borrowerActivities,
  marketplaceBorrowers,
  borrowerProfileData,
  lenderWalletTransactions,
  lenderEarnings,
} from "./dummy-data";
import { API_BASE_URL } from "./constants";
import type {
  User,
  DashboardStats,
  ActiveLoan,
  LoanApplication,
  LoanOffer,
  Lender,
  Guarantor,
  Instalment,
  WalletTransaction,
  Notification,
  AdminStats,
  AdminUser,
  AdminLoan,
  AdminApplication,
  LenderProfile,
  LenderDashboardStats,
  BorrowerActivity,
  MarketplaceBorrower,
  BorrowerProfile,
  LenderWalletTransaction,
  LenderEarnings,
} from "./types";

// Simulated API delay
const delay = (ms: number = 500) => new Promise((r) => setTimeout(r, ms));

// ─── Real API helpers ────────────────────────────────────

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    phone_number: string;
    role: string;
    is_active: boolean;
    is_verified: boolean;
    is_phone_verified: boolean;
    is_kyc_verified: boolean;
    kyc_status: string;
    credit_score: number | null;
  };
  access_token: string;
  refresh_token: string;
}

export interface SignupDraftResponse {
  status: number;
  message: string;
  draft_id: string;
  email: string;
  phone_number?: string;
  role: "borrower" | "lender";
  account_created?: boolean;
  draft?: SignupDraftPayload;
}

export interface SignupDraftPayload {
  draft_id: string;
  email: string;
  phone_number?: string;
  role: "borrower" | "lender";
  email_verified: boolean;
  phone_verified: boolean;
  is_completed: boolean;
  next_step?: "verify_email" | "verify_phone" | "completed" | string;
}

export interface SignupDraftStatusResponse {
  status: number;
  message: string;
  account_created?: boolean;
  draft?: SignupDraftPayload;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ detail: "Request failed", message: "Request failed" }));
    throw new Error(err.detail || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

function mapAuthUser(data: AuthResponse): User {
  return {
    id: data.user.id,
    fullName: data.user.full_name || data.user.username,
    email: data.user.email,
    phone: data.user.phone_number || "",
    nin: "",
    accountType: "individual",
    kycStatus: (data.user.kyc_status as User["kycStatus"]) || "pending",
    location: "Uganda",
    createdAt: new Date().toISOString(),
  };
}

/** Store tokens — called after successful sign-in / register. */
function storeTokens(data: AuthResponse) {
  // Set HTTP-only-style cookie via document.cookie (15 min for access token)
  const maxAge = 15 * 60; // match JWT expiry
  const longAge = 7 * 24 * 60 * 60;
  document.cookie = `lf_token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `lf_refresh=${data.refresh_token}; path=/; max-age=${longAge}; SameSite=Lax`;
  document.cookie = `lf_role=${data.user.role}; path=/; max-age=${longAge}; SameSite=Lax`;
  document.cookie = `lf_verified=${data.user.is_verified}; path=/; max-age=${longAge}; SameSite=Lax`;
  document.cookie = `lf_phone_verified=${data.user.is_phone_verified}; path=/; max-age=${longAge}; SameSite=Lax`;
  document.cookie = `lf_username=${data.user.username}; path=/; max-age=${longAge}; SameSite=Lax`;
  document.cookie = `lf_email=${encodeURIComponent(data.user.email)}; path=/; max-age=${longAge}; SameSite=Lax`;
  if (data.user.phone_number) {
    document.cookie = `lf_phone=${data.user.phone_number}; path=/; max-age=${longAge}; SameSite=Lax`;
  }
}

function storeSignupDraft(
  data: SignupDraftResponse,
  payload?: Record<string, unknown>,
) {
  const longAge = 24 * 60 * 60;
  document.cookie = "lf_signup_form_draft=; path=/; max-age=0";
  document.cookie = `lf_signup_flow=true; path=/; max-age=${longAge}; SameSite=Lax`;
  document.cookie = `lf_signup_draft=${data.draft_id}; path=/; max-age=${longAge}; SameSite=Lax`;
  document.cookie = `lf_signup_role=${data.role}; path=/; max-age=${longAge}; SameSite=Lax`;
  document.cookie = `lf_signup_email=${encodeURIComponent(data.email)}; path=/; max-age=${longAge}; SameSite=Lax`;
  document.cookie = `lf_signup_email_verified=${data.draft?.email_verified ? "true" : "false"}; path=/; max-age=${longAge}; SameSite=Lax`;
  document.cookie = `lf_signup_phone_verified=${data.draft?.phone_verified ? "true" : "false"}; path=/; max-age=${longAge}; SameSite=Lax`;
  if (payload?.accountType) {
    document.cookie = `lf_signup_account_type=${String(payload.accountType)}; path=/; max-age=${longAge}; SameSite=Lax`;
  }
  if (payload?.fullName) {
    document.cookie = `lf_signup_full_name=${encodeURIComponent(String(payload.fullName))}; path=/; max-age=${longAge}; SameSite=Lax`;
  }
  if (payload?.nin) {
    document.cookie = `lf_signup_nin=${encodeURIComponent(String(payload.nin))}; path=/; max-age=${longAge}; SameSite=Lax`;
  }
  if (payload?.businessName) {
    document.cookie = `lf_signup_business_name=${encodeURIComponent(String(payload.businessName))}; path=/; max-age=${longAge}; SameSite=Lax`;
  }
  if (payload?.registrationNumber) {
    document.cookie = `lf_signup_registration_number=${encodeURIComponent(String(payload.registrationNumber))}; path=/; max-age=${longAge}; SameSite=Lax`;
  }
  if (data.phone_number) {
    document.cookie = `lf_signup_phone=${data.phone_number}; path=/; max-age=${longAge}; SameSite=Lax`;
  }
}

function storeSignupDraftFromPayload(draft: SignupDraftPayload) {
  const longAge = 24 * 60 * 60;
  document.cookie = `lf_signup_flow=true; path=/; max-age=${longAge}; SameSite=Lax`;
  document.cookie = `lf_signup_draft=${draft.draft_id}; path=/; max-age=${longAge}; SameSite=Lax`;
  document.cookie = `lf_signup_role=${draft.role}; path=/; max-age=${longAge}; SameSite=Lax`;
  document.cookie = `lf_signup_email=${encodeURIComponent(draft.email)}; path=/; max-age=${longAge}; SameSite=Lax`;
  document.cookie = `lf_signup_email_verified=${draft.email_verified ? "true" : "false"}; path=/; max-age=${longAge}; SameSite=Lax`;
  document.cookie = `lf_signup_phone_verified=${draft.phone_verified ? "true" : "false"}; path=/; max-age=${longAge}; SameSite=Lax`;
  if (draft.phone_number) {
    document.cookie = `lf_signup_phone=${draft.phone_number}; path=/; max-age=${longAge}; SameSite=Lax`;
  }
}

function clearSignupDraftCookies() {
  document.cookie = "lf_signup_flow=; path=/; max-age=0";
  document.cookie = "lf_signup_draft=; path=/; max-age=0";
  document.cookie = "lf_signup_role=; path=/; max-age=0";
  document.cookie = "lf_signup_email=; path=/; max-age=0";
  document.cookie = "lf_signup_phone=; path=/; max-age=0";
  document.cookie = "lf_signup_email_verified=; path=/; max-age=0";
  document.cookie = "lf_signup_phone_verified=; path=/; max-age=0";
  document.cookie = "lf_signup_account_type=; path=/; max-age=0";
  document.cookie = "lf_signup_full_name=; path=/; max-age=0";
  document.cookie = "lf_signup_nin=; path=/; max-age=0";
  document.cookie = "lf_signup_business_name=; path=/; max-age=0";
  document.cookie = "lf_signup_registration_number=; path=/; max-age=0";
  document.cookie = "lf_signup_form_draft=; path=/; max-age=0";
}

// Normalize phone: if user typed 9 digits, prepend 256
function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 9) return `256${digits}`;
  if (digits.startsWith("0") && digits.length === 10)
    return `256${digits.slice(1)}`;
  if (digits.startsWith("256") && digits.length === 12) return digits;
  return digits;
}

export const api = {
  // ─── Auth (REAL API) ─────────────────────────────────────

  signIn: async (data: {
    phoneOrEmail: string;
    password: string;
    portal?: "borrower" | "lender";
  }): Promise<User> => {
    // If input looks like a phone number, normalize it
    const identifier = /^\d{9,12}$/.test(data.phoneOrEmail.replace(/\D/g, ""))
      ? normalizePhone(data.phoneOrEmail)
      : data.phoneOrEmail;
    const res = await apiPost<AuthResponse>("/auth/login", {
      username: identifier,
      password: data.password,
      portal: data.portal,
    });
    storeTokens(res);
    return mapAuthUser(res);
  },

  register: async (
    data: Record<string, unknown>,
  ): Promise<SignupDraftResponse> => {
    const res = await apiPost<SignupDraftResponse>("/auth/register_start", {
      email: data.email,
      password: data.password,
      full_name: data.fullName,
      phone_number: normalizePhone(String(data.phone || "")),
      nin: data.nin,
      account_type: data.accountType || "individual",
      role: data.role || "borrower",
    });
    storeSignupDraft(res, data);
    if (res.draft) {
      storeSignupDraftFromPayload(res.draft);
    }
    return res;
  },

  lenderSignIn: async (data: {
    phoneOrEmail: string;
    password: string;
  }): Promise<User> => {
    const identifier = /^\d{9,12}$/.test(data.phoneOrEmail.replace(/\D/g, ""))
      ? normalizePhone(data.phoneOrEmail)
      : data.phoneOrEmail;
    const res = await apiPost<AuthResponse>("/auth/login", {
      username: identifier,
      password: data.password,
      portal: "lender",
    });
    if (
      res.user.role !== "lender" &&
      res.user.role !== "admin" &&
      res.user.role !== "super_admin"
    ) {
      throw new Error(
        "This portal is for lenders only. Please use the borrower sign-in.",
      );
    }
    storeTokens(res);
    return mapAuthUser(res);
  },

  lenderRegister: async (
    data: Record<string, unknown>,
  ): Promise<SignupDraftResponse> => {
    return api.register({ ...data, role: "lender" });
  },

  signOut: () => {
    document.cookie = "lf_token=; path=/; max-age=0";
    document.cookie = "lf_refresh=; path=/; max-age=0";
    document.cookie = "lf_role=; path=/; max-age=0";
    document.cookie = "lf_verified=; path=/; max-age=0";
    document.cookie = "lf_phone_verified=; path=/; max-age=0";
    document.cookie = "lf_username=; path=/; max-age=0";
    document.cookie = "lf_email=; path=/; max-age=0";
    document.cookie = "lf_phone=; path=/; max-age=0";
    clearSignupDraftCookies();
  },

  getSignupDraftStatus: async (
    draftId: string,
  ): Promise<SignupDraftStatusResponse> => {
    const res = await apiGet<SignupDraftStatusResponse>(
      `/auth/signup_draft/${draftId}`,
    );
    if (res.account_created || res.draft?.is_completed) {
      clearSignupDraftCookies();
    } else if (res.draft) {
      storeSignupDraftFromPayload(res.draft);
    }
    return res;
  },

  // ─── Signup Draft OTP Verification ──────────────────────

  sendSignupEmailOtp: async (
    draftId: string,
  ): Promise<SignupDraftStatusResponse> => {
    const res = await apiPost<SignupDraftStatusResponse>(
      "/auth/send_signup_email_otp",
      { draft_id: draftId },
    );
    if (res.account_created || res.draft?.is_completed) {
      clearSignupDraftCookies();
    } else if (res.draft) {
      storeSignupDraftFromPayload(res.draft);
    }
    return res;
  },

  verifySignupEmailOtp: async (
    draftId: string,
    code: string,
  ): Promise<SignupDraftStatusResponse> => {
    const res = await apiPost<SignupDraftStatusResponse>(
      "/auth/verify_signup_email_otp",
      {
        draft_id: draftId,
        code,
      },
    );
    if (res.account_created || res.draft?.is_completed) {
      clearSignupDraftCookies();
    } else if (res.draft) {
      storeSignupDraftFromPayload(res.draft);
    }
    return res;
  },

  sendSignupPhoneOtp: async (
    draftId: string,
    phoneNumber: string,
  ): Promise<SignupDraftStatusResponse> => {
    const normalizedPhone = normalizePhone(phoneNumber);
    const res = await apiPost<SignupDraftStatusResponse>(
      "/auth/send_signup_phone_otp",
      {
        draft_id: draftId,
        phone_number: normalizedPhone,
      },
    );
    if (res.account_created || res.draft?.is_completed) {
      clearSignupDraftCookies();
    } else if (res.draft) {
      storeSignupDraftFromPayload(res.draft);
    } else {
      document.cookie = `lf_signup_phone=${normalizedPhone}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
    }
    return res;
  },

  verifySignupPhoneOtp: async (
    draftId: string,
    phoneNumber: string,
    code: string,
  ): Promise<SignupDraftStatusResponse> => {
    const res = await apiPost<SignupDraftStatusResponse>(
      "/auth/verify_signup_phone_otp",
      {
        draft_id: draftId,
        phone_number: normalizePhone(phoneNumber),
        code,
      },
    );
    if (res.account_created || res.draft?.is_completed) {
      clearSignupDraftCookies();
    } else if (res.draft) {
      storeSignupDraftFromPayload(res.draft);
    }
    return res;
  },

  // ─── OTP / Verification ───────────────────────────────────

  sendOtp: async (
    username: string,
  ): Promise<{ status: number; message: string }> => {
    return apiPost("/auth/send_otp", { username });
  },

  verifyOtp: async (
    username: string,
    code: string,
  ): Promise<{ status: number; message: string }> => {
    const res = await apiPost<{ status: number; message: string }>(
      "/auth/verify_otp",
      {
        username,
        code,
      },
    );
    // Mark email as verified in cookie
    document.cookie = `lf_verified=true; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    return res;
  },

  sendPhoneOtp: async (
    username: string,
    phoneNumber: string,
  ): Promise<{ status: number; message: string }> => {
    return apiPost("/auth/send_phone_otp", {
      username,
      phone_number: normalizePhone(phoneNumber),
    });
  },

  verifyPhoneOtp: async (
    username: string,
    phoneNumber: string,
    code: string,
  ): Promise<{ status: number; message: string }> => {
    const res = await apiPost<{ status: number; message: string }>(
      "/auth/verify_phone_otp",
      {
        username,
        phone_number: normalizePhone(phoneNumber),
        code,
      },
    );
    // Mark phone as verified in cookie
    document.cookie = `lf_phone_verified=true; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    return res;
  },

  // ─── Forgot-password flow ─────────────────────────────

  sendPasswordResetCode: async (
    identifier: string,
  ): Promise<{ status: number; message: string }> => {
    return apiPost("/auth/send_password_reset_code", { identifier });
  },

  verifyPasswordResetCode: async (
    identifier: string,
    code: string,
  ): Promise<{ status: number; access_token: string; message: string }> => {
    return apiPost("/auth/verify_password_reset_code", { identifier, code });
  },

  resetPassword: async (
    newPassword: string,
    accessToken: string,
  ): Promise<{ status: number; message: string }> => {
    return apiPost("/auth/reset_password", {
      new_password: newPassword,
      access_token: accessToken,
    });
  },

  // ─── Sign-in with phone OTP ───────────────────────────

  sendLoginPhoneOtp: async (
    phoneNumber: string,
  ): Promise<{ status: number; message: string }> => {
    return apiPost("/auth/send_login_phone_otp", {
      phone_number: normalizePhone(phoneNumber),
    });
  },

  verifyLoginPhoneOtp: async (
    phoneNumber: string,
    code: string,
    portal?: "borrower" | "lender",
  ): Promise<AuthResponse> => {
    const res = await apiPost<AuthResponse>("/auth/verify_login_phone_otp", {
      phone_number: normalizePhone(phoneNumber),
      code,
      portal,
    });
    storeTokens(res);
    return res;
  },

  refreshToken: async (): Promise<string | null> => {
    const cookies = document.cookie.split("; ");
    const refreshCookie = cookies.find((c) => c.startsWith("lf_refresh="));
    if (!refreshCookie) return null;
    const refreshToken = refreshCookie.split("=")[1];
    try {
      const res = await apiPost<AuthResponse>("/auth/refresh", {
        refresh_token: refreshToken,
      });
      storeTokens(res);
      return res.access_token;
    } catch {
      api.signOut();
      return null;
    }
  },

  // Dashboard
  getUser: async (): Promise<User> => {
    await delay(300);
    return currentUser;
  },
  getDashboardStats: async (): Promise<DashboardStats> => {
    await delay(300);
    return dashboardStats;
  },
  getActiveLoan: async (): Promise<ActiveLoan | null> => {
    await delay(300);
    return activeLoan;
  },
  getApplications: async (): Promise<LoanApplication[]> => {
    await delay(300);
    return applications;
  },

  // Offers
  getOffers: async (applicationId?: string): Promise<LoanOffer[]> => {
    await delay(300);
    if (applicationId) {
      return loanOffers.filter((o) => o.applicationId === applicationId);
    }
    return loanOffers;
  },
  acceptOffer: async (_offerId: string): Promise<void> => {
    await delay();
  },

  // Lenders
  getLenders: async (): Promise<Lender[]> => {
    await delay(300);
    return lenders;
  },

  // Guarantors
  getGuarantors: async (): Promise<Guarantor[]> => {
    await delay(300);
    return guarantors;
  },

  // Repayments
  getInstalments: async (_loanId?: string): Promise<Instalment[]> => {
    await delay(300);
    return instalments;
  },

  // Wallet
  getWalletBalance: async (): Promise<number> => {
    await delay(200);
    return dashboardStats.walletBalance;
  },
  getTransactions: async (): Promise<WalletTransaction[]> => {
    await delay(300);
    return walletTransactions;
  },
  topUp: async (_data: {
    amount: number;
    method: string;
    phone: string;
  }): Promise<void> => {
    await delay();
  },

  // Application submission
  submitApplication: async (
    _data: Record<string, unknown>,
  ): Promise<{ reference: string }> => {
    await delay(1000);
    return { reference: "LF-2026-00847" };
  },

  // Upload
  uploadDocument: async (
    _file: File,
    _key: string,
  ): Promise<{ url: string }> => {
    await delay(1000);
    return { url: "/uploads/mock-doc.pdf" };
  },

  // Notifications
  getNotifications: async (): Promise<Notification[]> => {
    await delay();
    return notifications;
  },

  markNotificationRead: async (id: string): Promise<void> => {
    await delay(200);
    const n = notifications.find((n) => n.id === id);
    if (n) n.read = true;
  },

  markAllNotificationsRead: async (): Promise<void> => {
    await delay(300);
    notifications.forEach((n) => (n.read = true));
  },

  // Admin APIs
  getAdminStats: async (): Promise<AdminStats> => {
    await delay();
    return adminStats;
  },

  getAdminUsers: async (): Promise<AdminUser[]> => {
    await delay();
    return adminUsers;
  },

  updateUserStatus: async (
    _id: string,
    _status: "active" | "suspended" | "banned",
  ): Promise<void> => {
    await delay(300);
  },

  getAdminLoans: async (): Promise<AdminLoan[]> => {
    await delay();
    return adminLoans;
  },

  getAdminApplications: async (): Promise<AdminApplication[]> => {
    await delay();
    return adminApplications;
  },

  updateApplicationStatus: async (
    _id: string,
    _status: "approved" | "rejected",
  ): Promise<void> => {
    await delay(300);
  },

  // ─── Lender Portal APIs ───
  getLenderProfile: async (): Promise<LenderProfile> => {
    await delay(300);
    return lenderProfile;
  },
  getLenderDashboardStats: async (): Promise<LenderDashboardStats> => {
    await delay(300);
    return lenderDashboardStats;
  },
  getBorrowerActivities: async (): Promise<BorrowerActivity[]> => {
    await delay(300);
    return borrowerActivities;
  },
  getMarketplaceBorrowers: async (): Promise<MarketplaceBorrower[]> => {
    await delay(300);
    return marketplaceBorrowers;
  },
  getBorrowerProfile: async (_id: string): Promise<BorrowerProfile> => {
    await delay(300);
    return borrowerProfileData;
  },
  makeOffer: async (
    _borrowerId: string,
    _data: Record<string, unknown>,
  ): Promise<void> => {
    await delay(800);
  },
  getLenderWalletBalance: async (): Promise<number> => {
    await delay(200);
    return 12480000;
  },
  getLenderTransactions: async (): Promise<LenderWalletTransaction[]> => {
    await delay(300);
    return lenderWalletTransactions;
  },
  lenderDeposit: async (_data: {
    amount: number;
    method: string;
    phone: string;
  }): Promise<void> => {
    await delay(800);
  },
  lenderWithdraw: async (_data: {
    amount: number;
    method: string;
  }): Promise<void> => {
    await delay(800);
  },
  getLenderEarnings: async (): Promise<LenderEarnings> => {
    await delay(300);
    return lenderEarnings;
  },
};
