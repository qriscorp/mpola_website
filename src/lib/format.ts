import { CURRENCY } from "./constants";

export function formatCurrency(amount: number): string {
  return `${CURRENCY} ${amount.toLocaleString("en-UG")}`;
}

export function formatRate(rate: number): string {
  return `${rate}%/month`;
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
    case "funded":
    case "approved":
    case "paid":
    case "confirmed":
    case "accepted":
    case "verified":
      return "text-emerald-600 bg-emerald-50";
    case "reviewing_offers":
    case "pending":
    case "due":
      return "text-amber-600 bg-amber-50";
    case "completed":
      return "text-blue-600 bg-blue-50";
    case "rejected":
    case "overdue":
    case "declined":
    case "defaulted":
      return "text-red-600 bg-red-50";
    case "upcoming":
      return "text-gray-500 bg-gray-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
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
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
