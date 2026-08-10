"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BorrowerPageHeader } from "@/components/top-nav";
import { useApplications } from "@/hooks/use-dashboard";
import { useSearchGuarantorCandidate, useReplaceGuarantor } from "@/hooks/use-guarantors";
import { formatCurrency, getStatusColor, getStatusLabel } from "@/lib/format";
import { TableSkeleton } from "@/components/skeletons";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";
import type { Guarantor } from "@/lib/types";
import { toast } from "sonner";

const tabs = ["All", "Pending", "Funded", "Closed"] as const;
type Tab = (typeof tabs)[number];

const guarantorBadge: Record<Guarantor["status"], string> = {
  pending: "bg-amber-50 text-amber-600",
  accepted: "bg-emerald-50 text-emerald-600",
  declined: "bg-red-50 text-red-600",
};

function ReplaceGuarantorForm({
  applicationId,
  guarantorId,
  onDone,
}: {
  applicationId: string;
  guarantorId: string;
  onDone: () => void;
}) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const search = useSearchGuarantorCandidate();
  const replace = useReplaceGuarantor();

  const handleReplace = () => {
    setError(null);
    if (!email.trim() || !phone.trim()) return;
    search.mutate(
      { email: email.trim(), phoneNumber: `+256${phone}` },
      {
        onSuccess: (candidate) => {
          replace.mutate(
            { applicationId, guarantorId, newGuarantorUserId: candidate.id },
            {
              onSuccess: () => {
                toast.success("Guarantor replaced — waiting for them to respond");
                onDone();
              },
              onError: (err: Error) => setError(err.message || "Failed to replace guarantor"),
            },
          );
        },
        onError: (err: Error) => setError(err.message || "No account found matching that email and phone"),
      },
    );
  };

  const isPending = search.isPending || replace.isPending;

  return (
    <div className="mt-2 rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="New guarantor's email"
          className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-[#2BB5A0]"
        />
        <div className="flex items-center overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700">
          <span className="bg-[#E6F4F2] px-3 py-2 text-xs font-bold text-[#149D8E]">+256</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="700 000 000"
            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-900 outline-none"
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={onDone}
          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleReplace}
          disabled={isPending || !email.trim() || !phone.trim()}
          className="px-3 py-1.5 rounded-lg bg-[#2BB5A0] text-white text-xs font-semibold hover:bg-[#239E8C] disabled:opacity-50"
        >
          {isPending ? "Searching…" : "Replace"}
        </button>
      </div>
    </div>
  );
}

function GuarantorStatusList({ applicationId, guarantors }: { applicationId: string; guarantors: Guarantor[] }) {
  const [replacingId, setReplacingId] = useState<string | null>(null);

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
      {guarantors.map((g) => (
        <div key={g.id}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-[#1B2B3A] dark:text-white">
              {g.full_name ?? g.username}
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${guarantorBadge[g.status]}`}>
                {g.status}
              </span>
              {g.status === "declined" && replacingId !== g.id && (
                <button
                  onClick={() => setReplacingId(g.id)}
                  className="text-xs font-semibold text-[#2BB5A0] hover:underline"
                >
                  Replace
                </button>
              )}
            </div>
          </div>
          {replacingId === g.id && (
            <ReplaceGuarantorForm
              applicationId={applicationId}
              guarantorId={g.id}
              onDone={() => setReplacingId(null)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function MyRequestsPage() {
  const { data: applications, isLoading } = useApplications();
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const filtered = useMemo(() => {
    if (!applications) return [];
    if (activeTab === "All") return applications;
    if (activeTab === "Pending")
      return applications.filter((a) => a.status === "pending" || a.status === "awaiting_guarantors");
    if (activeTab === "Funded")
      return applications.filter((a) => a.status === "funded");
    return applications.filter((a) =>
      ["completed", "rejected", "defaulted"].includes(a.status),
    );
  }, [applications, activeTab]);

  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="My Requests" />

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeTab === tab
                ? "bg-[#2BB5A0] text-white border-[#2BB5A0]"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-[#2BB5A0] hover:text-[#2BB5A0]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton rows={3} />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          No loan requests here yet.
        </div>
      ) : (
        <StaggerList className="space-y-4">
          {filtered.map((app) => (
            <StaggerItem
              key={app.id}
              className="bg-white rounded-2xl border border-gray-200 p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl sm:text-3xl leading-none font-black text-[#1B2B3A]">
                      {formatCurrency(app.amount)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}
                    >
                      {getStatusLabel(app.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 capitalize">
                    {app.loan_type} · {app.duration} months · #{app.id}
                  </p>
                  {app.status === "awaiting_guarantors" && (
                    <p className="text-xs text-amber-600 mt-1">
                      Waiting on your guarantors to approve before lenders can see this request.
                    </p>
                  )}
                </div>
                {app.status === "pending" && (
                  <Link
                    href={`/dashboard/offers-received?applicationId=${app.id}`}
                    className="px-5 py-2 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors whitespace-nowrap shrink-0"
                  >
                    View Offers
                  </Link>
                )}
              </div>

              {app.status === "awaiting_guarantors" && app.guarantors && app.guarantors.length > 0 && (
                <GuarantorStatusList applicationId={app.id} guarantors={app.guarantors} />
              )}
            </StaggerItem>
          ))}
        </StaggerList>
      )}

      <div>
        <Link
          href="/dashboard/apply"
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors"
        >
          + New Loan Request
        </Link>
      </div>
    </div>
  );
}
