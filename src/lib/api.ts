import { API_BASE_URL } from "./constants";
import type {
  User,
  DashboardStats,
  ActiveLoan,
  MarketplacePreview,
  MarketplacePreviewParams,
  OfferTemplateDetail,
  DisbursementQueue,
  BatchDisbursementResult,
  LoanRepayment,
  RepaymentHistoryItem,
  LoanApplication,
  LoanOffer,
  MarketplaceApplication,
  Wallet,
  WalletTransaction,
  TransactionDetail,
  BankOption,
  CardDepositInitiateResult,
  TransferStatusResult,
  Notification,
  AdminStats,
  AdminActivity,
  AdminUser,
  AdminLoan,
  AdminApplication,
  AdminPaymentTx,
  AdminRevenue,
  AdminSetting,
  AdminReconciliation,
  AdminOfferTemplate,
  AdminAuditLog,
  AdminUserDetail,
  AdminUserTransactionSummary,
  LenderWalletTransaction,
  LenderEarnings,
  LenderOfferTemplate,
  ReferralInfo,
  SupportTicket,
  AdminSupportTicket,
  Faq,
  Dispute,
  DisputeMessage,
  LoginSessionInfo,
  KYCDocument,
  KYCDocumentType,
  BorrowerDocument,
  BorrowerDocumentType,
  GuarantorRequest,
} from "./types";

// ─── Real API helpers ────────────────────────────────────

export interface AuthResponse {
  // Absent on the /auth/refresh response, which only re-issues tokens.
  user?: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    phone_number: string;
    role: string;
    is_admin: boolean;
    is_super_admin: boolean;
    is_active: boolean;
    is_verified: boolean;
    is_phone_verified: boolean;
    is_kyc_verified: boolean;
    kyc_status: string;
    credit_score: number | null;
    // Set when an admin restored this account — see the backend's
    // User.must_change_password. Nudges sign-in to prompt a real password
    // before the user carries on with a server-generated temp one.
    must_change_password?: boolean;
  };
  access_token: string;
  refresh_token: string;
}

export interface RequiresTwoFactorResponse {
  status: number;
  requires_2fa: true;
  username: string;
  message: string;
}

// /auth/login returns this shape when the account has 2FA enabled — no
// tokens yet, just a signal to collect the code that was just SMS'd out.
type LoginApiResponse = AuthResponse | RequiresTwoFactorResponse;

export type SignInOutcome =
  | { requires2FA: true; username: string }
  | { requires2FA: false; user: User; mustChangePassword: boolean };

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
  // Present only when this call is the one that completes the signup —
  // lets the frontend log the new user straight in instead of sending
  // them to sign-in to re-enter the password they just typed.
  access_token?: string;
  refresh_token?: string;
  user?: AuthResponse["user"];
}

/** FastAPI's `detail` is a plain string for HTTPException, but an array of
 * {loc, msg, type} objects for Pydantic validation (422) errors — coercing
 * that array straight into an Error's message renders as "[object Object]". */
function extractErrorMessage(err: unknown, status: number): string {
  const detail =
    (err as { detail?: unknown; message?: unknown })?.detail ??
    (err as { message?: unknown })?.message;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { loc?: unknown[]; msg?: string };
    const field = Array.isArray(first?.loc) ? first.loc.at(-1) : undefined;
    return field
      ? `${field}: ${first.msg || "Invalid value"}`
      : first?.msg || "Invalid request";
  }
  return `HTTP ${status}`;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(extractErrorMessage(err, res.status));
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
    throw new Error(extractErrorMessage(err, res.status));
  }
  return res.json();
}

