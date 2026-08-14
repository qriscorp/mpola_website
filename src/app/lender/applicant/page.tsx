"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { LenderPageHeader } from "@/components/lender-top-nav";
import { CardSkeleton } from "@/components/skeletons";
import {
  useApplicationDetail,
  useSkipApplication,
} from "@/hooks/use-lender";
import { formatCurrency, formatDuration, getInitials, getApplicationStatusLabel, getApplicationStatusColor } from "@/lib/format";
import { InfoTip } from "@/components/info-tip";

const guarantorColors = ["bg-emerald-600", "bg-amber-700", "bg-blue-700"];

function guarantorBadge(status: string) {
  if (status === "accepted")
    return "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:border-emerald-800 dark:text-emerald-400 dark:bg-emerald-900/20";
  if (status === "declined")
    return "bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20";
  return "bg-amber-50 text-amber-600 border border-amber-200 dark:border-amber-800 dark:text-amber-400 dark:bg-amber-900/20";
}

function guarantorLabel(status: string) {
  if (status === "accepted") return "Confirmed";
  if (status === "declined") return "Declined";
  return "Pending";
}

function ApplicantContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId") ?? "";

  const { data: application, isLoading, error } = useApplicationDetail(applicationId);
  const skipApplication = useSkipApplication();

  if (!applicationId || error) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {error
          ? "This application couldn't be found. "
          : ""}
        Pick an application from{" "}
        <a href="/lender/applications" className="text-[#C4A55A] underline">
          Applications
        </a>{" "}
        to review it here.
      </p>
    );
  }

  if (isLoading || !application) {
    return <CardSkeleton count={2} />;
  }

  const borrower = application.borrower;
  const guarantors = application.guarantors ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: 2/3 wide */}
      <div className="lg:col-span-2 space-y-4">
        {/* Profile card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start gap-5">
            <div className="h-16 w-16 rounded-full bg-[#1B2B3A] flex items-center justify-center shrink-0">
              <span className="text-white text-xl font-bold">
                {getInitials(borrower?.full_name ?? "?")}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
                    {borrower?.full_name ?? "Unknown borrower"}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5 capitalize dark:text-gray-500">
                    {application.loan_type} Loan · #{application.reference_number}
                  </p>
                </div>
                {application.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() =>
                        router.push(`/lender/marketplace/${application.id}`)
                      }
                      className="px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        skipApplication.mutate(application.id, {
                          onSuccess: () => {
                            toast.success(
                              "Hidden from your marketplace — still visible to other lenders.",
                            );
                            router.push("/lender/applications");
                          },
                        })
                      }
                      disabled={skipApplication.isPending}
                      className="px-4 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border border-current/20 ${getApplicationStatusColor(application.status, application.loan_status)}`}
                >
                  {application.status === "pending"
                    ? "Pending Review"
                    : getApplicationStatusLabel(application.status, application.loan_status)}
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#1B2B3A] text-[#C4A55A]">
                  Score {borrower?.credit_score ?? "—"}/100
                  <InfoTip
                    className="text-[#C4A55A]/80 hover:text-white"
                    text="A new borrower starts at a neutral 50 — no resolved loan history yet, not a red flag by itself. It only moves once a loan is fully resolved: rising toward 100 for full, on-time repayment, dropping toward 0 for a default or overdue history. With few resolved loans the swings are sharp, so weigh it alongside KYC status and guarantors, especially for a borrower with only one or two loans behind them."
                  />
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-5 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            {[
              { label: "AMOUNT", value: formatCurrency(application.amount), big: true },
              { label: "DURATION", value: formatDuration(application.duration, application.duration_days), big: true },
              { label: "PURPOSE", value: application.purpose ?? "—", big: false },
              {
                label: "KYC STATUS",
                value: borrower?.kyc_status === "verified" ? "Verified" : "Not Verified",
                big: false,
              },
            ].map(({ label, value, big }) => (
              <div key={label}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider dark:text-gray-500">
                  {label}
                </p>
                <p
                  className={`font-bold text-[#1B2B3A] mt-0.5 capitalize ${big ? "text-2xl" : "text-base"}`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT: 1/3 */}
      <div className="space-y-4">
        {/* Guarantors */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="font-bold text-[#1B2B3A] text-lg mb-4 dark:text-white">
            Guarantors
          </h3>
          {guarantors.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No guarantors added for this application yet.
            </p>
          ) : (
            <div className="space-y-4">
              {guarantors.map((g, i) => (
                <div key={g.id} className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-full ${guarantorColors[i % guarantorColors.length]} flex items-center justify-center shrink-0`}
                  >
                    <span className="text-white text-xs font-bold">
                      {getInitials(g.full_name ?? g.username ?? "?")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                      {g.full_name ?? g.username}
                    </p>
                    <p className="text-xs text-gray-400 capitalize dark:text-gray-500">
                      {g.relationship_type ?? "—"}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${guarantorBadge(g.status)}`}
                  >
                    {guarantorLabel(g.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loan History */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="font-bold text-[#1B2B3A] text-lg mb-3 dark:text-white">
            Loan History
          </h3>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Borrower loan history isn&apos;t available yet.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ApplicantProfilePage() {
  return (
    <div className="space-y-6">
      <LenderPageHeader title="Applicant Profile" />
      <Suspense fallback={<CardSkeleton count={2} />}>
        <ApplicantContent />
      </Suspense>
    </div>
  );
}
