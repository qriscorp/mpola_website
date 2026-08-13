"use client";

import { use } from "react";
import { BorrowerPageHeader } from "@/components/top-nav";
import { DisputeDetailContent } from "@/components/dispute-detail-content";

export default function BorrowerDisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Dispute" />
      <DisputeDetailContent disputeId={id} accent="teal" backHref="/dashboard/disputes" />
    </div>
  );
}
