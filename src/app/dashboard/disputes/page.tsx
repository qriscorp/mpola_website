"use client";

import { BorrowerPageHeader } from "@/components/top-nav";
import { DisputesPageContent } from "@/components/disputes-page-content";

export default function BorrowerDisputesPage() {
  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Disputes" />
      <DisputesPageContent accent="teal" basePath="/dashboard/disputes" />
    </div>
  );
}
