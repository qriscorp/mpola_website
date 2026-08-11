"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BorrowerPageHeader } from "@/components/top-nav";
import { InfoTip } from "@/components/info-tip";
import { ConfirmModal } from "@/components/confirm-modal";
import { useApplications } from "@/hooks/use-dashboard";
import { useSearchGuarantorCandidate, useReplaceGuarantor, useRemindGuarantor } from "@/hooks/use-guarantors";
import {
  useUpdateApplication,
  useDeleteApplication,
  useFreezeApplication,
  useUnfreezeApplication,
} from "@/hooks/use-application";
import { formatCurrency, formatRate, formatDuration, getApplicationStatusColor, getApplicationStatusLabel } from "@/lib/format";
import { TableSkeleton } from "@/components/skeletons";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";
import type { Guarantor, LoanApplication } from "@/lib/types";
import { toast } from "sonner";

const tabs = ["All", "Pending", "Funded", "Closed"] as const;
type Tab = (typeof tabs)[number];

const EDIT_DURATIONS = Array.from({ length: 12 }, (_, i) => i + 1);
const EDIT_LOAN_TYPES = [
  { label: "Business", value: "business" },
  { label: "Personal", value: "personal" },
  { label: "Agricultural", value: "agricultural" },
  { label: "Emergency", value: "emergency" },
];

function expiryNote(validUntil: string | null, status: string): string | null {
  if (!validUntil || status === "expired" || status === "funded" || status === "completed") return null;
  const diffMs = new Date(validUntil).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 1) return "Expires today";
  return `Expires in ${days} days`;
}

const guarantorBadge: Record<Guarantor["status"], string> = {
  pending: "bg-amber-50 text-amber-600",
  accepted: "bg-emerald-50 text-emerald-600",
  declined: "bg-red-50 text-red-600",
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-[#1B2B3A] dark:text-white">{value}</span>
    </div>
  );
}

function RequestDetailPanel({ app }: { app: LoanApplication }) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
      <DetailRow label="Reference" value={app.reference_number} />
      <DetailRow label="Amount" value={formatCurrency(app.amount)} />
      <DetailRow label="Duration" value={formatDuration(app.duration, app.duration_days)} />
      <DetailRow
        label="Loan Type"
        value={app.loan_type.charAt(0).toUpperCase() + app.loan_type.slice(1)}
      />
      {app.purpose && <DetailRow label="Purpose" value={app.purpose} />}
      {app.max_interest_rate != null && (
        <DetailRow label="Your Rate Cap" value={formatRate(app.max_interest_rate)} />
      )}
      {app.interest_rate != null ? (
        <>
          <DetailRow label="Accepted Interest Rate" value={formatRate(app.interest_rate)} />
          {app.monthly_payment != null && (
            <DetailRow
              label={app.duration_days != null ? "Repayment Due" : "Monthly Payment"}
              value={formatCurrency(app.monthly_payment)}
            />
          )}
          {app.total_repayable != null && (
            <DetailRow label="Total Repayable" value={formatCurrency(app.total_repayable)} />
          )}
        </>
      ) : (
        <DetailRow
          label="Offers"
          value={`${app.offers_count} received${app.pending_offers_count ? ` (${app.pending_offers_count} pending)` : ""}`}
        />
      )}
      <DetailRow
        label="Submitted"
        value={new Date(app.created_at).toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" })}
      />
    </div>
  );
}

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
  const remind = useRemindGuarantor();

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
              {g.status === "pending" && (
                <button
                  onClick={() => remind.mutate(g.id)}
                  disabled={remind.isPending}
                  className="text-xs font-semibold text-[#2BB5A0] hover:underline disabled:opacity-50"
                >
                  Remind
                </button>
              )}
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

const EMERGENCY_DAY_PRESETS = [1, 3, 7, 14];

