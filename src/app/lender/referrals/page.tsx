"use client";

import { LenderPageHeader } from "@/components/lender-top-nav";
import { ReferralPageContent } from "@/components/referral-page-content";

export default function LenderReferralsPage() {
  return (
    <div className="space-y-6">
      <LenderPageHeader title="Invite Friends" />
      <ReferralPageContent accent="gold" />
    </div>
  );
}
