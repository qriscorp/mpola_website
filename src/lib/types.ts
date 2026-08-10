// ─── Core Types (Models) ───

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  nin: string;
  accountType: "individual" | "business";
  businessName?: string;
  registrationNumber?: string;
  profilePic?: string;
  kycStatus: "pending" | "verified" | "rejected";
  location?: string;
  twoFactorEnabled?: boolean;
  notifNewApplication?: boolean;
  notifRepaymentReceived?: boolean;
  notifLoanOverdue?: boolean;
  notifPortfolioDigest?: boolean;
  notifLoginAlerts?: boolean;
  creditScore: number;
  createdAt: string;
}

export interface ApplicationBorrower {
  id: string;
  full_name: string | null;
  kyc_status: "pending" | "verified" | "rejected";
  credit_score: number;
}

export interface LoanApplication {
  id: string;
  reference_number: string;
  amount: number;
  duration: number;
  loan_type: "personal" | "business" | "education" | "agricultural" | "emergency";
  purpose: string | null;
  status: "awaiting_guarantors" | "pending" | "approved" | "rejected" | "funded" | "completed" | "defaulted" | "expired";
  interest_rate: number | null;
  monthly_payment: number | null;
  total_repayable: number | null;
  max_interest_rate: number | null;
  valid_until: string | null;
  is_frozen: boolean;
  frozen_by: "borrower" | "admin" | null;
  created_at: string;
  borrower: ApplicationBorrower | null;
  offers_count: number;
  pending_offers_count: number;
  offers?: LoanOffer[];
  guarantors?: Guarantor[];
}

export interface LoanOffer {
  id: string;
  application_id: string;
  application_reference: string | null;
  borrower_name: string | null;
  loan_type: string | null;
  application_status: string | null;
  lender_id: string;
  lender_name: string | null;
  amount: number;
  interest_rate: number;
  duration: number;
  monthly_payment: number | null;
  total_repayable: number | null;
  status: "pending" | "accepted" | "declined" | "expired";
  required_documents: string[];
  required_documents_status: RequiredDocumentStatus[];
  created_at: string;
}

export interface LoanRepayment {
  id: string;
  amount: number;
  instalment_number: number;
  status: string;
  payment_method: "wallet" | "mobile_money" | null;
  transaction_id: string | null;
  created_at: string;
}

export interface RepaymentHistoryItem extends LoanRepayment {
  loan_id: string;
  lender_name: string | null;
}

export interface ActiveLoan {
  id: string;
  borrower_id: string;
  lender_id: string;
  borrower_name: string | null;
  lender_name: string | null;
  amount: number;
  interest_rate: number;
  duration: number;
  monthly_payment: number;
  total_repayable: number;
  total_paid: number;
  paid_instalments: number;
  total_instalments: number;
  next_payment_date: string | null;
  next_payment_amount: number | null;
  status: "pending_disbursement" | "active" | "completed" | "overdue" | "defaulted";
  disbursed_at: string | null;
  created_at: string;
  required_documents: string[];
  required_documents_status: RequiredDocumentStatus[];
  repayments?: LoanRepayment[];
}

export interface Guarantor {
  id: string;
  guarantor_user_id: string;
  full_name: string | null;
  username: string | null;
  relationship_type: string | null;
  status: "pending" | "accepted" | "declined";
}

export interface GuarantorRequest {
  id: string;
  application_id: string;
  status: "pending" | "accepted" | "declined";
  amount: number | null;
  loan_type: string | null;
  duration: number | null;
  borrower_name: string | null;
  created_at: string;
}

export interface Document {
  key: string;
  label: string;
  description: string;
  status: "uploaded" | "not_uploaded";
  fileName?: string;
}

export type WalletTransactionType =
  | "deposit"
  | "withdrawal"
  | "repayment"
  | "disbursement"
  | "top_up";

export type WalletTransactionStatus = "pending" | "completed" | "failed";

export interface WalletTransaction {
  id: string;
  amount: number;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  description: string | null;
  reference: string | null;
  counterparty: string | null;
  created_at: string;
}

export interface Wallet {
  id?: string;
  balance: number;
  currency: string;
  is_wallet_setup: boolean;
  created_at?: string;
}

export interface BankOption {
  code: string;
  name: string;
}

export interface CardDepositInitiateResult {
  checkout_url: string;
  reference: string;
}

export interface TransferStatusResult {
  status: WalletTransactionStatus;
  balance: number;
  fee?: number | null;
}

export interface WithdrawalCharges {
  platform_fee: number;
  provider_fee: number;
  total_fee: number;
}

export interface DashboardStats {
  activeLoans: number;
  applicationsPending: number;
  newOffers: number;
  walletBalance: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string | null;
  read: boolean;
  createdAt: string;
}

