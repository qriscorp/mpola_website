"use client";

import { BorrowerPageHeader } from "@/components/top-nav";
import { ApprovalsList } from "@/components/approvals-list";

export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Approvals" />
      <p className="text-sm text-gray-500 -mt-4 dark:text-gray-400">
        Anything that needs your action shows up here — like a guarantor request from someone you know.
      </p>
      <ApprovalsList />
    </div>
  );
}