function EditApplicationForm({ app, onDone }: { app: LoanApplication; onDone: () => void }) {
  const [amount, setAmount] = useState(String(app.amount));
  const [duration, setDuration] = useState(app.duration ?? 3);
  const [durationDays, setDurationDays] = useState<number | null>(app.duration_days);
  const [customDays, setCustomDays] = useState(
    app.duration_days != null && !EMERGENCY_DAY_PRESETS.includes(app.duration_days)
      ? String(app.duration_days)
      : "",
  );
  const [loanType, setLoanType] = useState(app.loan_type);
  const [purpose, setPurpose] = useState(app.purpose ?? "");
  const [maxInterestRate, setMaxInterestRate] = useState(
    app.max_interest_rate != null ? String(app.max_interest_rate) : "",
  );
  const [validUntil, setValidUntil] = useState(app.valid_until ? app.valid_until.slice(0, 10) : "");
  const update = useUpdateApplication();

  const isEmergency = loanType === "emergency";
  const numAmount = Number(amount);
  const amountInvalid = !amount.trim() || Number.isNaN(numAmount) || numAmount < 1000 || numAmount > 50000000;
  const rateInvalid =
    maxInterestRate.trim() !== "" &&
    (Number.isNaN(Number(maxInterestRate)) || Number(maxInterestRate) < 0.1 || Number(maxInterestRate) > 25);

  const handleSave = () => {
    if (amountInvalid || rateInvalid) return;
    update.mutate(
      {
        id: app.id,
        data: {
          amount: Number(amount),
          // Explicit "" / null rather than `undefined` — this is an edit,
          // not a create, so a cleared field must actually reach the
          // backend as a clear. `undefined` gets dropped by
          // JSON.stringify, which `exclude_unset` on the backend then
          // reads as "leave it alone", silently keeping the old value.
          // Exactly one of duration/duration_days is ever set — switching
          // loan type between "Emergency" and anything else must clear
          // the other one explicitly, not leave it stale.
          duration: isEmergency ? null : duration,
          duration_days: isEmergency ? durationDays : null,
          loan_type: loanType,
          purpose,
          max_interest_rate: maxInterestRate ? Number(maxInterestRate) : null,
          valid_until: validUntil || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Request updated");
          onDone();
        },
      },
    );
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Amount (UGX)
          </label>
          <input
            type="number"
            min={1000}
            max={50000000}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2BB5A0]"
          />
          {amountInvalid && (
            <p className="mt-1 text-xs text-red-500">Between UGX 1,000 and UGX 50,000,000</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Loan Type
          </label>
          <select
            value={loanType}
            onChange={(e) => {
              const v = e.target.value as LoanApplication["loan_type"];
              setLoanType(v);
              if (v === "emergency") {
                setDurationDays((d) => d ?? EMERGENCY_DAY_PRESETS[0]);
              } else {
                setDurationDays(null);
              }
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2BB5A0]"
          >
            {EDIT_LOAN_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Duration
          </label>
          {isEmergency ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {EMERGENCY_DAY_PRESETS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDurationDays(d);
                      setCustomDays("");
                    }}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      durationDays === d
                        ? "border-[#2BB5A0] bg-[#E6F4F2] text-[#149D8E]"
                        : "border-gray-300 bg-white text-[#1B2B3A] hover:border-[#2BB5A0]"
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1}
                max={29}
                value={customDays}
                onChange={(e) => {
                  const v = e.target.value;
                  setCustomDays(v);
                  const n = parseInt(v, 10);
                  if (!Number.isNaN(n) && n >= 1 && n <= 29) setDurationDays(n);
                }}
                placeholder="Custom days (1-29)"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2BB5A0]"
              />
            </div>
          ) : (
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2BB5A0]"
            >
              {EDIT_DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d} months
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Max Interest Rate (%/month)
          </label>
          <input
            type="number"
            min={0.1}
            max={25}
            step="0.1"
            value={maxInterestRate}
            onChange={(e) => setMaxInterestRate(e.target.value)}
            placeholder="Any rate"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2BB5A0]"
          />
          {rateInvalid && (
            <p className="mt-1 text-xs text-red-500">Between 0.1% and 25%, or leave blank</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Purpose
          </label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2BB5A0]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
            Valid Until
          </label>
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2BB5A0]"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onDone}
          className="px-4 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:border-gray-400 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={update.isPending || amountInvalid || rateInvalid}
          className="px-4 py-1.5 rounded-lg bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors disabled:opacity-50"
        >
          {update.isPending ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function ApplicationActions({ app }: { app: LoanApplication }) {
  const [editing, setEditing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"withdraw" | "freeze" | null>(null);
  const deleteApplication = useDeleteApplication();
  const freeze = useFreezeApplication();
  const unfreeze = useUnfreezeApplication();

  // A guarantor's acceptance covers the exact terms they saw — once one has
  // committed, the borrower can still pause or withdraw the request, but
  // editing amount/duration/type/etc. is locked (matches the backend guard
  // in PUT /loans/applications/{id}).
  const editLocked = (app.guarantors ?? []).some((g) => g.status === "accepted");

  const handleWithdraw = () => {
    deleteApplication.mutate(app.id, {
      onSuccess: () => {
        toast.success("Request withdrawn");
        setConfirmAction(null);
      },
    });
  };

  const handleFreeze = () => {
    freeze.mutate(app.id, {
      onSuccess: () => {
        toast.success("Request frozen — hidden from new lender matches");
        setConfirmAction(null);
      },
    });
  };

  const handleUnfreeze = () => {
    unfreeze.mutate(app.id, { onSuccess: () => toast.success("Request unfrozen") });
  };

  if (editing) {
    return <EditApplicationForm app={app} onDone={() => setEditing(false)} />;
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-3">
      {!editLocked && (
        <button
          onClick={() => setEditing(true)}
          className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors"
        >
          Edit
        </button>
      )}
      {app.is_frozen ? (
        <button
          onClick={handleUnfreeze}
          disabled={unfreeze.isPending || app.frozen_by === "admin"}
          className="px-3 py-1.5 rounded-lg bg-[#2BB5A0] text-white text-xs font-semibold hover:bg-[#239E8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Unfreeze
        </button>
      ) : (
        <button
          onClick={() => setConfirmAction("freeze")}
          disabled={freeze.isPending}
          className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors disabled:opacity-50"
        >
          Freeze
        </button>
      )}
      <button
        onClick={() => setConfirmAction("withdraw")}
        disabled={deleteApplication.isPending}
        className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50"
      >
        Withdraw
      </button>
      {app.is_frozen && (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-blue-50 text-blue-600 border-blue-200">
          Frozen ({app.frozen_by === "admin" ? "by admin" : "by you"})
        </span>
      )}
      {app.is_frozen && app.frozen_by === "admin" && (
        <p className="text-xs text-gray-400">Frozen by an admin — only they can unfreeze it.</p>
      )}
      {editLocked && (
        <p className="text-xs text-gray-400">
          A guarantor has already approved — editing is locked, but you can still freeze or withdraw.
        </p>
      )}

      <ConfirmModal
        open={confirmAction === "withdraw"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="Withdraw this loan request?"
        description="This can't be undone — you'll need to submit a new request from scratch if you change your mind."
        confirmLabel="Yes, Withdraw"
        onConfirm={handleWithdraw}
        loading={deleteApplication.isPending}
        destructive
      />
      <ConfirmModal
        open={confirmAction === "freeze"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="Freeze this loan request?"
        description="Lenders won't be able to match or send new offers on it until you unfreeze it. You can unfreeze any time."
        confirmLabel="Yes, Freeze"
        onConfirm={handleFreeze}
        loading={freeze.isPending}
      />
    </div>
  );
}

function DiscardDraftLink({ applicationId }: { applicationId: string }) {
  const deleteApplication = useDeleteApplication();
  const handleDiscard = () => {
    if (!confirm("Discard this unfinished request? This can't be undone.")) return;
    deleteApplication.mutate(applicationId, {
      onSuccess: () => toast.success("Draft discarded"),
    });
  };
  return (
    <button
      onClick={handleDiscard}
      disabled={deleteApplication.isPending}
      className="mt-3 text-xs font-medium text-gray-400 hover:text-red-500 disabled:opacity-50"
    >
      Discard draft
    </button>
  );
}

export default function MyRequestsPage() {
  const { data: applications, isLoading } = useApplications();
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!applications) return [];
    if (activeTab === "All") return applications;
    if (activeTab === "Pending")
      return applications.filter((a) => a.status === "pending" || a.status === "awaiting_guarantors");
    if (activeTab === "Funded")
      return applications.filter((a) => a.status === "funded");
    return applications.filter((a) =>
      ["completed", "rejected", "defaulted", "expired"].includes(a.status),
    );
  }, [applications, activeTab]);

  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="My Requests" />
      <p className="-mt-4 flex items-center gap-1.5 text-sm text-gray-500">
        Awaiting Guarantors → Pending → Funded
        <InfoTip text="Awaiting Guarantors: waiting on your 2 chosen guarantors to approve. Pending: both approved, visible to lenders on the marketplace. Funded: you accepted an offer. You can freeze or withdraw a request any time before it's funded — editing is only possible until a guarantor actually approves, since their approval covers the exact terms they saw." />
      </p>

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
          {filtered.map((app) => {
            // The apply wizard now creates the real application at step 1
            // and only attaches guarantors at the very end — so a request
            // that's "awaiting_guarantors" with literally none attached
            // yet isn't waiting on anyone, it's just an unfinished wizard
            // session. Shown distinctly so it doesn't look like a broken
            // submitted request with no guarantors listed.
            const isDraft = app.status === "awaiting_guarantors" && (!app.guarantors || app.guarantors.length === 0);

            if (isDraft) {
              return (
                <StaggerItem
                  key={app.id}
                  className="bg-white rounded-2xl border border-dashed border-gray-300 p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-2xl sm:text-3xl leading-none font-black text-[#1B2B3A]">
                          {formatCurrency(app.amount)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                          Draft
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 capitalize">
                        {app.loan_type} · {formatDuration(app.duration, app.duration_days)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Not yet submitted.</p>
                    </div>
                    <Link
                      href="/dashboard/apply"
                      className="px-5 py-2 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors whitespace-nowrap shrink-0"
                    >
                      Continue Application
                    </Link>
                  </div>
                  <DiscardDraftLink applicationId={app.id} />
                </StaggerItem>
              );
            }

            return (
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
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getApplicationStatusColor(app.status, app.loan_status)}`}
                      >
                        {getApplicationStatusLabel(app.status, app.loan_status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 capitalize">
                      {app.loan_type} · {formatDuration(app.duration, app.duration_days)} · #{app.id}
                      {expiryNote(app.valid_until, app.status) && (
                        <> · <span className="text-amber-600 font-medium">{expiryNote(app.valid_until, app.status)}</span></>
                      )}
                    </p>
                    {app.status === "awaiting_guarantors" && (
                      <p className="text-xs text-amber-600 mt-1">
                        Waiting on your guarantors to approve before lenders can see this request.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {app.status === "pending" && (
                      <Link
                        href={`/dashboard/offers-received?applicationId=${app.id}`}
                        className="px-5 py-2 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors whitespace-nowrap"
                      >
                        View Offers
                      </Link>
                    )}
                    {app.status === "funded" && app.loan_status && app.loan_status !== "pending_disbursement" && (
                      <Link
                        href={`/dashboard/repayments/pay?loanId=${app.loan_id}`}
                        className="px-5 py-2 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors whitespace-nowrap"
                      >
                        Make Payment
                      </Link>
                    )}
                    <button
                      onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                      className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors whitespace-nowrap"
                    >
                      {expandedId === app.id ? "Hide Details" : "Details"}
                    </button>
                  </div>
                </div>

                {expandedId === app.id && <RequestDetailPanel app={app} />}

                {app.status === "awaiting_guarantors" && app.guarantors && app.guarantors.length > 0 && (
                  <GuarantorStatusList applicationId={app.id} guarantors={app.guarantors} />
                )}

                {(app.status === "awaiting_guarantors" || app.status === "pending") && (
                  <ApplicationActions app={app} />
                )}
              </StaggerItem>
            );
          })}
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
