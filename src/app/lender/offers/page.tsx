"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { LenderPageHeader } from "@/components/lender-top-nav";
import { CardSkeleton } from "@/components/skeletons";
import {
  useMyOffers,
  useOfferTemplates,
  useDeleteOfferTemplate,
  useFreezeMyOfferTemplate,
  useUnfreezeMyOfferTemplate,
  useExtendOfferTemplateExpiry,
} from "@/hooks/use-lender";
import { formatCurrency, formatRate } from "@/lib/format";
import type { LoanOffer } from "@/lib/types";
import { FadeSwap } from "@/components/motion/fade-swap";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";

const templateStatusLabel: Record<string, string> = {
  pending_review: "Pending Review",
  draft: "Draft",
  approved: "Approved",
  rejected: "Rejected",
};

const templateStatusClass: Record<string, string> = {
  pending_review: "bg-amber-50 text-amber-600 border-amber-200",
  draft: "bg-gray-100 text-gray-500 border-gray-200",
  approved: "bg-emerald-50 text-emerald-600 border-emerald-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
};

type OfferStatus = LoanOffer["status"];

const tabs: Array<"All" | OfferStatus> = [
  "All",
  "pending",
  "accepted",
  "declined",
  "expired",
];

const tabLabel: Record<"All" | OfferStatus, string> = {
  All: "All",
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
};

function statusBadge(s: OfferStatus) {
  if (s === "accepted")
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
        Accepted
      </span>
    );
  if (s === "declined" || s === "expired")
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
        {s === "declined" ? "Declined" : "Expired"}
      </span>
    );
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
      Pending
    </span>
  );
}