// ─── Admin Types ───

export interface AdminStats {
  users: {
    total: number;
    borrowers: number;
    lenders: number;
    active: number;
    suspended: number;
    verified: number;
  };
  applications: {
    total: number;
    pending: number;
  };
  loans: {
    active: number;
    completed: number;
    defaulted: number;
    total_volume: number;
    total_repaid: number;
    avg_interest_rate: number;
  };
  platform: {
    total_wallet_balance: number;
    total_interest_generated: number;
    // Platform fee only (0.5%) — excludes Interswitch/Flutterwave provider
    // surcharges, which are pass-through costs, not Mpola revenue.
    total_platform_revenue: number;
    repayment_rate: number;
    default_rate: number;
    kyc_completion_rate: number;
    pending_offer_templates: number;
  };
  loan_type_mix: { type: string; count: number; percentage: number }[];
  application_status_breakdown: { status: string; count: number }[];
  monthly_trend: { month: string; disbursed: number; collected: number; revenue: number }[];
  user_growth: { month: string; borrowers: number; lenders: number }[];
}

export interface AdminActivityPeriod {
  today: number;
  yesterday: number;
  this_week: number;
  last_week: number;
  week_change_pct: number;
  this_month: number;
  last_month: number;
  month_change_pct: number;
}

export interface AdminActivity {
  users: AdminActivityPeriod;
  transactions: AdminActivityPeriod;
  offers: AdminActivityPeriod;
  daily_activity: {
    date: string;
    new_users: number;
    transactions: number;
    offers: number;
  }[];
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  role: string;
  is_admin: boolean;
  is_super_admin: boolean;
  is_active: boolean;
  is_verified: boolean;
  is_kyc_verified: boolean;
  kyc_status: string;
  credit_score: number;
  active_loans: number;
  total_borrowed: number;
  created_at: string;
}

export interface AdminLoan {
  id: string;
  reference: string;
  borrower_id: string;
  borrower_name: string | null;
  lender_id: string;
  lender_name: string | null;
  amount: number;
  interest_rate: number;
  total_repayable: number;
  total_paid: number;
  paid_instalments: number;
  total_instalments: number;
  disbursed_at: string | null;
  next_payment_date: string | null;
  status: "active" | "overdue" | "completed" | "defaulted";
  created_at: string;
}

export interface AdminApplication {
  id: string;
  reference_number: string;
  borrower_id: string;
  borrower_name: string | null;
  amount: number;
  duration: number;
  loan_type: string;
  status:
    | "awaiting_guarantors"
    | "pending"
    | "approved"
    | "rejected"
    | "funded"
    | "completed"
    | "defaulted"
    | "expired";
  interest_rate: number | null;
  offer_count: number;
  is_frozen: boolean;
  frozen_by: "borrower" | "admin" | null;
  created_at: string;
}

export interface AdminPaymentTx {
  id: string;
  wallet_id: string;
  username: string | null;
  amount: number;
  type: string;
  status: "pending" | "completed" | "failed";
  description: string | null;
  reference: string | null;
  created_at: string;
}

export interface AdminRevenueTx {
  id: string;
  username: string | null;
  category: "mobile_money_withdrawal" | "bank_withdrawal" | "loan_disbursement" | "loan_repayment";
  platform_fee: number;
  created_at: string;
}

export interface AdminRevenue {
  total: number;
  // Platform fee only — Interswitch/Flutterwave provider surcharges are
  // collected from users on withdrawals but passed straight through to the
  // provider, so they're not Mpola revenue and are excluded here.
  totals: { revenue: number };
  by_category: { category: string; revenue: number; count: number }[];
  monthly_revenue: { month: string; revenue: number }[];
  transactions: AdminRevenueTx[];
}

export interface AdminSetting {
  value: string;
  description: string | null;
}

export interface AdminReconciliation {
  wallet_drift: {
    user_id: string;
    username: string | null;
    stored_balance: number;
    ledger_balance: number;
    delta: number;
  }[];
  gateway_mismatches: {
    transaction_id: string;
    reference: string;
    type: string;
    our_status: string;
    gateway_status: string;
  }[];
  checked_count: number;
  generated_at: string;
}

