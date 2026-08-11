"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LenderPageHeader } from "@/components/lender-top-nav";
import { CardSkeleton } from "@/components/skeletons";
import {
  useMarketplace,
  useMyOffers,
  useMakeOffer,
  useSkipApplication,
} from "@/hooks/use-lender";
import { formatCurrency, formatDuration, getInitials } from "@/lib/format";
import { DOCUMENT_LABEL_OPTIONS } from "@/lib/document-labels";
import type { MarketplaceApplication } from "@/lib/types";
import { FadeSwap } from "@/components/motion/fade-swap";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";

type AppStatus = "Pending" | "Approved" | "Declined";

const avatarColors = ["bg-[#1B2B3A]", "bg-red-700", "bg-emerald-700", "bg-amber-700"];

const tabs: Array<"All" | AppStatus> = [
  "All",
  "Pending",
  "Approved",
  "Declined",
];

function timeSince(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function ApplicationsPage() {
  const [tab, setTab] = useState<"All" | AppStatus>("All");
  const [offerModal, setOfferModal] = useState<MarketplaceApplication | null>(
    null,
  );
  const [rate, setRate] = useState("3");
  const [requiredDocs, setRequiredDocs] = useState<string[]>([]);

  function toggleDoc(label: string) {
    setRequiredDocs((prev) =>
      prev.includes(label) ? prev.filter((d) => d !== label) : [...prev, label],
    );
  }

  const { data: marketplace, isLoading } = useMarketplace();
  const { data: myOffers } = useMyOffers();
  const makeOffer = useMakeOffer();
  const skipApplication = useSkipApplication();

  const applications = marketplace?.applications ?? [];
  const pendingOffersCount = (myOffers ?? []).filter(
    (o) => o.status === "pending",
  ).length;

  // The marketplace only ever returns open (pending) applications — once a
  // lender's offer is accepted the application leaves the marketplace, so
  // "Approved"/"Declined" are always empty here by design, not a bug.
  const filtered = tab === "All" || tab === "Pending" ? applications : [];

  const rateInvalid = rate !== "" && (Number(rate) < 0.1 || Number(rate) > 25);

  function confirmOffer() {
    if (!offerModal || rate === "" || rateInvalid) return;
    makeOffer.mutate(
      {
        application_id: offerModal.id,
        amount: offerModal.amount,
        interest_rate: Number(rate),
        duration: offerModal.duration_days != null ? null : offerModal.duration,
        duration_days: offerModal.duration_days,
        required_documents: requiredDocs,
      },
      { onSuccess: () => { setOfferModal(null); setRequiredDocs([]); } },
    );
  }

  return (
    <FadeSwap
      loading={isLoading}
      skeleton={
        <div className="space-y-6 max-w-5xl">
          <LenderPageHeader title="Applications Inbox" />
          <CardSkeleton count={3} />
        </div>
      }
    >
    <div className="space-y-6 max-w-5xl">
      <LenderPageHeader title="Applications Inbox" />

      {/* Context banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
        <span className="font-bold text-[#1B2B3A] dark:text-white">
          {applications.length} open request{applications.length === 1 ? "" : "s"} on the marketplace
        </span>
        <span className="text-sm text-gray-500 ml-auto hidden sm:inline">
          {pendingOffersCount} of your offers awaiting a response
        </span>
      </div>

      {/* Tabs */}
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
            {t}{" "}
            {t === "All"
              ? `(${applications.length})`
              : t === "Pending"
                ? `(${applications.length})`
                : "(0)"}
          </button>
        ))}
      </div>

      {/* Application rows */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-10 text-center text-sm text-gray-400">
          No applications in this category.
        </div>
      ) : (
        <StaggerList className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
          {filtered.map((app, idx) => (
            <StaggerItem
              key={app.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5"
            >
              {/* Avatar + name */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback
                    className={`${avatarColors[idx % avatarColors.length]} text-white text-sm font-bold`}
                  >
                    {getInitials(app.borrower?.full_name ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-[#1B2B3A] dark:text-white text-sm">
                    {app.borrower?.full_name ?? "Unknown"}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {app.loan_type} · {timeSince(app.created_at)} · Score{" "}
                    {app.borrower?.credit_score ?? "—"}/100
                  </p>
                  {/* Score bar */}
                  <div className="mt-1 h-1 w-24 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#C4A55A]"
                      style={{ width: `${app.borrower?.credit_score ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="shrink-0 text-right sm:text-center">
                <p className="font-bold text-[#1B2B3A] dark:text-white">
                  {formatCurrency(app.amount)}
                </p>
                <p className="text-xs text-gray-400">{formatDuration(app.duration, app.duration_days)}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setRate("15");
                    setOfferModal(app);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
                >
                  Make Offer
                </button>
                <button
                  onClick={() =>
                    skipApplication.mutate(app.id, {
                      onSuccess: () =>
                        toast.success(
                          "Hidden from your marketplace — still visible to other lenders.",
                        ),
                    })
                  }
                  disabled={skipApplication.isPending}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  Decline
                </button>
                <Link
                  href={`/lender/applicant?applicationId=${app.id}`}
                  className="px-3 py-1.5 rounded-lg bg-[#C4A55A] text-white text-xs font-semibold hover:bg-[#b3944a] transition-colors"
                >
                  View
                </Link>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      )}

      {/* Make Offer = build a real offer for this borrower */}
      {offerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#1B2B3A] dark:text-white">
              Make an Offer
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              For {offerModal.borrower?.full_name ?? "this borrower"}
            </p>

            <div className="mt-5 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium text-[#1B2B3A] dark:text-white">
                  {formatCurrency(offerModal.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium text-[#1B2B3A] dark:text-white">
                  {formatDuration(offerModal.duration, offerModal.duration_days)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Your Rate (%/month)</span>
                <input
                  type="number"
                  min={0.1}
                  max={25}
                  step={0.1}
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-24 text-right border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white text-[#1B2B3A] outline-none focus:ring-2 focus:ring-[#C4A55A]"
                />
              </div>
              {rateInvalid && (
                <p className="text-xs text-red-500 text-right">Rate must be between 0.1% and 25%</p>
              )}
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-[#1B2B3A] dark:text-white mb-2">
                Documents required to accept (optional)
              </p>
              <div className="flex flex-wrap gap-2">
                {DOCUMENT_LABEL_OPTIONS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleDoc(label)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      requiredDocs.includes(label)
                        ? "bg-[#C4A55A] border-[#C4A55A] text-white"
                        : "bg-white border-gray-300 text-gray-600 hover:border-[#C4A55A]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-3">
              If the borrower accepts, funds are disbursed automatically to
              their mobile money.
            </p>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => { setOfferModal(null); setRequiredDocs([]); }}
                className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:border-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmOffer}
                disabled={makeOffer.isPending || rate === "" || rateInvalid}
                className="px-5 py-2 rounded-lg bg-[#C4A55A] text-white text-sm font-semibold hover:bg-[#b3944a] disabled:opacity-50"
              >
                {makeOffer.isPending ? "Sending…" : "Send Offer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </FadeSwap>
  );
}
