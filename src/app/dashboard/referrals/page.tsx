"use client";

import { BorrowerPageHeader } from "@/components/top-nav";
import { ReferralPageContent } from "@/components/referral-page-content";

export default function BorrowerReferralsPage() {
  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Invite Friends" />
      <ReferralPageContent accent="teal" />
    </div>
  );
}