export interface AdminOfferTemplate {
  id: string;
  lender_id: string;
  lender_name: string | null;
  max_amount: number;
  min_amount: number;
  interest_rate: number;
  max_duration: number;
  accepted_loan_types: string[];
  required_documents: string[];
  description: string | null;
  valid_until: string | null;
  max_concurrent_loans: number | null;
  status: "pending_review" | "draft" | "approved" | "rejected";
  is_frozen: boolean;
  frozen_by: "lender" | "admin" | null;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  username: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  ip_address: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface AdminUserLoanSummary {
  id: string;
  other_party: string | null;
  amount: number;
  interest_rate: number;
  total_repayable: number;
  total_paid: number;
  status: string;
  disbursed_at: string | null;
  created_at: string;
}

export interface AdminUserApplicationSummary {
  id: string;
  reference_number: string;
  amount: number;
  loan_type: string;
  status: string;
  created_at: string;
}

export interface AdminUserTransactionSummary {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string | null;
  created_at: string;
}

export interface AdminUserDetail {
  profile: {
    id: string;
    username: string;
    email: string;
    full_name: string | null;
    phone_number: string | null;
    role: string;
    is_active: boolean;
    is_verified: boolean;
    is_kyc_verified: boolean;
    kyc_status: string;
    credit_score: number;
    bio: string | null;
    nin: string | null;
    created_at: string;
  };
  loans_as_borrower: AdminUserLoanSummary[];
  loans_as_lender: AdminUserLoanSummary[];
  applications: AdminUserApplicationSummary[];
  documents: AdminUserDocument[];
  kyc_documents: KYCDocument[];
  wallet: { balance: number; is_wallet_setup: boolean };
  transactions: AdminUserTransactionSummary[];
}

export interface AdminUserDocument {
  id: string;
  application_id: string;
  document_type: string;
  file_url: string;
  file_name: string | null;
  verified: boolean;
  created_at: string;
}

export type KYCDocumentType = "national_id" | "passport" | "profile_photo" | "proof_of_address";

export interface KYCDocument {
  id: string;
  document_type: KYCDocumentType | string;
  file_url: string;
  file_name: string | null;
  verified: boolean;
}

// Account-wide, reusable supporting documents (bank statement, payslip/
// business proof, land title, URA TIN) — separate from KYCDocument
// (identity) and satisfy a lender's required_documents once uploaded, for
// every current and future offer that asks for the same thing.
export type BorrowerDocumentType = "bank_statement" | "business_proof" | "land_title" | "ura_tin";

export interface BorrowerDocument {
  id: string;
  document_type: BorrowerDocumentType | string;
  file_url: string;
  file_name: string | null;
  verified: boolean;
}

export interface RequiredDocumentStatus {
  label: string;
  type: string | null;
  source: "kyc" | "borrower_doc" | null;
  satisfied: boolean;
  file_url: string | null;
  file_name: string | null;
  verified: boolean;
}

// ─── Lender Portal Types ───

export interface LenderProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  accountType: "individual" | "company";
  companyName?: string;
  registrationNumber?: string;
  nin: string;
  tin?: string;
  tier: "standard" | "premium";
  createdAt: string;
}

export interface LenderDashboardStats {
  totalDeployed: number;
  activeLoans: number;
  monthlyReturns: number;
  repaymentRate: number;
}

export interface BorrowerActivity {
  id: string;
  borrowerName: string;
  borrowerInitials: string;
  location: string;
  verified: boolean;
  amount: number;
  loanType: "Business" | "Personal";
  status:
    | "New Application"
    | "Reviewing"
    | "Offer Sent"
    | "Repaying"
    | "Accepted";
}

/** A pending loan application as seen by lenders browsing the open marketplace. */
export type MarketplaceApplication = LoanApplication;

/** Lenders and borrowers share the same wallet model on the backend. */
export type LenderWalletTransaction = WalletTransaction;

export interface LenderOfferTemplate {
  id: string;
  lender_id: string;
  max_amount: number;
  min_amount: number;
  interest_rate: number;
  max_duration: number;
  accepted_loan_types: string[];
  required_documents: string[];
  description: string | null;
  valid_until: string | null;
  max_concurrent_loans: number | null;
  status: "pending_review" | "draft" | "approved" | "rejected";
  is_frozen: boolean;
  frozen_by: "lender" | "admin" | null;
  created_at: string;
}

export interface LenderEarnings {
  total_deployed: number;
  active_loans: number;
  total_repaid: number;
  total_earned: number;
  this_month_earned: number;
  avg_yield: number;
  monthly_earnings: { month: string; amount: number }[];
  concentration_warning: { type: "borrower" | "loan_type"; label: string; pct: number } | null;
}

// ─── Referrals, Support, Disputes, Sessions ───

export interface ReferralInfo {
  referral_code: string;
  referral_link: string;
  total_referred: number;
  referred_users: { full_name: string | null; role: string; created_at: string }[];
}

export interface SupportMessage {
  id: string;
  message: string;
  is_admin: boolean;
  sender_name: string | null;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  message_count: number;
  messages?: SupportMessage[];
}

export interface Dispute {
  id: string;
  category: string;
  description: string;
  status: "open" | "investigating" | "resolved" | "rejected";
  loan_id: string | null;
  resolution_note: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface LoginSessionInfo {
  id: string;
  device_label: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  is_most_recent: boolean;
}
