"use client";

import { LenderPageHeader } from "@/components/lender-top-nav";
import { HelpPageContent } from "@/components/help-page-content";

export default function LenderHelpPage() {
  return (
    <div className="space-y-6">
      <LenderPageHeader title="Help & Support" />
      <HelpPageContent accent="gold" />
    </div>
  );
}
