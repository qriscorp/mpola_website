import { User, DashboardStats } from "./types";

export const currentUser: User = {
  id: "usr_001",
  fullName: "Sarah Nakato",
  email: "sarah.nakato@email.com",
  phone: "+256772843901",
  nin: "CM98041234AB7X",
  accountType: "individual",
  kycStatus: "verified",
  location: "Kampala",
  profilePic: undefined,
  createdAt: "2025-11-15",
};

export const dashboardStats: DashboardStats = {
  activeLoans: 1,
  applicationsPending: 1,
  newOffers: 2,
  walletBalance: 842500,
};

// ─── Notifications ───

import type {
  Notification,
  LenderProfile,
  LenderDashboardStats,
  BorrowerActivity,
} from "./types";

export const notifications: Notification[] = [
  {
    id: "notif_001",
    title: "New Loan Offer",
    message:
      "Kampala Capital Partners has sent you a loan offer of UGX 5,000,000 at 16% APR.",
    type: "offer",
    read: false,
    createdAt: "2026-04-20T14:30:00",
  },
  {
    id: "notif_002",
    title: "Payment Reminder",
    message: "Your next instalment of UGX 350,000 is due on 01 May 2026.",
    type: "payment",
    read: false,
    createdAt: "2026-04-19T09:00:00",
  },
  {
    id: "notif_003",
    title: "Application Update",
    message:
      "Your loan application LF-2026-00847 is now under review by 3 lenders.",
    type: "status",
    read: true,
    createdAt: "2026-04-18T16:45:00",
  },
  {
    id: "notif_004",
    title: "KYC Verified",
    message:
      "Your identity documents have been verified successfully. You can now apply for loans.",
    type: "system",
    read: true,
    createdAt: "2026-04-15T11:20:00",
  },
  {
    id: "notif_005",
    title: "Offer Accepted",
    message:
      "You have accepted the loan offer from Uganda Micro Lenders. Funds will be disbursed within 24hrs.",
    type: "offer",
    read: true,
    createdAt: "2026-04-12T13:00:00",
  },
  {
    id: "notif_006",
    title: "Payment Successful",
    message:
      "Your instalment of UGX 350,000 has been successfully processed via MTN MoMo.",
    type: "payment",
    read: true,
    createdAt: "2026-04-01T10:15:00",
  },
];

// ─── Lender Portal Data ───

export const lenderProfile: LenderProfile = {
  id: "lnd_001",
  fullName: "David Mugisha",
  email: "david@mugisha-capital.ug",
  phone: "+256772100842",
  accountType: "individual",
  nin: "CM98041234AB7X",
  tier: "premium",
  createdAt: "2024-06-15",
};

export const lenderDashboardStats: LenderDashboardStats = {
  totalDeployed: 92400000,
  activeLoans: 18,
  monthlyReturns: 1240000,
  repaymentRate: 98.6,
};

export const borrowerActivities: BorrowerActivity[] = [
  {
    id: "ba_001",
    borrowerName: "Sarah Nakato",
    borrowerInitials: "SN",
    location: "Kampala",
    verified: true,
    amount: 8000000,
    loanType: "Business",
    status: "New Application",
  },
  {
    id: "ba_002",
    borrowerName: "James Okello",
    borrowerInitials: "JO",
    location: "Kampala",
    verified: true,
    amount: 3500000,
    loanType: "Personal",
    status: "Reviewing",
  },
  {
    id: "ba_003",
    borrowerName: "Brenda Achieng",
    borrowerInitials: "BA",
    location: "Kampala",
    verified: true,
    amount: 12000000,
    loanType: "Business",
    status: "Offer Sent",
  },
  {
    id: "ba_004",
    borrowerName: "Ismail Ssemakadde",
    borrowerInitials: "IS",
    location: "Kampala",
    verified: true,
    amount: 2000000,
    loanType: "Personal",
    status: "Repaying",
  },
  {
    id: "ba_005",
    borrowerName: "Christine Tumuheirwe",
    borrowerInitials: "CT",
    location: "Kampala",
    verified: true,
    amount: 5500000,
    loanType: "Business",
    status: "Accepted",
  },
];
