"use client";

import { LenderPageHeader } from "@/components/lender-top-nav";
import { ApprovalsList } from "@/components/approvals-list";

export default function LenderApprovalsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <LenderPageHeader title="Approvals" />
      <p className="text-sm text-gray-500 -mt-4">
        Anything that needs your action shows up here — like a guarantor request from someone you know.
      </p>
      <ApprovalsList />
    </div>
  );
}
