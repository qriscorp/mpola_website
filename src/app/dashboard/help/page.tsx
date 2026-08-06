"use client";

import { BorrowerPageHeader } from "@/components/top-nav";
import { HelpPageContent } from "@/components/help-page-content";

export default function BorrowerHelpPage() {
  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Help & Support" />
      <HelpPageContent accent="teal" />
    </div>
  );
}