/** Read a cookie by name (client-side only). */
export function getCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`))
    ?.split("=")[1];
}

/** Send the signed-in user back to the right sign-in page for their portal,
 * remembering where they were so a fresh login lands them right back there. */
function redirectToSignIn() {
  if (typeof window === "undefined") return;
  const signInPath = window.location.pathname.startsWith("/lender")
    ? "/auth/lender-signin"
    : "/auth/signin";
  const here = window.location.pathname + window.location.search;
  const url = new URL(signInPath, window.location.origin);
  if (here && here !== "/") {
    url.searchParams.set("redirect", here);
  }
  window.location.href = url.toString();
}

/** GET with the JWT from the lf_token cookie attached — for endpoints that require auth. */
async function apiAuthGet<T>(path: string): Promise<T> {
  const token = getCookie("lf_token");
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 401) {
    // Only a real session expiry (a token was attached and the server
    // rejected it) should bounce to sign-in. A 401 with no token just
    // means this call fired before the user ever logged in — nothing to
    // expire, and redirecting would yank them off whatever page they're on.
    if (token) {
      redirectToSignIn();
      throw new Error("Session expired");
    }
    throw new Error("Not authenticated");
  }
  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ detail: "Request failed", message: "Request failed" }));
    throw new Error(extractErrorMessage(err, res.status));
  }
  return res.json();
}

/** POST with the JWT from the lf_token cookie attached — for endpoints that require auth. */
async function apiAuthPost<T>(path: string, body: unknown): Promise<T> {
  const token = getCookie("lf_token");
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    // Only a real session expiry (a token was attached and the server
    // rejected it) should bounce to sign-in. A 401 with no token just
    // means this call fired before the user ever logged in — nothing to
    // expire, and redirecting would yank them off whatever page they're on.
    if (token) {
      redirectToSignIn();
      throw new Error("Session expired");
    }
    throw new Error("Not authenticated");
  }
  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ detail: "Request failed", message: "Request failed" }));
    throw new Error(extractErrorMessage(err, res.status));
  }
  return res.json();
}

/** POST multipart/form-data with the JWT attached — for file uploads. */
async function apiAuthUpload<T>(path: string, formData: FormData): Promise<T> {
  const token = getCookie("lf_token");
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  if (res.status === 401) {
    // Only a real session expiry (a token was attached and the server
    // rejected it) should bounce to sign-in. A 401 with no token just
    // means this call fired before the user ever logged in — nothing to
    // expire, and redirecting would yank them off whatever page they're on.
    if (token) {
      redirectToSignIn();
      throw new Error("Session expired");
    }
    throw new Error("Not authenticated");
  }
  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ detail: "Request failed", message: "Request failed" }));
    throw new Error(extractErrorMessage(err, res.status));
  }
  return res.json();
}

async function apiAuthDelete<T>(path: string): Promise<T> {
  const token = getCookie("lf_token");
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 401) {
    // Only a real session expiry (a token was attached and the server
    // rejected it) should bounce to sign-in. A 401 with no token just
    // means this call fired before the user ever logged in — nothing to
    // expire, and redirecting would yank them off whatever page they're on.
    if (token) {
      redirectToSignIn();
      throw new Error("Session expired");
    }
    throw new Error("Not authenticated");
  }
  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ detail: "Request failed", message: "Request failed" }));
    throw new Error(extractErrorMessage(err, res.status));
  }
  return res.json();
}

async function apiAuthPut<T>(path: string, body: unknown): Promise<T> {
  const token = getCookie("lf_token");
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    // Only a real session expiry (a token was attached and the server
    // rejected it) should bounce to sign-in. A 401 with no token just
    // means this call fired before the user ever logged in — nothing to
    // expire, and redirecting would yank them off whatever page they're on.
    if (token) {
      redirectToSignIn();
      throw new Error("Session expired");
    }
    throw new Error("Not authenticated");
  }
  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ detail: "Request failed", message: "Request failed" }));
    throw new Error(extractErrorMessage(err, res.status));
  }
  return res.json();
}

function mapAuthUser(data: AuthResponse): User {
  // Only called on paths that return a full user payload (sign-in, register,
  // OTP verification) — never on /auth/refresh, which omits `user`.
  const user = data.user!;
  return {
    id: user.id,
    fullName: user.full_name || user.username,
    email: user.email,
    phone: user.phone_number || "",
    nin: "",
    accountType: "individual",
    kycStatus: (user.kyc_status as User["kycStatus"]) || "pending",
    kycVerifiedAt: null,
    creditScore: user.credit_score ?? 0,
    // Not part of the lean auth-response payload — the full profile
    // (with real licence/terms state) loads right after via useUser().
    termsAcceptedAt: null,
    licenceNumber: null,
    licenceStatus: null,
    licenceValidUntil: null,
    createdAt: new Date().toISOString(),
  };
}

interface RawUserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  nin: string | null;
  account_type: string;
  profile_pic: string | null;
  kyc_status: string;
  kyc_verified_at: string | null;
  is_super_admin?: boolean;
  two_factor_enabled?: boolean;
  notif_new_application?: boolean;
  notif_repayment_received?: boolean;
  notif_loan_overdue?: boolean;
  notif_portfolio_digest?: boolean;
  notif_offer_received?: boolean;
  notif_payment_reminder?: boolean;
  notif_application_status?: boolean;
  notif_login_alerts?: boolean;
  credit_score?: number | null;
  created_at: string;
  terms_accepted_at: string | null;
  licence_number: string | null;
  licence_status: "not_issued" | "active" | "expired" | null;
  licence_valid_until: string | null;
}

function mapUserProfile(u: RawUserProfile): User {
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    phone: u.phone_number,
    nin: u.nin ?? "",
    accountType: u.account_type as User["accountType"],
    isSuperAdmin: u.is_super_admin ?? false,
    twoFactorEnabled: u.two_factor_enabled ?? false,
    notifNewApplication: u.notif_new_application ?? true,
    notifRepaymentReceived: u.notif_repayment_received ?? true,
    notifLoanOverdue: u.notif_loan_overdue ?? true,
    notifPortfolioDigest: u.notif_portfolio_digest ?? false,
    notifOfferReceived: u.notif_offer_received ?? true,
    notifPaymentReminder: u.notif_payment_reminder ?? true,
    notifApplicationStatus: u.notif_application_status ?? true,
    notifLoginAlerts: u.notif_login_alerts ?? true,
    profilePic: u.profile_pic ?? undefined,
    kycStatus: u.kyc_status as User["kycStatus"],
    kycVerifiedAt: u.kyc_verified_at,
    creditScore: u.credit_score ?? 0,
    createdAt: u.created_at,
    termsAcceptedAt: u.terms_accepted_at,
    licenceNumber: u.licence_number,
    licenceStatus: u.licence_status,
    licenceValidUntil: u.licence_valid_until,
  };
}

interface RawNotificationsPage {
  total: number;
  total_all: number;
  unread: number;
  notifications: {
    id: string;
    title: string;
    message: string;
    type: string | null;
    data: string | null;
    is_read: boolean;
    created_at: string;
  }[];
}

function mapNotification(n: RawNotificationsPage["notifications"][number]): Notification {
  let data: Record<string, unknown> | null = null;
  if (n.data) {
    try {
      data = JSON.parse(n.data);
    } catch {
      data = null;
    }
  }
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    data,
    read: n.is_read,
    createdAt: n.created_at,
  };
}

/** Store tokens — called after successful sign-in / register. */
function storeTokens(data: AuthResponse) {
  // Set HTTP-only-style cookie via document.cookie (15 min for access token)
  const maxAge = 15 * 60; // match JWT expiry
  const longAge = 7 * 24 * 60 * 60;
  document.cookie = `lf_token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `lf_refresh=${data.refresh_token}; path=/; max-age=${longAge}; SameSite=Lax`;
  // /auth/refresh only re-issues tokens — no `user` payload — so there's
  // nothing further to update on that path.
  if (!data.user) return;
  document.cookie = `lf_role=${data.user.role}; path=/; max-age=${longAge}; SameSite=Lax`;
  document.cookie = `lf_is_admin=${data.user.is_admin ? "true" : "false"}; path=/; max-age=${longAge}; SameSite=Lax`;
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
  }): Promise<SignInOutcome> => {
    // If input looks like a phone number, normalize it
    const identifier = /^\d{9,12}$/.test(data.phoneOrEmail.replace(/\D/g, ""))
      ? normalizePhone(data.phoneOrEmail)
      : data.phoneOrEmail;
    const res = await apiPost<LoginApiResponse>("/auth/login", {
      username: identifier,
      password: data.password,
      portal: data.portal,
    });
    if ("requires_2fa" in res) {
      return { requires2FA: true, username: res.username };
    }
    storeTokens(res);
    return { requires2FA: false, user: mapAuthUser(res), mustChangePassword: !!res.user?.must_change_password };
  },

  /** Completes a sign-in that returned requires2FA — verifies the SMS code and issues tokens. */
  verifyLogin2FA: async (
    username: string,
    code: string,
  ): Promise<{ user: User; mustChangePassword: boolean }> => {
    const res = await apiPost<AuthResponse>("/auth/verify_login_2fa", {
      username,
      code,
    });
    storeTokens(res);
    return { user: mapAuthUser(res), mustChangePassword: !!res.user?.must_change_password };
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
      agree_to_terms: !!data.agreeToTerms,
      referred_by_code: (data.referredByCode as string) || undefined,
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
  }): Promise<SignInOutcome> => {
    const identifier = /^\d{9,12}$/.test(data.phoneOrEmail.replace(/\D/g, ""))
      ? normalizePhone(data.phoneOrEmail)
      : data.phoneOrEmail;
    const res = await apiPost<LoginApiResponse>("/auth/login", {
      username: identifier,
      password: data.password,
      portal: "lender",
    });
    if ("requires_2fa" in res) {
      return { requires2FA: true, username: res.username };
    }
    // Backend already rejects a mismatched portal with a 403 before this
    // point (is_admin does NOT bypass that — a dual-role account still has
    // exactly one true portal). This is just a defensive client-side mirror.
    if (
      res.user!.role !== "lender" &&
      res.user!.role !== "admin" &&
      res.user!.role !== "super_admin"
    ) {
      throw new Error(
        "This portal is for lenders only. Please use the borrower sign-in.",
      );
    }
    storeTokens(res);
    return { requires2FA: false, user: mapAuthUser(res), mustChangePassword: !!res.user?.must_change_password };
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
    document.cookie = "lf_is_admin=; path=/; max-age=0";
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
      if (res.access_token && res.refresh_token && res.user) {
        storeTokens(res as AuthResponse);
      }
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
      if (res.access_token && res.refresh_token && res.user) {
        storeTokens(res as AuthResponse);
      }
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
    email: string,
    phoneNumber: string,
    portal?: "borrower" | "lender",
  ): Promise<{
    status: number;
    message: string;
    channel: "email" | "phone";
  }> => {
    return apiPost("/auth/send_password_reset_code", {
      email,
      phone_number: normalizePhone(phoneNumber),
      portal,
    });
  },

  verifyPasswordResetCode: async (
    identifier: string,
    code: string,
  ): Promise<{
    status: number;
    access_token: string;
    message: string;
    role?: "borrower" | "lender" | string;
  }> => {
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
    const u = await apiAuthGet<RawUserProfile>("/users/me");
    return mapUserProfile(u);
  },
  // phone_number and email are deliberately not accepted here — both are
  // the channels OTP verification relies on, so neither is user-editable
  // after signup (backend's UserUpdate model doesn't accept them either).
  updateProfile: async (data: {
    fullName?: string;
    nin?: string;
    twoFactorEnabled?: boolean;
    notifNewApplication?: boolean;
    notifRepaymentReceived?: boolean;
    notifLoanOverdue?: boolean;
    notifPortfolioDigest?: boolean;
    notifOfferReceived?: boolean;
    notifPaymentReminder?: boolean;
    notifApplicationStatus?: boolean;
    notifLoginAlerts?: boolean;
  }): Promise<User> => {
    const u = await apiAuthPut<RawUserProfile>("/users/me", {
      full_name: data.fullName,
      nin: data.nin,
      two_factor_enabled: data.twoFactorEnabled,
      notif_new_application: data.notifNewApplication,
      notif_repayment_received: data.notifRepaymentReceived,
      notif_loan_overdue: data.notifLoanOverdue,
      notif_portfolio_digest: data.notifPortfolioDigest,
      notif_offer_received: data.notifOfferReceived,
      notif_payment_reminder: data.notifPaymentReminder,
      notif_application_status: data.notifApplicationStatus,
      notif_login_alerts: data.notifLoginAlerts,
    });
    return mapUserProfile(u);
  },
  signLenderAgreement: async (): Promise<User> => {
    const u = await apiAuthPost<RawUserProfile>(
      "/users/me/sign-lender-agreement",
      {},
    );
    return mapUserProfile(u);
  },
  getDashboardStats: async (): Promise<DashboardStats> => {
    const [applications, loans, wallet] = await Promise.all([
      api.getApplications(),
      api.getMyActiveLoans(),
      api.getWallet(),
    ]);
    const pendingApps = applications.filter((a) => a.status === "pending");
    const newOffers = pendingApps.reduce(
      (sum, a) => sum + (a.pending_offers_count ?? 0),
      0,
    );
    const activeLoans = loans.filter(
      (l) => l.status === "active" || l.status === "overdue",
    ).length;
    return {
      activeLoans,
      applicationsPending: pendingApps.length,
      newOffers,
      walletBalance: wallet.balance,
    };
  },
  getRecentNotifications: async (
    limit = 3,
  ): Promise<
    { id: string; title: string; message: string; created_at: string }[]
  > => {
    const res = await apiAuthGet<{
      notifications: {
        id: string;
        title: string;
        message: string;
        created_at: string;
      }[];
    }>(`/notifications/?limit=${limit}`);
    return res.notifications;
  },
  getActiveLoan: async (): Promise<ActiveLoan | null> => {
    const res = await apiAuthGet<{ total: number; loans: ActiveLoan[] }>(
      "/loans/active",
    );
    return (
      res.loans.find((l) => l.status === "active" || l.status === "overdue") ??
      res.loans[0] ??
      null
    );
  },
  getLoanDetail: async (loanId: string): Promise<ActiveLoan> => {
    return apiAuthGet(`/loans/active/${loanId}`);
  },
  getMyRepayments: async (
    skip = 0,
    limit = 20,
  ): Promise<{ total: number; repayments: RepaymentHistoryItem[] }> => {
    return apiAuthGet(`/loans/repayments/mine?skip=${skip}&limit=${limit}`);
  },
  downloadRepaymentReceipt: async (repaymentId: string): Promise<void> => {
    const token = getCookie("lf_token");
    const res = await fetch(
      `${API_BASE_URL}/loans/repayments/${repaymentId}/receipt`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    if (!res.ok) {
      throw new Error("Receipt not available");
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mpola-receipt-${repaymentId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
  downloadDisbursementReceipt: async (loanId: string): Promise<void> => {
    const token = getCookie("lf_token");
    const res = await fetch(
      `${API_BASE_URL}/loans/${loanId}/disbursement-receipt`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    if (!res.ok) {
      throw new Error("Receipt not available");
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mpola-disbursement-${loanId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
  getMyActiveLoans: async (): Promise<ActiveLoan[]> => {
    const res = await apiAuthGet<{ total: number; loans: ActiveLoan[] }>(
      "/loans/active?limit=100",
    );
    return res.loans;
  },
  approveDisbursement: async (
    loanId: string,
  ): Promise<{ status: number; message: string; loan: ActiveLoan }> => {
    return apiAuthPost(`/loans/active/${loanId}/approve-disbursement`, {});
  },
  getDisbursementQueue: async (): Promise<DisbursementQueue> => {
    return apiAuthGet("/loans/disbursement-queue");
  },
  batchApproveDisbursement: async (): Promise<BatchDisbursementResult> => {
    return apiAuthPost("/loans/disbursement/batch", {});
  },
  getApplications: async (): Promise<LoanApplication[]> => {
    const res = await apiAuthGet<{
      total: number;
      applications: LoanApplication[];
    }>("/loans/applications");
    return res.applications;
  },
  getApplicationDetail: async (id: string): Promise<LoanApplication> => {
    return apiAuthGet(`/loans/applications/${id}`);
  },
  searchGuarantorCandidate: async (
    email: string,
    phoneNumber: string,
  ): Promise<{
    id: string;
    username: string;
    full_name: string | null;
    role: string;
  }> => {
    const params = new URLSearchParams({ email, phone_number: phoneNumber });
    return apiAuthGet(`/users/search-guarantor-candidate?${params.toString()}`);
  },
  attachGuarantors: async (
    applicationId: string,
    guarantorUserIds: string[],
  ): Promise<{ status: number; message: string }> => {
    return apiAuthPost(`/loans/applications/${applicationId}/guarantors`, {
      guarantor_user_ids: guarantorUserIds,
    });
  },
  respondToGuarantorRequest: async (
    guarantorId: string,
    status: "accepted" | "declined",
  ): Promise<{ status: number; message: string }> => {
    return apiAuthPut(`/guarantors/${guarantorId}/respond`, { status });
  },
  replaceGuarantor: async (
    applicationId: string,
    guarantorId: string,
    newGuarantorUserId: string,
  ): Promise<{ status: number; message: string }> => {
    return apiAuthPut(
      `/guarantors/applications/${applicationId}/${guarantorId}/replace`,
      {
        new_guarantor_user_id: newGuarantorUserId,
      },
    );
  },
  remindGuarantor: async (
    guarantorId: string,
  ): Promise<{ status: number; message: string }> => {
    return apiAuthPost(`/guarantors/${guarantorId}/remind`, {});
  },
  getGuarantorRequests: async (
    status?: string,
  ): Promise<{ requests: GuarantorRequest[] }> => {
    return apiAuthGet(
      `/guarantors/requests${status ? `?status=${status}` : ""}`,
    );
  },

  // Offers
  respondToOffer: async (
    offerId: string,
    status: "accepted" | "declined",
    note?: string,
  ): Promise<{ status: number; message: string }> => {
    return apiAuthPut(`/loans/offers/${offerId}`, {
      status,
      note: note || undefined,
    });
  },
  submitCustomDocumentResponse: async (
    applicationId: string,
    label: string,
    data: { textResponse?: string; file?: File },
  ): Promise<{ status: number; message: string }> => {
    const token = getCookie("lf_token");
    const formData = new FormData();
    formData.append("label", label);
    if (data.textResponse) formData.append("text_response", data.textResponse);
    if (data.file) formData.append("file", data.file);
    const res = await fetch(
      `${API_BASE_URL}/loans/applications/${applicationId}/custom-document-response`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(extractErrorMessage(err, res.status));
    }
    return res.json();
  },

  // Repayments
  makeRepayment: async (data: {
    loan_id: string;
    amount: number;
    payment_method: "wallet" | "mobile_money";
    phone_number?: string;
    carrier?: string;
  }): Promise<{
    status: number;
    message: string;
    repayment: LoanRepayment;
    loan: ActiveLoan;
  }> => {
    return apiAuthPost("/loans/repayments", data);
  },

  // Wallet — one wallet per user; borrower and lender portals hit the same endpoints.
  getWallet: async (): Promise<Wallet> => {
    return apiAuthGet<Wallet>("/wallet/");
  },
  getTransactions: async (
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{ transactions: WalletTransaction[]; total: number }> => {
    const params = new URLSearchParams({
      skip: String((page - 1) * pageSize),
      limit: String(pageSize),
    });
    return apiAuthGet(`/wallet/transactions?${params.toString()}`);
  },
  getTransactionDetail: async (id: string): Promise<TransactionDetail> => {
    return apiAuthGet(`/wallet/transactions/${id}`);
  },
  setupWallet: async (
    pin: string,
  ): Promise<{ status: number; message: string }> => {
    return apiAuthPost("/wallet/setup", { pin });
  },

  // Mobile money — synchronous, backed by UPG collect/disburse.
  depositMobileMoney: async (data: {
    amount: number;
    phone: string;
    carrier?: string;
  }): Promise<{ status: number; message: string; balance: number }> => {
    return apiAuthPost("/wallet/deposit", data);
  },
  sendWithdrawOtp: async (): Promise<{ status: number; message: string }> => {
    return apiAuthPost("/wallet/withdraw/send-otp", {});
  },
  withdrawMobileMoney: async (data: {
    amount: number;
    phone: string;
    carrier?: string;
    otp_code: string;
  }): Promise<{
    status: number;
    message: string;
    balance: number;
    fee: number;
    total_debited: number;
  }> => {
    return apiAuthPost("/wallet/withdraw", {
      amount: data.amount,
      phone_number: data.phone,
      carrier: data.carrier,
      otp_code: data.otp_code,
    });
  },

  // Card — Flutterwave hosted checkout, async: initiate then poll status.
  initiateCardDeposit: async (data: {
    amount: number;
    redirect_url: string;
  }): Promise<CardDepositInitiateResult> => {
    return apiAuthPost("/wallet/deposit/card/initiate", data);
  },
  getCardDepositStatus: async (
    reference: string,
  ): Promise<TransferStatusResult> => {
    return apiAuthGet(`/wallet/deposit/card/status/${reference}`);
  },

  // Bank transfer — Flutterwave payout, async: initiate then poll status.
  getBanks: async (
    countryCode: string = "UG",
  ): Promise<{ country_code: string; banks: BankOption[] }> => {
    return apiAuthGet(`/wallet/banks/${countryCode}`);
  },
  initiateBankWithdraw: async (data: {
    amount: number;
    account_bank: string;
    account_number: string;
    beneficiary_name: string;
    narration?: string;
    otp_code: string;
  }): Promise<{ reference: string; status: string }> => {
    return apiAuthPost("/wallet/withdraw/bank/initiate", data);
  },
  getBankWithdrawStatus: async (
    reference: string,
  ): Promise<TransferStatusResult> => {
    return apiAuthGet(`/wallet/withdraw/bank/status/${reference}`);
  },

  // Live, admin-configured lending bounds (Settings > Min/Max Loan Amount,
  // Max Interest Rate) — used by every form that submits a loan amount or
  // rate (borrower apply wizard, lender manual offer, lender standing offer
  // template) so none of them drift from a hardcoded guess.
  getLendingLimits: async (): Promise<{
    min_amount: number;
    max_amount: number;
    max_interest_rate: number;
  }> => {
    return apiAuthGet("/loans/limits");
  },

  // Checked before letting a borrower start the Apply wizard — one
  // outstanding loan at a time (see OUTSTANDING_LOAN_STATUSES in
  // routers/loans.py, the authoritative gate that also blocks the actual
  // POST /loans/applications call).
  getApplicationEligibility: async (): Promise<{
    can_apply: boolean;
    blocking_loan: {
      id: string;
      amount: number;
      status: string;
      total_repayable: number;
      total_paid: number;
      remaining_balance: number;
      next_payment_date: string | null;
      next_payment_amount: number | null;
    } | null;
    min_amount: number;
    max_amount: number;
  }> => {
    return apiAuthGet("/loans/applications/eligibility");
  },

  // Application submission
  submitApplication: async (data: {
    amount: number;
    duration?: number;
    duration_days?: number;
    loan_type: string;
    purpose?: string;
    max_interest_rate?: number;
    valid_until?: string;
  }): Promise<{
    status: number;
    message: string;
    application: LoanApplication;
  }> => {
    return apiAuthPost("/loans/applications", data);
  },
  updateApplication: async (
    id: string,
    data: Partial<{
      amount: number;
      duration: number | null;
      duration_days: number | null;
      loan_type: string;
      purpose: string;
      max_interest_rate: number | null;
      valid_until: string | null;
    }>,
  ): Promise<{
    status: number;
    message: string;
    application: LoanApplication;
  }> => {
    return apiAuthPut(`/loans/applications/${id}`, data);
  },
  deleteApplication: async (
    id: string,
  ): Promise<{ status: number; message: string }> => {
    return apiAuthDelete(`/loans/applications/${id}`);
  },
  freezeApplication: async (
    id: string,
  ): Promise<{
    status: number;
    message: string;
    application: LoanApplication;
  }> => {
    return apiAuthPost(`/loans/applications/${id}/freeze`, {});
  },
  unfreezeApplication: async (
    id: string,
  ): Promise<{
    status: number;
    message: string;
    application: LoanApplication;
  }> => {
    return apiAuthPost(`/loans/applications/${id}/unfreeze`, {});
  },
  // The apply wizard's resume-where-you-left-off check — an application
  // that exists but hasn't had its guarantors attached yet is by
  // definition an unfinished draft (see GET /loans/applications/draft).
  getDraftApplication: async (): Promise<LoanApplication | null> => {
    const res = await apiAuthGet<{ draft: LoanApplication | null }>(
      "/loans/applications/draft",
    );
    return res.draft;
  },

  // ─── Account-level KYC documents ───
  getMyKycDocuments: async (): Promise<KYCDocument[]> => {
    const res = await apiAuthGet<{ documents: KYCDocument[] }>(
      "/users/me/kyc-documents",
    );
    return res.documents;
  },

  uploadKycDocument: async (
    documentType: KYCDocumentType,
    file: File,
  ): Promise<{ status: number; message: string; document: KYCDocument }> => {
    const formData = new FormData();
    formData.append("document_type", documentType);
    formData.append("file", file);
    return apiAuthUpload("/users/me/kyc-documents", formData);
  },

  // ─── Account-wide reusable supporting documents (bank statement, payslip/
  // business proof, land title, URA TIN) — what a lender's required_documents
  // actually resolves against, besides KYC ───
  getMyBorrowerDocuments: async (): Promise<BorrowerDocument[]> => {
    const res = await apiAuthGet<{ documents: BorrowerDocument[] }>(
      "/users/me/documents",
    );
    return res.documents;
  },

  uploadBorrowerDocument: async (
    documentType: BorrowerDocumentType,
    file: File,
  ): Promise<{
    status: number;
    message: string;
    document: BorrowerDocument;
  }> => {
    const formData = new FormData();
    formData.append("document_type", documentType);
    formData.append("file", file);
    return apiAuthUpload("/users/me/documents", formData);
  },

  // Borrower — offers received across all of my applications
  getOffersReceived: async (): Promise<LoanOffer[]> => {
    const res = await apiAuthGet<{ total: number; offers: LoanOffer[] }>(
      "/loans/offers/received?limit=100",
    );
    return res.offers;
  },

  // Notifications
  getNotifications: async (): Promise<Notification[]> => {
    const res = await apiAuthGet<RawNotificationsPage>("/notifications/?limit=50");
    return res.notifications.map(mapNotification);
  },

  // Paginated + filterable — used by the full Notifications pages
  // (admin/lender/borrower), which can't just fetch a flat capped list once
  // a real account accumulates hundreds or thousands of notifications.
  getNotificationsPage: async (
    page: number = 1,
    pageSize: number = 20,
    filters?: { isRead?: boolean; types?: string[] },
  ): Promise<{ notifications: Notification[]; total: number; totalAll: number; unread: number }> => {
    const params = new URLSearchParams();
    params.set("skip", String((page - 1) * pageSize));
    params.set("limit", String(pageSize));
    if (filters?.isRead !== undefined) params.set("is_read", String(filters.isRead));
    if (filters?.types?.length) params.set("types", filters.types.join(","));
    const res = await apiAuthGet<RawNotificationsPage>(`/notifications/?${params.toString()}`);
    return {
      notifications: res.notifications.map(mapNotification),
      total: res.total,
      totalAll: res.total_all,
      unread: res.unread,
    };
  },

  markNotificationRead: async (id: string): Promise<void> => {
    await apiAuthPut(`/notifications/${id}/read`, {});
  },

  markAllNotificationsRead: async (): Promise<void> => {
    await apiAuthPost("/notifications/read-all", {});
  },

  // Admin APIs
  getAdminStats: async (): Promise<AdminStats> => {
    return apiAuthGet("/admin/stats");
  },

  getAdminActivity: async (): Promise<AdminActivity> => {
    return apiAuthGet("/admin/activity");
  },

  getAdminUsers: async (
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      search?: string;
      status?: string;
      role?: string;
    },
  ): Promise<{ users: AdminUser[]; total: number }> => {
    const params = new URLSearchParams();
    params.set("skip", String((page - 1) * pageSize));
    params.set("limit", String(pageSize));
    if (filters?.search) params.set("search", filters.search);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.role) params.set("role", filters.role);
    return apiAuthGet(`/admin/users?${params.toString()}`);
  },

  suspendUser: async (
    username: string,
  ): Promise<{ success: boolean; is_active: boolean; action: string }> => {
    return apiAuthPut(`/admin/users/${username}/suspend`, {});
  },

  changeUserRole: async (
    username: string,
    role: string,
  ): Promise<{ success: boolean; new_role: string }> => {
    return apiAuthPut(`/admin/users/${username}/role`, { role });
  },

  /** Grants/revokes admin access WITHOUT touching the account's borrower/lender
   * portal role — e.g. lets an existing lender also use the admin dashboard. */
  setUserAdminAccess: async (
    username: string,
    is_admin: boolean,
    is_super_admin: boolean = false,
  ): Promise<{
    success: boolean;
    role: string;
    is_admin: boolean;
    is_super_admin: boolean;
  }> => {
    return apiAuthPut(`/admin/users/${username}/admin-access`, {
      is_admin,
      is_super_admin,
    });
  },

  deactivateUser: async (
    username: string,
    reason?: string,
  ): Promise<{ success: boolean; message: string }> => {
    const qs = reason ? `?reason=${encodeURIComponent(reason)}` : "";
    return apiAuthPost(`/admin/users/${username}/deactivate${qs}`, {});
  },

  getDeactivatedAccounts: async (
    page: number = 1,
    pageSize: number = 20,
    search?: string,
  ): Promise<{
    total: number;
    users: {
      id: string;
      original_username: string;
      original_email: string;
      original_phone_number: string | null;
      deactivated_by: string | null;
      reason: string | null;
      scheduled_deletion_date: string | null;
      created_at: string;
    }[];
  }> => {
    const params = new URLSearchParams({
      skip: String((page - 1) * pageSize),
      limit: String(pageSize),
    });
    if (search) params.set("search", search);
    return apiAuthGet(`/admin/users/deactivated/list?${params.toString()}`);
  },

  restoreDeactivatedAccount: async (
    username: string,
  ): Promise<{
    success: boolean;
    username: string;
    temporary_password: string;
    sms_sent: boolean;
    phone_number: string | null;
    message: string;
  }> => {
    return apiAuthPost(`/admin/users/${username}/restore`, {});
  },

  getAdminLoans: async (
    page: number = 1,
    pageSize: number = 20,
    filters?: { status?: string; search?: string },
  ): Promise<{ loans: AdminLoan[]; total: number }> => {
    const params = new URLSearchParams();
    params.set("skip", String((page - 1) * pageSize));
    params.set("limit", String(pageSize));
    if (filters?.status) params.set("status", filters.status);
    if (filters?.search) params.set("search", filters.search);
    return apiAuthGet(`/admin/loans?${params.toString()}`);
  },

  getAdminApplications: async (
    page: number = 1,
    pageSize: number = 20,
    filters?: { status?: string; search?: string },
  ): Promise<{ applications: AdminApplication[]; total: number }> => {
    const params = new URLSearchParams();
    params.set("skip", String((page - 1) * pageSize));
    params.set("limit", String(pageSize));
    if (filters?.status) params.set("status", filters.status);
    if (filters?.search) params.set("search", filters.search);
    return apiAuthGet(`/admin/applications?${params.toString()}`);
  },

  updateApplicationStatus: async (
    id: string,
    action: "reject",
  ): Promise<{ success: boolean; status: string }> => {
    return apiAuthPut(`/admin/applications/${id}?action=${action}`, {});
  },
  freezeAdminApplication: async (
    id: string,
  ): Promise<{ status: number; message: string }> => {
    return apiAuthPost(`/admin/applications/${id}/freeze`, {});
  },
  unfreezeAdminApplication: async (
    id: string,
  ): Promise<{ status: number; message: string }> => {
    return apiAuthPost(`/admin/applications/${id}/unfreeze`, {});
  },

  getAdminPayments: async (
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{
    transactions: AdminPaymentTx[];
    totals: { in: number; out: number };
    total: number;
  }> => {
    const params = new URLSearchParams({
      skip: String((page - 1) * pageSize),
      limit: String(pageSize),
    });
    return apiAuthGet(`/admin/payments?${params.toString()}`);
  },

  getAdminRevenue: async (
    page: number = 1,
    pageSize: number = 20,
    category?: string,
  ): Promise<AdminRevenue> => {
    const params = new URLSearchParams({
      skip: String((page - 1) * pageSize),
      limit: String(pageSize),
    });
    if (category) params.set("category", category);
    return apiAuthGet(`/admin/revenue?${params.toString()}`);
  },

  getAdminSettings: async (): Promise<Record<string, AdminSetting>> => {
    return apiAuthGet("/admin/settings");
  },

  getAdminReconciliation: async (
    lookbackDays: number = 7,
  ): Promise<AdminReconciliation> => {
    return apiAuthGet(`/admin/reconciliation?lookback_days=${lookbackDays}`);
  },

  recheckReconciliationTransaction: async (
    transactionId: string,
  ): Promise<{
    our_status: string;
    gateway_status: string | null;
    corrected: boolean;
  }> => {
    return apiAuthPost(`/admin/reconciliation/recheck/${transactionId}`, {});
  },

  adjustWalletBalance: async (
    username: string,
    amount: number,
    reason: string,
  ): Promise<{
    status: number;
    message: string;
    balance_before: number;
    balance_after: number;
  }> => {
    return apiAuthPost(`/admin/wallets/${username}/adjust`, { amount, reason });
  },

  toggleWalletFreeze: async (
    username: string,
    reason?: string,
  ): Promise<{
    success: boolean;
    username: string;
    is_frozen: boolean;
    action: string;
  }> => {
    return apiAuthPut(`/admin/wallets/${username}/freeze`, { reason });
  },

  updateAdminSetting: async (
    key: string,
    value: string,
  ): Promise<{ success: boolean }> => {
    return apiAuthPut(`/admin/settings/${key}`, { value });
  },

  exportAllPlatformData: async (): Promise<void> => {
    const token = getCookie("lf_token");
    const res = await fetch(`${API_BASE_URL}/admin/export-all-data`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Export failed" }));
      throw new Error(extractErrorMessage(err, res.status));
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mpola-platform-export-${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  getAdminUserDetail: async (username: string): Promise<AdminUserDetail> => {
    return apiAuthGet(`/admin/users/${username}`);
  },

  getAdminUserTransactions: async (
    username: string,
    skip: number,
    limit: number,
  ): Promise<{
    total: number;
    transactions: AdminUserTransactionSummary[];
  }> => {
    return apiAuthGet(
      `/admin/users/${username}/transactions?skip=${skip}&limit=${limit}`,
    );
  },

  reviewKyc: async (
    username: string,
    status: "verified" | "rejected",
    note?: string,
  ): Promise<{
    success: boolean;
    kyc_status: string;
    is_kyc_verified: boolean;
  }> => {
    return apiAuthPut(`/admin/users/${username}/kyc`, { status, note });
  },

  verifyDocument: async (
    documentId: string,
    verified: boolean,
  ): Promise<{ success: boolean; document_id: string; verified: boolean }> => {
    return apiAuthPut(`/admin/documents/${documentId}/verify`, { verified });
  },

  verifyKycDocument: async (
    documentId: string,
    verified: boolean,
    reason?: string,
  ): Promise<{
    success: boolean;
    document_id: string;
    verified: boolean;
    rejection_reason: string | null;
  }> => {
    return apiAuthPut(`/admin/kyc-documents/${documentId}/verify`, {
      verified,
      reason,
    });
  },

  getAdminAuditLogs: async (
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      action?: string;
      username?: string;
      search?: string;
    },
  ): Promise<{ logs: AdminAuditLog[]; total: number }> => {
    const params = new URLSearchParams();
    params.set("skip", String((page - 1) * pageSize));
    params.set("limit", String(pageSize));
    if (filters?.action) params.set("action", filters.action);
    if (filters?.username) params.set("username", filters.username);
    if (filters?.search) params.set("search", filters.search);
    return apiAuthGet(`/admin/audit-logs?${params.toString()}`);
  },

  getOfferTemplatesForReview: async (
    status?: string,
  ): Promise<AdminOfferTemplate[]> => {
    const qs = status ? `?status=${status}&limit=100` : "?limit=100";
    const res = await apiAuthGet<{
      total: number;
      templates: AdminOfferTemplate[];
    }>(`/admin/offer-templates${qs}`);
    return res.templates;
  },

  reviewOfferTemplate: async (
    id: string,
    action: "approve" | "reject",
  ): Promise<{ success: boolean; status: string; offers_created: number }> => {
    return apiAuthPut(`/admin/offer-templates/${id}?action=${action}`, {});
  },
  freezeOfferTemplate: async (
    id: string,
  ): Promise<{ status: number; message: string }> => {
    return apiAuthPost(`/admin/offer-templates/${id}/freeze`, {});
  },
  unfreezeOfferTemplate: async (
    id: string,
  ): Promise<{ status: number; message: string }> => {
    return apiAuthPost(`/admin/offer-templates/${id}/unfreeze`, {});
  },

  changePassword: async (
    oldPassword: string,
    newPassword: string,
  ): Promise<{ status: number; message: string }> => {
    return apiAuthPost("/auth/change_password", {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },

  // ─── Self-service account management ───
  exportMyData: async (): Promise<Record<string, unknown>> => {
    return apiAuthGet("/users/me/export");
  },
  deactivateMyAccount: async (
    password: string,
    reason?: string,
  ): Promise<{ status: number; message: string }> => {
    return apiAuthPost("/users/me/deactivate", { password, reason });
  },

  // ─── Lender Portal APIs ───
  getMarketplace: async (
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      loan_type?: string;
      min_amount?: number;
      max_amount?: number;
    },
  ): Promise<{ total: number; applications: MarketplaceApplication[] }> => {
    const params = new URLSearchParams();
    params.set("skip", String((page - 1) * pageSize));
    params.set("limit", String(pageSize));
    if (filters?.loan_type) params.set("loan_type", filters.loan_type);
    if (filters?.min_amount)
      params.set("min_amount", String(filters.min_amount));
    if (filters?.max_amount)
      params.set("max_amount", String(filters.max_amount));
    return apiAuthGet(`/loans/marketplace?${params.toString()}`);
  },
  skipApplication: async (
    applicationId: string,
  ): Promise<{ status: number; message: string }> => {
    return apiAuthPost(`/loans/marketplace/${applicationId}/skip`, {});
  },
  getMyOffers: async (): Promise<LoanOffer[]> => {
    const res = await apiAuthGet<{ total: number; offers: LoanOffer[] }>(
      "/loans/offers/mine",
    );
    return res.offers;
  },
  makeOffer: async (data: {
    application_id: string;
    amount: number;
    interest_rate: number;
    duration?: number | null;
    duration_days?: number | null;
    required_documents?: string[];
  }): Promise<{ status: number; message: string; offer: LoanOffer }> => {
    return apiAuthPost("/loans/offers", data);
  },
  createOfferTemplate: async (data: {
    max_amount: number;
    min_amount: number;
    interest_rate: number;
    max_duration?: number | null;
    max_duration_days?: number | null;
    accepted_loan_types: string[];
    required_documents: string[];
    description?: string;
    valid_until?: string;
    max_concurrent_loans?: number;
    is_draft?: boolean;
  }): Promise<{ status: number; message: string }> => {
    return apiAuthPost("/loans/offer-templates", data);
  },
  getOfferTemplates: async (): Promise<LenderOfferTemplate[]> => {
    const res = await apiAuthGet<{ templates: LenderOfferTemplate[] }>(
      "/loans/offer-templates/mine",
    );
    return res.templates;
  },
  getOfferTemplateMatches: async (templateId: string): Promise<LoanOffer[]> => {
    const res = await apiAuthGet<{ offers: LoanOffer[] }>(
      `/loans/offer-templates/${templateId}/matches`,
    );
    return res.offers;
  },
  getOfferTemplateDetail: async (templateId: string): Promise<OfferTemplateDetail> => {
    return apiAuthGet<OfferTemplateDetail>(`/loans/offer-templates/${templateId}/public-detail`);
  },
  updateOfferTemplate: async (
    id: string,
    data: Partial<{
      max_amount: number;
      min_amount: number;
      interest_rate: number;
      max_duration: number | null;
      max_duration_days: number | null;
      accepted_loan_types: string[];
      required_documents: string[];
      description: string;
      valid_until: string;
      max_concurrent_loans: number;
    }>,
  ): Promise<{
    status: number;
    message: string;
    template: LenderOfferTemplate;
  }> => {
    return apiAuthPut(`/loans/offer-templates/${id}`, data);
  },
  deleteOfferTemplate: async (
    id: string,
  ): Promise<{ status: number; message: string }> => {
    return apiAuthDelete(`/loans/offer-templates/${id}`);
  },
  freezeMyOfferTemplate: async (
    id: string,
  ): Promise<{
    status: number;
    message: string;
    template: LenderOfferTemplate;
  }> => {
    return apiAuthPost(`/loans/offer-templates/${id}/freeze`, {});
  },
  unfreezeMyOfferTemplate: async (
    id: string,
  ): Promise<{
    status: number;
    message: string;
    template: LenderOfferTemplate;
  }> => {
    return apiAuthPost(`/loans/offer-templates/${id}/unfreeze`, {});
  },
  extendOfferTemplateExpiry: async (
    id: string,
    validUntil: string | null,
  ): Promise<{
    status: number;
    message: string;
    template: LenderOfferTemplate;
  }> => {
    return apiAuthPut(`/loans/offer-templates/${id}/expiry`, {
      valid_until: validUntil,
    });
  },
  getLenderWallet: async (): Promise<Wallet> => {
    return api.getWallet();
  },
  getLenderTransactions: async (
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{ transactions: LenderWalletTransaction[]; total: number }> => {
    return api.getTransactions(page, pageSize);
  },
  getLenderEarnings: async (): Promise<LenderEarnings> => {
    return apiAuthGet("/loans/earnings");
  },

  // ─── Referrals ───
  getReferralInfo: async (): Promise<ReferralInfo> => {
    return apiAuthGet("/referrals/me");
  },

  // ─── Public (no auth) ───
  getPlatformInfo: async (): Promise<{
    platform_name: string;
    support_email: string;
    licence_number: string | null;
  }> => {
    return apiGet("/public/platform-info");
  },
  getMarketplacePreview: async (params: MarketplacePreviewParams = {}): Promise<MarketplacePreview> => {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.listingType && params.listingType !== "all") qs.set("listing_type", params.listingType);
    if (params.rate?.length) qs.set("rate", params.rate.join(","));
    if (params.loanType?.length) qs.set("loan_type", params.loanType.join(","));
    if (params.duration?.length) qs.set("duration", params.duration.join(","));
    if (params.city?.length) qs.set("city", params.city.join(","));
    qs.set("offset", String(params.offset ?? 0));
    qs.set("limit", String(params.limit ?? 6));
    return apiGet(`/public/marketplace-preview?${qs.toString()}`);
  },

  // ─── Support tickets ───
  createSupportTicket: async (data: {
    subject: string;
    category: string;
    message: string;
  }): Promise<{ status: number; message: string; ticket: SupportTicket }> => {
    return apiAuthPost("/support", data);
  },
  getMySupportTickets: async (): Promise<SupportTicket[]> => {
    const res = await apiAuthGet<{ tickets: SupportTicket[] }>("/support/mine");
    return res.tickets;
  },
  getSupportTicket: async (id: string): Promise<SupportTicket> => {
    const res = await apiAuthGet<{ ticket: SupportTicket }>(`/support/${id}`);
    return res.ticket;
  },
  replySupportTicket: async (
    id: string,
    message: string,
  ): Promise<{ status: number; ticket: SupportTicket }> => {
    return apiAuthPost(`/support/${id}/messages`, { message });
  },

  // ─── FAQ ───
  getFaqs: async (params?: { q?: string; category?: string }): Promise<Faq[]> => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.category) qs.set("category", params.category);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    const res = await apiAuthGet<{ faqs: Faq[] }>(`/faqs${suffix}`);
    return res.faqs;
  },

  // ─── Disputes ───
  fileDispute: async (data: {
    category: string;
    description: string;
    loan_id?: string;
  }): Promise<{ status: number; message: string; dispute: Dispute }> => {
    return apiAuthPost("/disputes", data);
  },
  getMyDisputes: async (): Promise<Dispute[]> => {
    const res = await apiAuthGet<{ disputes: Dispute[] }>("/disputes/mine");
    return res.disputes;
  },
  getDispute: async (id: string): Promise<Dispute> => {
    const res = await apiAuthGet<{ dispute: Dispute }>(`/disputes/${id}`);
    return res.dispute;
  },
  postDisputeMessage: async (id: string, message: string): Promise<DisputeMessage> => {
    const res = await apiAuthPost<{ message_data: DisputeMessage }>(`/disputes/${id}/messages`, { message });
    return res.message_data;
  },
  proposeDisputeResolution: async (
    id: string,
    data: { note: string; settlementAmount?: number; payer: "self" | "other" },
  ): Promise<{ status: number; message: string; dispute: Dispute }> => {
    return apiAuthPost(`/disputes/${id}/propose`, {
      note: data.note,
      settlement_amount: data.settlementAmount,
      payer: data.payer,
    });
  },
  respondToDisputeProposal: async (
    id: string,
    accept: boolean,
  ): Promise<{ status: number; dispute: Dispute }> => {
    return apiAuthPost(`/disputes/${id}/respond-proposal`, { accept });
  },
  escalateDispute: async (id: string): Promise<{ status: number; message: string; dispute: Dispute }> => {
    return apiAuthPost(`/disputes/${id}/escalate`, {});
  },
  // Reuses /loans/active, which despite the name returns every loan (any
  // status) the current user is on as either borrower or lender — exactly
  // what's needed to pick "which loan is this dispute about."
  getMyLoansForDispute: async (): Promise<ActiveLoan[]> => {
    const res = await apiAuthGet<{ total: number; loans: ActiveLoan[] }>("/loans/active?limit=100");
    return res.loans;
  },

  // ─── Admin: Disputes ───
  getAdminDisputes: async (
    page: number = 1,
    pageSize: number = 20,
    status?: string,
  ): Promise<{ disputes: Dispute[]; total: number }> => {
    const params = new URLSearchParams();
    params.set("skip", String((page - 1) * pageSize));
    params.set("limit", String(pageSize));
    if (status) params.set("status", status);
    return apiAuthGet(`/admin/disputes?${params.toString()}`);
  },
  getAdminDisputeDetail: async (id: string): Promise<Dispute> => {
    const res = await apiAuthGet<{ dispute: Dispute }>(`/admin/disputes/${id}`);
    return res.dispute;
  },
  resolveDispute: async (
    id: string,
    data: {
      status: "investigating" | "resolved" | "rejected";
      resolutionNote?: string;
      settlementAmount?: number;
      settlementPayer?: "filer" | "respondent";
    },
  ): Promise<{ status: number; message: string }> => {
    return apiAuthPut(`/admin/disputes/${id}`, {
      status: data.status,
      resolution_note: data.resolutionNote,
      settlement_amount: data.settlementAmount,
      settlement_payer: data.settlementPayer,
    });
  },

  // ─── Admin: Support Tickets ───
  getAdminSupportTickets: async (
    page: number = 1,
    pageSize: number = 20,
    status?: string,
  ): Promise<{ tickets: AdminSupportTicket[]; total: number }> => {
    const params = new URLSearchParams();
    params.set("skip", String((page - 1) * pageSize));
    params.set("limit", String(pageSize));
    if (status) params.set("status", status);
    return apiAuthGet(`/admin/support-tickets?${params.toString()}`);
  },
  getAdminSupportTicketDetail: async (id: string): Promise<AdminSupportTicket> => {
    const res = await apiAuthGet<{ ticket: AdminSupportTicket }>(`/admin/support-tickets/${id}`);
    return res.ticket;
  },
  replyAdminSupportTicket: async (
    id: string,
    message: string,
  ): Promise<{ status: number; message: string }> => {
    return apiAuthPost(`/admin/support-tickets/${id}/reply`, { message });
  },
  updateSupportTicketStatus: async (
    id: string,
    status: "open" | "in_progress" | "resolved" | "closed",
  ): Promise<{ status: number; message: string }> => {
    return apiAuthPut(`/admin/support-tickets/${id}/status`, { status });
  },

  // ─── Sessions ───
  getLoginSessions: async (): Promise<LoginSessionInfo[]> => {
    const res = await apiAuthGet<{ sessions: LoginSessionInfo[] }>(
      "/sessions/",
    );
    return res.sessions;
  },
  signOutEverywhere: async (): Promise<{ status: number; message: string }> => {
    return apiAuthPost("/sessions/sign-out-everywhere", {});
  },

  // ─── Web Push ───
  getVapidPublicKey: async (): Promise<{ public_key: string | null }> => {
    return apiGet("/webpush/vapid-public-key");
  },
  subscribeWebPush: async (data: {
    endpoint: string;
    p256dh: string;
    auth: string;
  }): Promise<{ status: number; message: string }> => {
    return apiAuthPost("/webpush/subscribe", data);
  },
  unsubscribeWebPush: async (
    endpoint: string,
  ): Promise<{ status: number; message: string }> => {
    return apiAuthPost("/webpush/unsubscribe", { endpoint });
  },
};