export default function MyOffersPage() {
  const [tab, setTab] = useState<"All" | OfferStatus>("All");
  const { data: offers, isLoading } = useMyOffers();
  const { data: templates } = useOfferTemplates();
  const deleteTemplate = useDeleteOfferTemplate();
  const freezeTemplate = useFreezeMyOfferTemplate();
  const unfreezeTemplate = useUnfreezeMyOfferTemplate();
  const extendExpiry = useExtendOfferTemplateExpiry();
  const [editingExpiryId, setEditingExpiryId] = useState<string | null>(null);
  const [expiryValue, setExpiryValue] = useState("");

  const handleDelete = (id: string) => {
    if (!confirm("Delete this standing offer? This can't be undone.")) return;
    deleteTemplate.mutate(id, {
      onSuccess: () => toast.success("Deleted."),
      onError: (err: Error) => toast.error(err.message || "Failed to delete"),
    });
  };

  const handleFreeze = (id: string) => {
    freezeTemplate.mutate(id, {
      onSuccess: () => toast.success("Frozen — it'll stop matching new applications."),
      onError: (err: Error) => toast.error(err.message || "Failed to freeze"),
    });
  };

  const handleUnfreeze = (id: string) => {
    unfreezeTemplate.mutate(id, {
      onSuccess: () => toast.success("Unfrozen — it can match again."),
      onError: (err: Error) => toast.error(err.message || "Failed to unfreeze"),
    });
  };

  const handleSaveExpiry = (id: string) => {
    extendExpiry.mutate(
      { id, validUntil: expiryValue ? new Date(expiryValue).toISOString() : null },
      {
        onSuccess: () => {
          toast.success("Expiry updated.");
          setEditingExpiryId(null);
        },
        onError: (err: Error) => toast.error(err.message || "Failed to update expiry"),
      },
    );
  };

  const allOffers = offers ?? [];
  const filtered =
    tab === "All" ? allOffers : allOffers.filter((o) => o.status === tab);

  return (
    <FadeSwap
      loading={isLoading}
      skeleton={
        <div className="space-y-6 max-w-5xl">
          <LenderPageHeader title="My Offers" />
          <CardSkeleton count={3} />
        </div>
      }
    >
    <div className="space-y-6 max-w-5xl">
      <LenderPageHeader title="My Offers" />

      {/* Tab filters */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              tab === t
                ? "bg-[#C4A55A] border-[#C4A55A] text-white"
                : "bg-white border-gray-300 text-gray-600 hover:border-[#C4A55A]"
            }`}
          >
            {tabLabel[t]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">
          You haven&apos;t made any offers in this category yet.
        </p>
      ) : (
        <StaggerList className="space-y-4">
          {filtered.map((offer) => (
            <StaggerItem key={offer.id}>
            <Card className="bg-white dark:bg-gray-900">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Left: offer info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h3 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
                        {formatCurrency(offer.amount)}
                      </h3>
                    </div>
                    <p className="text-[#C4A55A] font-semibold text-sm mt-0.5">
                      {formatRate(offer.interest_rate)} · {offer.duration}{" "}
                      months
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {offer.borrower_name ?? "Unknown borrower"}
                      {offer.loan_type ? ` · ${offer.loan_type}` : ""}
                      {offer.application_reference
                        ? ` · #${offer.application_reference}`
                        : ""}
                    </p>
                  </div>

                  {/* Middle: stats */}
                  <div className="flex gap-6 sm:gap-8 shrink-0">
                    <div className="text-center">
                      <p className="text-sm font-bold text-[#1B2B3A] dark:text-white">
                        {offer.monthly_payment
                          ? formatCurrency(offer.monthly_payment)
                          : "—"}
                      </p>
                      <p className="text-[11px] text-gray-400">Monthly</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-[#1B2B3A] dark:text-white">
                        {offer.total_repayable
                          ? formatCurrency(offer.total_repayable)
                          : "—"}
                      </p>
                      <p className="text-[11px] text-gray-400">Repayable</p>
                    </div>
                  </div>

                  {/* Right: status + actions */}
                  <div className="flex items-center gap-3 sm:gap-2 shrink-0 flex-wrap">
                    {statusBadge(offer.status)}
                    <Link
                      href={`/lender/marketplace/${offer.application_id}`}
                      className="px-4 py-1.5 rounded-lg bg-[#C4A55A] text-white text-sm font-semibold hover:bg-[#b3944a] transition-colors"
                    >
                      View Application
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
            </StaggerItem>
          ))}
        </StaggerList>
      )}

      {templates && templates.length > 0 && (
        <StaggerList className="space-y-4">
          <h2 className="text-lg font-bold text-[#1B2B3A] dark:text-white">
            Submitted Standing Offers
          </h2>
          <p className="text-xs text-gray-400 -mt-3">
            Your general lending criteria from Post an Offer — reviewed before
            going live on the marketplace.
          </p>
          {templates.map((t) => (
            <StaggerItem key={t.id}>
            <Card className="bg-white dark:bg-gray-900">
              <CardContent className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-[#1B2B3A] dark:text-white">
                      {formatCurrency(t.min_amount)} – {formatCurrency(t.max_amount)}
                    </p>
                    <p className="text-[#C4A55A] font-semibold text-sm mt-0.5">
                      {formatRate(t.interest_rate)} · Max {t.max_duration} months
                    </p>
                    <p className="text-xs text-gray-400 mt-1 capitalize">
                      {t.accepted_loan_types.join(", ") || "Any loan type"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${templateStatusClass[t.status] ?? templateStatusClass.pending_review}`}
                    >
                      {templateStatusLabel[t.status] ?? t.status}
                    </span>
                    {t.is_frozen && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-blue-50 text-blue-600 border-blue-200">
                        Frozen ({t.frozen_by === "admin" ? "by admin" : "by you"})
                      </span>
                    )}
                  </div>
                </div>

                {t.status === "pending_review" && (
                  <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <Link
                      href={`/lender/post-offer?edit=${t.id}`}
                      className="px-4 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:border-[#C4A55A] hover:text-[#C4A55A] transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={deleteTemplate.isPending}
                      className="px-4 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                )}

                {t.status === "approved" && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex items-center gap-3">
                      {t.is_frozen ? (
                        <button
                          onClick={() => handleUnfreeze(t.id)}
                          disabled={unfreezeTemplate.isPending || t.frozen_by === "admin"}
                          className="px-4 py-1.5 rounded-lg bg-[#C4A55A] text-white text-sm font-semibold hover:bg-[#b3944a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Unfreeze
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFreeze(t.id)}
                          disabled={freezeTemplate.isPending}
                          className="px-4 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors disabled:opacity-50"
                        >
                          Freeze
                        </button>
                      )}
                      {t.is_frozen && t.frozen_by === "admin" && (
                        <p className="text-xs text-gray-400">
                          Frozen by an admin — only they can unfreeze it.
                        </p>
                      )}
                    </div>

                    {/* Expiry — the one thing editable post-approval, since an
                        expired offer otherwise stops matching forever with no
                        way to revive it short of a whole new submission. */}
                    {editingExpiryId === t.id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="date"
                          value={expiryValue}
                          onChange={(e) => setExpiryValue(e.target.value)}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-[#1B2B3A] outline-none focus:ring-2 focus:ring-[#C4A55A]/30"
                        />
                        <button
                          onClick={() => handleSaveExpiry(t.id)}
                          disabled={extendExpiry.isPending}
                          className="px-3 py-1.5 rounded-lg bg-[#C4A55A] text-white text-xs font-semibold hover:bg-[#b3944a] transition-colors disabled:opacity-50"
                        >
                          {extendExpiry.isPending ? "Saving…" : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingExpiryId(null)}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 hover:border-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                        {t.valid_until && (
                          <button
                            onClick={() => {
                              setExpiryValue("");
                              handleSaveExpiry(t.id);
                            }}
                            disabled={extendExpiry.isPending}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          >
                            Clear expiry
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>
                          {t.valid_until
                            ? `Valid until ${new Date(t.valid_until).toLocaleDateString()}`
                            : "No expiry set"}
                        </span>
                        <button
                          onClick={() => {
                            setExpiryValue(t.valid_until ? t.valid_until.slice(0, 10) : "");
                            setEditingExpiryId(t.id);
                          }}
                          className="text-[#C4A55A] font-medium hover:underline"
                        >
                          {t.valid_until ? "Change" : "Set expiry"}
                        </button>
                      </div>
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
