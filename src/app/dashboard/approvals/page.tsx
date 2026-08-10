"use client";

import { BorrowerPageHeader } from "@/components/top-nav";
import { ApprovalsList } from "@/components/approvals-list";

export default function ApprovalsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <BorrowerPageHeader title="Approvals" />
      <p className="text-sm text-gray-500 -mt-4">
        Anything that needs your action shows up here — like a guarantor request from someone you know.
      </p>
      <ApprovalsList />
    </div>
  );
}
