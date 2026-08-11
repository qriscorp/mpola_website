import { CURRENCY } from "./constants";

export function formatCurrency(amount: number): string {
  return `${CURRENCY} ${amount.toLocaleString("en-UG")}`;
}

export function formatRate(rate: number): string {
  return `${rate}%/month`;
}

/** A loan's term is either `duration` (months, standard) or `duration_days`
 * (an "emergency" short-term loan, 1-29 days, single bullet repayment) —
 * exactly one is ever set. Use this wherever a duration is displayed
 * instead of assuming `duration` alone, which is null for emergency loans. */
export function formatDuration(
  duration: number | null | undefined,
  durationDays: number | null | undefined,
): string {
  if (durationDays != null) {
    return `${durationDays} day${durationDays === 1 ? "" : "s"}`;
  }
  if (duration != null) {
    return `${duration} month${duration === 1 ? "" : "s"}`;
  }
  return "—";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
    case "approved":
    case "paid":
    case "confirmed":
    case "accepted":
    case "verified":
      return "text-emerald-600 bg-emerald-50";
    case "reviewing_offers":
    case "pending":
    case "due":
    case "awaiting_guarantors":
      return "text-amber-600 bg-amber-50";
    case "completed":
      return "text-blue-600 bg-blue-50";
    case "rejected":
    case "overdue":
    case "declined":
    case "defaulted":
      return "text-red-600 bg-red-50";
    case "upcoming":
    case "expired":
      return "text-gray-500 bg-gray-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "awaiting_guarantors":
      return "Awaiting Guarantors";
    case "reviewing_offers":
      return "Reviewing Offers";
    case "active":
      return "Active";
    case "completed":
      return "Completed";
    case "submitted":
      return "Submitted";
    case "draft":
      return "Draft";
    case "rejected":
      return "Rejected";
    case "expired":
      return "Expired";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

/** A LoanApplication's status alone can't tell "accepted, waiting on the
 * lender to release funds" apart from "actually funded" — both are stored
 * as status="funded" (see _app_response); only the associated Loan's own
 * status (loan_status) distinguishes them. Use this instead of
 * getStatusLabel/getStatusColor wherever an application's status is shown. */
export function getApplicationStatusLabel(status: string, loanStatus?: string | null): string {
  if (status === "funded") {
    return loanStatus && loanStatus !== "pending_disbursement" ? "Funded" : "Awaiting Disbursement";
  }
  return getStatusLabel(status);
}

export function getApplicationStatusColor(status: string, loanStatus?: string | null): string {
  if (status === "funded") {
    return loanStatus && loanStatus !== "pending_disbursement"
      ? "text-emerald-600 bg-emerald-50"
      : "text-amber-600 bg-amber-50";
  }
  return getStatusColor(status);
}
