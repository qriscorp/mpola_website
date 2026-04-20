export const APP_NAME = "LendFlow";
export const PORTAL_NAME = "BORROWER PORTAL";

export const COLORS = {
  navy: "#1B2B3A",
  navyLight: "#243647",
  teal: "#2BB5A0",
  tealDark: "#239E8C",
  tealLight: "#E8F8F5",
  gold: "#C4A55A",
  goldLight: "#F5F0E0",
} as const;

export const CURRENCY = "UGX";

export const LOAN_PURPOSES = [
  "Business expansion",
  "Working capital",
  "Equipment purchase",
  "Education",
  "Medical expenses",
  "Home improvement",
  "Debt consolidation",
  "Agriculture",
  "Personal use",
  "Other",
] as const;

export const LOAN_DURATIONS = [6, 12, 18, 24, 36] as const;

export const RELATIONSHIPS = [
  "Sibling",
  "Parent",
  "Spouse",
  "Friend",
  "Business Partner",
  "Colleague",
  "Other",
] as const;

export const DOCUMENT_TYPES = {
  required: [
    {
      key: "national_id",
      label: "National ID (NIN)",
      description: "Front & back · JPG or PDF",
    },
    {
      key: "payslips",
      label: "Last 3 Payslips",
      description: "PDF · combined or separate",
    },
    {
      key: "bank_statement",
      label: "6-Month Bank Statement",
      description: "PDF · from primary account",
    },
    {
      key: "passport_photo",
      label: "Passport Photo",
      description: "Recent, clear face photo",
    },
  ],
  recommended: [
    {
      key: "trading_licence",
      label: "Trading Licence",
      description: "PDF · boosts your rate",
    },
    {
      key: "utility_bill",
      label: "Utility Bill / Proof of Address",
      description: "Within last 3 months",
    },
    {
      key: "collateral",
      label: "Collateral Documents",
      description: "Land title or asset valuation",
    },
  ],
} as const;

export const PAYMENT_METHODS = [
  "LendFlow Wallet",
  "MTN MoMo",
  "Airtel Money",
] as const;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
