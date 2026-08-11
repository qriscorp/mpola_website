/** Where clicking a notification should take you — mirrors the "action"
 * button already wired into the live toast (see use-realtime.ts), so the
 * persisted Notifications list is just as navigable as the toast was,
 * not just a one-time popup that vanishes after 15s. `isLender` picks the
 * right variant for types relevant to both roles (e.g. guarantor invites). */
export function notificationHref(
  type: string | null,
  isLender: boolean,
): string | null {
  switch (type) {
    case "loan_pending_disbursement":
      return "/lender/portfolio";
    case "loan_disbursed":
      return "/dashboard/wallet";
    case "offer_template_expired":
      return "/lender/offers";
    case "low_wallet_balance":
      return "/lender/wallet";
    case "guarantor_invite_received":
      return isLender ? "/lender/approvals" : "/dashboard/approvals";
    case "guarantor_still_pending":
    case "application_expired":
      return "/dashboard/my-requests";
    default:
      return null;
  }
}
