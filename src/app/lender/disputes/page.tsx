"use client";

import { LenderPageHeader } from "@/components/lender-top-nav";
import { DisputesPageContent } from "@/components/disputes-page-content";

export default function LenderDisputesPage() {
  return (
    <div className="space-y-6">
      <LenderPageHeader title="Disputes" />
      <DisputesPageContent accent="gold" />
    </div>
  );
}
