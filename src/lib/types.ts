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
  location: string;
  createdAt: string;
}

export interface LoanApplication {
  id: string;
  reference: string;
  amount: number;
  duration: number;
  loanType: "personal" | "business";
  purpose: string;
  description?: string;
  status:
    | "draft"
    | "submitted"
    | "reviewing_offers"
    | "active"
    | "completed"
    | "rejected";
  offersCount: number;
  createdAt: string;
}

export interface LoanOffer {
  id: string;
  applicationId: string;
  lenderName: string;
  lenderInitials: string;
  lenderLogo?: string;
  rating: number;
  reviewCount: number;
  interestRate: number;
  monthlyPayment: number;
  totalRepayable: number;
  approvalTime: string;
  offerSentAt: string;
  features: string[];
  isBestRate?: boolean;
  isFeatured?: boolean;
  status: "pending" | "accepted" | "declined" | "expired";
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

export interface ActiveLoan {
  id: string;
  borrower_id: string;
  lender_id: string;
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
  status: "active" | "completed" | "overdue" | "defaulted";
  disbursed_at: string | null;
  created_at: string;
  repayments?: LoanRepayment[];
}

export interface Guarantor {
  id: string;
  fullName: string;
  relationship: string;
  phone: string;
  email: string;
  status: "pending" | "confirmed" | "declined";
  confirmedAt?: string;
}

export interface Document {
  key: string;
  label: string;
  description: string;
  status: "uploaded" | "not_uploaded";
  fileName?: string;
}

export interface Lender {
  id: string;
  name: string;
  initials: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  approvalTime: string;
  minRate: number;
  estimatedMonthly: number;
  features: string[];
  isFeatured?: boolean;
  isBestRate?: boolean;
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
  type: "offer" | "payment" | "status" | "system";
  read: boolean;
  createdAt: string;
}

// ─── Admin Types ───

export interface AdminStats {
  totalUsers: number;
  activeLoans: number;
  pendingApplications: number;
  totalDisbursed: number;
  monthlyRevenue: number;
  defaultRate: number;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  accountType: "individual" | "business";
  kycStatus: "pending" | "verified" | "rejected";
  activeLoans: number;
  totalBorrowed: number;
  joinedAt: string;
  status: "active" | "suspended" | "banned";
}

export interface AdminLoan {
  id: string;
  reference: string;
  borrowerName: string;
  lenderName: string;
  amount: number;
  interestRate: number;
  status: "active" | "overdue" | "completed" | "defaulted";
  disbursedAt: string;
  nextPaymentDate: string;
  paidInstalments: number;
  totalInstalments: number;
}

export interface AdminApplication {
  id: string;
  reference: string;
  borrowerName: string;
  amount: number;
  loanType: "personal" | "business";
  status: "submitted" | "reviewing_offers" | "approved" | "rejected";
  offersCount: number;
  createdAt: string;
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

export interface MarketplaceBorrower {
  id: string;
  name: string;
  initials: string;
  location: string;
  kycVerified: boolean;
  loanType: "Business" | "Personal";
  amount: number;
  duration: number;
  purpose: string;
  documents: number;
  guarantorsConfirmed: number;
}

export interface BorrowerProfile {
  id: string;
  name: string;
  initials: string;
  location: string;
  memberSince: string;
  kycVerified: boolean;
  requestingAmount: number;
  duration: number;
  loanType: "Business" | "Personal";
  purpose: string;
  monthlyIncome: number;
  existingObligations: number;
  disposableIncome: number;
  dtiRatio: number;
  dtiRating: string;
  creditScore: number;
  creditRating: string;
  paymentHistory: string;
  creditUtilization: string;
  creditAge: string;
  recentEnquiries: number;
  applications: number;
  loansCompleted: string;
  currentOffers: number;
  appliedAt: string;
  responseTime: string;
  riskLevel: "Low Risk" | "Medium Risk" | "High Risk";
  riskDescription: string;
}

/** Lenders and borrowers share the same wallet model on the backend. */
export type LenderWalletTransaction = WalletTransaction;

export interface LenderEarnings {
  totalEarnings: number;
  thisMonth: number;
  avgYield: number;
  monthlyData: { month: string; amount: number }[];
}
