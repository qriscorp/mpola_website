"use client";

import { use } from "react";
import { LenderPageHeader } from "@/components/lender-top-nav";
import { DisputeDetailContent } from "@/components/dispute-detail-content";

export default function LenderDisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="space-y-6">
      <LenderPageHeader title="Dispute" />
      <DisputeDetailContent disputeId={id} accent="gold" backHref="/lender/disputes" />
    </div>
  );
}
