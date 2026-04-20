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

export const api = {
  // Auth
  signIn: async (_data: {
    phoneOrEmail: string;
    password: string;
  }): Promise<User> => {
    await delay();
    return currentUser;
  },
  register: async (_data: Record<string, unknown>): Promise<User> => {
    await delay();
    return currentUser;
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
