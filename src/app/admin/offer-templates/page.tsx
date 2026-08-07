"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Snowflake, Sun } from "lucide-react";
import { toast } from "sonner";
import {
  useOfferTemplatesForReview,
  useReviewOfferTemplate,
  useFreezeOfferTemplate,
  useUnfreezeOfferTemplate,
} from "@/hooks/use-admin";
import { formatCurrency } from "@/lib/format";
import { CardSkeleton } from "@/components/skeletons";
import { FadeSwap } from "@/components/motion/fade-swap";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";

type StatusTab = "pending_review" | "approved" | "rejected" | "draft" | "all";
const TABS: { key: StatusTab; label: string }[] = [
  { key: "pending_review", label: "Pending Review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "draft", label: "Drafts" },
  { key: "all", label: "All" },
];

const statusClass: Record<string, string> = {
  pending_review: "bg-amber-50 text-amber-600 border-amber-200",
  approved: "bg-emerald-50 text-emerald-600 border-emerald-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
  draft: "bg-gray-100 text-gray-500 border-gray-200",
};

const statusLabel: Record<string, string> = {
  pending_review: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  draft: "Draft",
};

export default function AdminOfferTemplatesPage() {
  const [tab, setTab] = useState<StatusTab>("pending_review");
  const { data: templates, isLoading } = useOfferTemplatesForReview(
    tab === "all" ? undefined : tab,
  );
  const review = useReviewOfferTemplate();
  const freeze = useFreezeOfferTemplate();
  const unfreeze = useUnfreezeOfferTemplate();

  const handleReview = (id: string, action: "approve" | "reject") => {
    review.mutate(
      { id, action },
      {
        onSuccess: (res) => {
          if (action === "approve") {
            toast.success(
              res.offers_created > 0
                ? `Approved — ${res.offers_created} matching application${res.offers_created === 1 ? "" : "s"} offered automatically.`
                : "Approved — it'll now match new applications automatically.",
            );
          } else {
            toast.success("Offer rejected.");
          }
        },
        onError: (err: Error) => toast.error(err.message || "Failed to review offer"),
      },
    );
  };

  const handleFreeze = (id: string) => {
    freeze.mutate(id, {
      onSuccess: () => toast.success("Frozen — it'll stop matching new applications."),
      onError: (err: Error) => toast.error(err.message || "Failed to freeze offer"),
    });
  };

  const handleUnfreeze = (id: string) => {
    unfreeze.mutate(id, {
      onSuccess: () => toast.success("Unfrozen — it can match again."),
      onError: (err: Error) => toast.error(err.message || "Failed to unfreeze offer"),
    });
  };

  const list = templates ?? [];

  return (
    <FadeSwap
      loading={isLoading}
      skeleton={
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
            Standing Offers
          </h1>
          <CardSkeleton count={3} />
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
            Standing Offers
          </h1>
          <p className="text-sm text-muted-foreground">
            Review lenders&apos; general lending criteria (from Post an Offer)
            before they go live and start auto-matching applications.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                tab === t.key
                  ? "bg-[#2BB5A0] border-[#2BB5A0] text-white"
                  : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#2BB5A0]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <Card className="bg-white dark:bg-gray-900">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No standing offers in this category.
            </CardContent>
          </Card>
        ) : (
          <StaggerList className="space-y-4">
            {list.map((t) => (
              <StaggerItem key={t.id}>
                <Card className="bg-white dark:bg-gray-900">
                  <CardContent className="p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <p className="font-bold text-[#1B2B3A] dark:text-white">
                          {t.lender_name ?? "Unknown lender"}
                        </p>
                        <p className="text-lg font-black text-[#1B2B3A] dark:text-white mt-1">
                          {formatCurrency(t.min_amount)} –{" "}
                          {formatCurrency(t.max_amount)}
                        </p>
                        <p className="text-[#2BB5A0] font-semibold text-sm mt-0.5">
                          {t.interest_rate}%/month · Max {t.max_duration} months
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusClass[t.status] ?? statusClass.pending_review}`}
                        >
                          {statusLabel[t.status] ?? t.status}
                        </span>
                        {t.is_frozen && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-blue-50 text-blue-600 border-blue-200">
                            Frozen ({t.frozen_by === "admin" ? "by admin" : "by lender"})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Accepted Loan Types
                        </p>
                        <p className="text-[#1B2B3A] dark:text-white capitalize mt-0.5">
                          {t.accepted_loan_types.length > 0
                            ? t.accepted_loan_types.join(", ")
                            : "Any loan type"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Required Documents
                        </p>
                        <p className="text-[#1B2B3A] dark:text-white mt-0.5">
                          {t.required_documents.length > 0
                            ? t.required_documents.join(", ")
                            : "None"}
                        </p>
                      </div>
                      {t.description && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Description
                          </p>
                          <p className="text-[#1B2B3A] dark:text-white mt-0.5">
                            {t.description}
                          </p>
                        </div>
                      )}
                      {t.max_concurrent_loans != null && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Max Concurrent Loans
                          </p>
                          <p className="text-[#1B2B3A] dark:text-white mt-0.5">
                            {t.max_concurrent_loans}
                          </p>
                        </div>
                      )}
                      {t.valid_until && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Valid Until
                          </p>
                          <p className="text-[#1B2B3A] dark:text-white mt-0.5">
                            {new Date(t.valid_until).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {t.status === "pending_review" && (
                      <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <Button
                          onClick={() => handleReview(t.id, "approve")}
                          disabled={review.isPending}
                          className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleReview(t.id, "reject")}
                          disabled={review.isPending}
                          className="gap-2 hover:border-red-300 hover:text-red-600"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {t.status === "approved" && (
                      <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                        {t.is_frozen ? (
                          <Button
                            onClick={() => handleUnfreeze(t.id)}
                            disabled={unfreeze.isPending}
                            className="gap-2 bg-[#2BB5A0] hover:bg-[#239E8C] text-white"
                          >
                            <Sun className="h-4 w-4" />
                            Unfreeze
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => handleFreeze(t.id)}
                            disabled={freeze.isPending}
                            className="gap-2 hover:border-blue-300 hover:text-blue-600"
                          >
                            <Snowflake className="h-4 w-4" />
                            Freeze
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </div>
    </FadeSwap>
  );
}
