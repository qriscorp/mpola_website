"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BorrowerPageHeader } from "@/components/top-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InfoTip } from "@/components/info-tip";
import {
  useDraftApplication,
  useSubmitApplication,
  useUpdateApplication,
  useDeleteApplication,
} from "@/hooks/use-application";
import { useSearchGuarantorCandidate, useAttachGuarantors } from "@/hooks/use-guarantors";
import { formatCurrency, formatDuration } from "@/lib/format";

const STEPS = ["Loan Details", "Guarantors", "Review"];
// Backend enforces duration >= 1 month (repository/models.py's
// LoanApplicationCreate) — every installment is a flat 30-day cycle
// (routers/loans.py advances next_payment_date by timedelta(days=30) per
// instalment, not a real calendar month), so sub-month terms (days/weeks)
// aren't representable without a dedicated bullet-repayment path; 1 month
// is the real floor for now.
const DURATIONS = Array.from({ length: 12 }, (_, i) => `${i + 1} mo`);
const LOAN_TYPES = [
  { label: "Business", value: "business" },
  { label: "Personal", value: "personal" },
  { label: "Agricultural", value: "agricultural" },
  { label: "Emergency", value: "emergency" },
];

interface GuarantorInput {
  user_id: string;
  full_name: string | null;
  username: string;
}

function StepperHeader({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8 flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  isCompleted || isActive
                    ? "bg-[#2BB5A0] text-white"
                    : "border-2 border-gray-300 bg-white text-gray-400"
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
              </div>
              <span
                className={`mt-1 whitespace-nowrap text-xs font-medium ${
                  isCompleted || isActive ? "text-[#2BB5A0]" : "text-gray-400"
                }`}
              >
                {step}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div
                className={`mx-2 mb-5 h-px w-16 transition-colors sm:w-24 ${
                  isCompleted ? "bg-[#2BB5A0]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function LoanCalculator({
  amount,
  duration,
  durationDays,
  maxInterestRate,
}: {
  amount: number;
  duration: number;
  durationDays: number | null;
  maxInterestRate: string;
}) {
  const hasCap = maxInterestRate.trim() !== "";
  // Zero, not the platform-average placeholder — until the borrower actually
  // types a rate cap, there's nothing real to estimate against, and showing
  // a fabricated number here reads as "the app already decided my rate."
  const displayRate = hasCap ? Number(maxInterestRate) : 0;
  const isEmergency = durationDays != null;
  const totalInterest = isEmergency
    ? amount * (displayRate / 100) * (durationDays / 30)
    : amount * (displayRate / 100) * duration;
  const totalRepayable = amount + totalInterest;
  const monthly = isEmergency ? totalRepayable : duration > 0 ? totalRepayable / duration : 0;

  return (
    <Card className="border border-[#9DDAD1] bg-[#E6F4F2]">
      <CardContent className="space-y-4 p-6">
        <h3 className="text-lg font-bold text-[#149D8E]">Loan Calculator</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Principal</span>
            <span className="font-semibold text-[#1B2B3A]">
              {formatCurrency(amount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">
              {hasCap ? "Your Rate Cap" : "Interest Rate (not set)"}
            </span>
            <span className="font-semibold text-[#1B2B3A]">
              {displayRate}%/month
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Duration</span>
            <span className="font-semibold text-[#1B2B3A]">
              {formatDuration(duration, durationDays)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Interest</span>
            <span className="font-semibold text-[#149D8E]">
              {formatCurrency(Math.round(totalInterest))}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-[#1B2B3A]">
              {isEmergency ? "Repayment Due" : "Monthly Payment"}
            </span>
            <span className="font-bold text-[#1B2B3A]">
              {formatCurrency(Math.round(monthly))}
            </span>
          </div>
          <div className="h-px bg-[#9DDAD1]" />
          <div className="flex justify-between">
            <span className="text-2xl font-black text-[#1B2B3A]">
              Total Repayable
            </span>
            <span className="text-3xl font-black text-[#149D8E]">
              {formatCurrency(Math.round(totalRepayable))}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          {hasCap
            ? isEmergency
              ? "One repayment, due in full — this is only an estimate at your rate cap. Nothing is submitted from this calculator."
              : "This is only an estimate at your rate cap. Nothing is submitted from this calculator."
            : "You left the rate blank — your request will match any lender's offer, at whatever rate they set. Nothing is submitted from this calculator; the totals above are 0 until you enter a cap or an amount."}
        </p>
      </CardContent>
    </Card>
  );
}

const MIN_AMOUNT = 1000;
const MAX_AMOUNT = 50000000;

const EMERGENCY_DAY_PRESETS = [1, 3, 7, 14];

function Step1({
  amount,
  setAmount,
  amountError,
  duration,
  setDuration,
  durationDays,
  setDurationDays,
  loanType,
  setLoanType,
  purpose,
  setPurpose,
  maxInterestRate,
  setMaxInterestRate,
  maxInterestRateError,
  validUntil,
  setValidUntil,
}: {
  amount: string;
  setAmount: (v: string) => void;
  amountError: string | null;
  duration: number;
  setDuration: (v: number) => void;
  durationDays: number | null;
  setDurationDays: (v: number | null) => void;
  loanType: string;
  setLoanType: (v: string) => void;
  purpose: string;
  setPurpose: (v: string) => void;
  maxInterestRate: string;
  setMaxInterestRate: (v: string) => void;
  maxInterestRateError: string | null;
  validUntil: string;
  setValidUntil: (v: string) => void;
}) {
  const isEmergency = loanType === "emergency";
  const [customDays, setCustomDays] = useState(
    durationDays != null && !EMERGENCY_DAY_PRESETS.includes(durationDays) ? String(durationDays) : "",
  );
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
      <Card className="border border-gray-200 bg-white">
        <CardContent className="space-y-6 p-6">
          <h2 className="flex items-center gap-2 text-2xl font-black text-[#1B2B3A]">
            Loan Details
            <InfoTip text="Here's the flow: you submit this request, your 2 guarantors approve it, then lenders on the marketplace can send you offers. Each offer lists the documents that lender needs — you provide those when you're ready to accept. Nothing is funded until then." />
          </h2>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              How much do you need?
            </label>
            <div
              className={`flex items-center overflow-hidden rounded-lg border focus-within:ring-2 ${
                amountError
                  ? "border-red-300 focus-within:ring-red-300"
                  : "border-gray-300 focus-within:ring-[#2BB5A0]"
              }`}
            >
              <span className="border-r border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-500">
                UGX
              </span>
              <input
                type="number"
                min={MIN_AMOUNT}
                max={MAX_AMOUNT}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`e.g. ${MIN_AMOUNT.toLocaleString()}`}
                className="flex-1 px-4 py-3 text-sm font-medium text-[#1B2B3A] outline-none"
              />
            </div>
            {amountError ? (
              <p className="mt-1.5 text-xs text-red-500">{amountError}</p>
            ) : (
              <p className="mt-1.5 text-xs text-gray-400">
                Between {formatCurrency(MIN_AMOUNT)} and {formatCurrency(MAX_AMOUNT)}.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Loan Type
            </label>
            <div className="flex flex-wrap gap-2">
              {LOAN_TYPES.map((t) => {
                const active = t.value === loanType;
                return (
                  <button
                    key={t.value}
                    onClick={() => {
                      setLoanType(t.value);
                      // Emergency = short-term, single bullet repayment;
                      // anything else = the standard monthly-instalment
                      // path. Switching resets duration to that mode's
                      // default rather than leaving a stale value from
                      // the other mode.
                      if (t.value === "emergency") {
                        setDurationDays(durationDays ?? EMERGENCY_DAY_PRESETS[0]);
                      } else {
                        setDurationDays(null);
                        setDuration(duration || 3);
                      }
                    }}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "border-[#2BB5A0] bg-[#E6F4F2] text-[#149D8E]"
                        : "border-gray-300 bg-white text-[#1B2B3A] hover:border-[#2BB5A0]"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            {isEmergency && (
              <p className="mt-1.5 text-xs text-gray-400">
                Short-term request — one repayment in full, due when the term ends. Interest is
                prorated from the platform&apos;s monthly rate.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Duration
            </label>
            {isEmergency ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {EMERGENCY_DAY_PRESETS.map((d) => {
                    const active = d === durationDays;
                    return (
                      <button
                        key={d}
                        onClick={() => {
                          setDurationDays(d);
                          setCustomDays("");
                        }}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                          active
                            ? "border-[#2BB5A0] bg-[#E6F4F2] text-[#149D8E]"
                            : "border-gray-300 bg-white text-[#1B2B3A] hover:border-[#2BB5A0]"
                        }`}
                      >
                        {d} day{d === 1 ? "" : "s"}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={29}
                    value={customDays}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCustomDays(v);
                      if (v === "") {
                        setDurationDays(null);
                        return;
                      }
                      const n = parseInt(v, 10);
                      setDurationDays(!Number.isNaN(n) && n >= 1 && n <= 29 ? n : null);
                    }}
                    placeholder="Custom (1-29 days)"
                    className="w-44 rounded-lg border border-gray-300 px-3 py-2 text-sm text-[#1B2B3A] outline-none focus:ring-2 focus:ring-[#2BB5A0]"
                  />
                  <span className="text-xs text-gray-400">days</span>
                </div>
                {customDays !== "" && durationDays == null && (
                  <p className="text-xs text-red-500">Enter a whole number between 1 and 29</p>
                )}
                <p className="text-xs text-gray-400">
                  30 days or more? Switch the loan type above — that&apos;s a standard request.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map((d) => {
                  const months = parseInt(d, 10);
                  const active = months === duration;
                  return (
                    <button
                      key={d}
                      onClick={() => setDuration(months)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "border-[#2BB5A0] bg-[#E6F4F2] text-[#149D8E]"
                          : "border-gray-300 bg-white text-[#1B2B3A] hover:border-[#2BB5A0]"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Purpose
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Briefly describe what you need the loan for..."
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-[#1B2B3A] outline-none focus:ring-2 focus:ring-[#2BB5A0]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Max Interest Rate (%/month, optional)
            </label>
            <input
              type="number"
              min={0.1}
              max={25}
              step="0.1"
              value={maxInterestRate}
              onChange={(e) => setMaxInterestRate(e.target.value)}
              placeholder="e.g. 3 — leave blank to accept any rate"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-[#1B2B3A] outline-none focus:ring-2 focus:ring-[#2BB5A0]"
            />
            {maxInterestRateError && (
              <p className="mt-1.5 text-xs text-red-500">{maxInterestRateError}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Valid Until (optional)
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-[#1B2B3A] outline-none focus:ring-2 focus:ring-[#2BB5A0]"
            />
            <p className="mt-1.5 text-xs text-gray-400">
              If you need funds urgently, set a date — your request stops being shown to lenders
              after this if it hasn&apos;t been funded. Leave blank for no deadline.
            </p>
          </div>
        </CardContent>
      </Card>

      <LoanCalculator
        amount={Number(amount) || 0}
        duration={duration}
        durationDays={durationDays}
        maxInterestRate={maxInterestRate}
      />
    </div>
  );
}

function Step2({
  guarantors,
  onAdd,
  onRemove,
}: {
  guarantors: GuarantorInput[];
  onAdd: (g: GuarantorInput) => void;
  onRemove: (idx: number) => void;
}) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const search = useSearchGuarantorCandidate();

  const handleAdd = () => {
    setError(null);
    if (!email.trim() || !phone.trim()) return;
    const phoneNumber = `+256${phone}`;
    if (guarantors.length >= 2) return;

    search.mutate(
      { email: email.trim(), phoneNumber },
      {
        onSuccess: (candidate) => {
          if (guarantors.some((g) => g.user_id === candidate.id)) {
            setError("Already added as a guarantor.");
            return;
          }
          onAdd({ user_id: candidate.id, full_name: candidate.full_name, username: candidate.username });
          setEmail("");
          setPhone("");
        },
        onError: (err: Error) => setError(err.message || "No account found matching that email and phone"),
      },
    );
  };

  return (
    <Card className="border border-gray-200 bg-white">
      <CardContent className="space-y-6 p-6">
        <h2 className="flex items-center gap-2 text-2xl font-black text-[#1B2B3A]">
          Add Guarantors
          <InfoTip text="If one declines, you can search for a replacement from My Requests after submitting. You can still edit the amount, duration, or type later — but only until a guarantor actually approves; once someone has committed to these exact terms, editing locks and you'd need to withdraw and resubmit instead." />
        </h2>
        <p className="text-sm text-gray-500">
          Add exactly 2 guarantors — they must already have a Mpola account.
          They&apos;ll each get a request to approve or decline once you
          submit, and your application won&apos;t be shown to lenders until
          both accept.
        </p>

        {guarantors.map((g, idx) => (
          <div
            key={g.user_id}
            className="flex items-center justify-between rounded-xl border-2 border-[#2BB5A0] bg-[#E6F4F2] p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#149D8E] text-sm font-bold text-white">
                {(g.full_name ?? g.username)
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <p className="text-lg font-bold text-[#1B2B3A]">{g.full_name ?? g.username}</p>
                <p className="text-sm text-gray-500">@{g.username}</p>
              </div>
            </div>
            <button
              onClick={() => onRemove(idx)}
              className="text-sm font-semibold text-red-500 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        ))}

        {guarantors.length < 2 && (
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Guarantor&apos;s Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="their.email@example.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-[#1B2B3A] outline-none focus:ring-2 focus:ring-[#2BB5A0]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Guarantor&apos;s Phone (MTN/Airtel)
                </label>
                <div className="flex items-center overflow-hidden rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-[#2BB5A0]">
                  <span className="bg-[#E6F4F2] px-4 py-2.5 text-sm font-bold text-[#149D8E]">
                    +256
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="700 000 000"
                    className="flex-1 px-4 py-2.5 text-sm text-[#1B2B3A] outline-none"
                  />
                </div>
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <Button
              onClick={handleAdd}
              disabled={search.isPending || !email.trim() || !phone.trim()}
              className="mt-4 bg-[#2BB5A0] text-white hover:bg-[#239E8C]"
            >
              {search.isPending ? "Searching…" : "Add Guarantor"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Step3({
  amount,
  duration,
  durationDays,
  loanType,
  guarantors,
  validUntil,
  maxInterestRate,
}: {
  amount: number;
  duration: number;
  durationDays: number | null;
  loanType: string;
  guarantors: GuarantorInput[];
  validUntil: string;
  maxInterestRate: string;
}) {
  const hasCap = maxInterestRate.trim() !== "";
  // Zero, not the platform-average placeholder — until the borrower actually
  // types a rate cap, there's nothing real to estimate against, and showing
  // a fabricated number here reads as "the app already decided my rate."
  const displayRate = hasCap ? Number(maxInterestRate) : 0;
  const isEmergency = durationDays != null;
  const totalInterest = isEmergency
    ? amount * (displayRate / 100) * (durationDays / 30)
    : amount * (displayRate / 100) * duration;
  const totalRepayable = amount + totalInterest;
  const loanTypeLabel =
    LOAN_TYPES.find((t) => t.value === loanType)?.label ?? loanType;

  return (
    <Card className="border border-gray-200 bg-white">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-2xl font-black text-[#1B2B3A]">
          Review &amp; Submit
        </h2>

        <div className="overflow-hidden rounded-xl border border-[#9DDAD1]">
          <div className="border-b border-[#9DDAD1] bg-[#E6F4F2] px-4 py-3">
            <p className="font-bold text-[#149D8E]">Loan Terms</p>
          </div>

          {[
            ["Amount", formatCurrency(amount)],
            ["Type", loanTypeLabel],
            ["Duration", formatDuration(duration, durationDays)],
            [
              hasCap ? "Your Rate Cap" : "Rate (uncapped)",
              `${displayRate}%/month`,
            ],
            ["Total Repayable", formatCurrency(Math.round(totalRepayable))],
            [
              "Valid Until",
              validUntil
                ? new Date(validUntil).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "No deadline",
            ],
            [
              "Guarantors",
              guarantors.length > 0
                ? guarantors.map((g) => g.full_name ?? g.username).join(", ")
                : "None added",
            ],
          ].map(([k, v]) => (
            <div
              key={String(k)}
              className="border-b last:border-b-0 border-gray-200 px-4 py-3 text-sm flex items-center justify-between"
            >
              <span className="text-gray-500">{k}</span>
              <span
                className={`font-bold ${k === "Rate" || k === "Total Repayable" ? "text-[#149D8E]" : "text-[#1B2B3A]"}`}
              >
                {v}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Once lenders send offers, each one will list the documents it needs — you provide those
          (or reuse ones already on file) when you accept a specific offer.
        </div>

        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          By submitting, you agree to Mpola&apos;s terms and confirm the
          information above is accurate.
        </div>
      </CardContent>
    </Card>
  );
}

function SuccessView({ reference }: { reference: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E6F4F2]">
        <Check className="h-10 w-10 text-[#2BB5A0]" />
      </div>
      <div>
        <h2 className="text-3xl font-black text-[#1B2B3A]">
          Application Submitted!
        </h2>
        <p className="mt-1 text-gray-500">
          Reference:{" "}
          <span className="font-semibold text-[#1B2B3A]">#{reference}</span>
        </p>
      </div>

      <div className="inline-flex items-center gap-2 rounded-lg border border-[#9DDAD1] bg-[#E6F4F2] px-6 py-3">
        <span className="h-2 w-2 rounded-full bg-[#2BB5A0]" />
        <span className="text-sm font-semibold text-[#149D8E]">
          Open on the marketplace
        </span>
      </div>

      <div className="mt-4 flex gap-3">
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md border border-[#1B2B3A] px-4 py-2 text-sm font-medium text-[#1B2B3A] transition-colors hover:bg-gray-50"
        >
          Back to Dashboard
        </a>
        <a
          href="/dashboard/my-requests"
          className="inline-flex items-center justify-center rounded-md bg-[#2BB5A0] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#239E8C]"
        >
          View My Applications
        </a>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [reference, setReference] = useState<string | null>(null);

  // Once step 1 completes, this is a REAL application id — every step after
  // that saves directly against it, so leaving and coming back resumes from
  // real, persisted data instead of a client-only draft that a refresh
  // would wipe out.
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [resumedFromDraft, setResumedFromDraft] = useState(false);
  // True until the resume check has actually finished running (not just
  // until the query resolves) — otherwise the wizard would paint a blank
  // Step 1 for one frame before the hydration effect fires and jumps to
  // the real step, since effects run after paint.
  const [resuming, setResuming] = useState(true);
  const hydratedRef = useRef(false);

  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState(3);
  const [durationDays, setDurationDays] = useState<number | null>(null);
  const [loanType, setLoanType] = useState("business");
  const [purpose, setPurpose] = useState("");
  const [maxInterestRate, setMaxInterestRate] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [guarantors, setGuarantors] = useState<GuarantorInput[]>([]);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [maxInterestRateError, setMaxInterestRateError] = useState<string | null>(null);

  const { data: draft, isLoading: draftLoading } = useDraftApplication();
  const submitApplication = useSubmitApplication();
  const updateApplication = useUpdateApplication();
  const deleteApplication = useDeleteApplication();
  const attachGuarantors = useAttachGuarantors();

  // Resume-where-you-left-off: runs once, the first time the draft check
  // resolves. An application that exists but has no guarantors attached
  // yet is, by definition, an unfinished draft (see GET
  // /loans/applications/draft) — everything about it is already real,
  // persisted data, so resuming is just loading it into the form. There's
  // no documents step to check anymore, so a draft always resumes
  // straight into Guarantors.
  useEffect(() => {
    if (draftLoading || hydratedRef.current) return;
    hydratedRef.current = true;
    if (draft) {
      setApplicationId(draft.id);
      setReferenceNumber(draft.reference_number);
      setResumedFromDraft(true);
      setAmount(String(draft.amount));
      if (draft.duration_days != null) {
        setDurationDays(draft.duration_days);
      } else if (draft.duration != null) {
        setDuration(draft.duration);
      }
      setLoanType(draft.loan_type);
      setPurpose(draft.purpose ?? "");
      setMaxInterestRate(draft.max_interest_rate != null ? String(draft.max_interest_rate) : "");
      setValidUntil(draft.valid_until ? draft.valid_until.slice(0, 10) : "");
      setCurrentStep(2);
    }
    setResuming(false);
  }, [draft, draftLoading]);

  const stepTitles = [
    "Apply - Loan Details",
    "Apply - Guarantors",
    "Apply - Review",
  ];

  const nextLabels = [
    "Next: Guarantors ->",
    "Next: Review ->",
    "Submit Application",
  ];

  const validateStep1 = () => {
    const numAmount = Number(amount);
    if (!amount.trim() || Number.isNaN(numAmount)) {
      setAmountError("Enter an amount");
      return false;
    }
    if (numAmount < 1000) {
      setAmountError("Minimum loan is UGX 1,000");
      return false;
    }
    if (numAmount > 50000000) {
      setAmountError("Maximum loan is UGX 50,000,000");
      return false;
    }
    setAmountError(null);

    if (maxInterestRate.trim()) {
      const numRate = Number(maxInterestRate);
      if (Number.isNaN(numRate) || numRate < 0.1 || numRate > 25) {
        setMaxInterestRateError("Must be between 0.1% and 25%, or left blank");
        return false;
      }
    }
    setMaxInterestRateError(null);

    if (loanType === "emergency" && durationDays == null) return false;
    return true;
  };

  const handleStep1Next = async () => {
    if (!validateStep1()) return;
    const numAmount = Number(amount);
    try {
      if (applicationId) {
        await updateApplication.mutateAsync({
          id: applicationId,
          data: {
            amount: numAmount,
            duration: durationDays == null ? duration : null,
            duration_days: durationDays,
            loan_type: loanType,
            purpose,
            max_interest_rate: maxInterestRate ? Number(maxInterestRate) : null,
            valid_until: validUntil || null,
          },
        });
      } else {
        const res = await submitApplication.mutateAsync({
          amount: numAmount,
          duration: durationDays == null ? duration : undefined,
          duration_days: durationDays ?? undefined,
          loan_type: loanType,
          purpose: purpose || undefined,
          max_interest_rate: maxInterestRate ? Number(maxInterestRate) : undefined,
          valid_until: validUntil || undefined,
        });
        setApplicationId(res.application.id);
        setReferenceNumber(res.application.reference_number);
      }
      setCurrentStep(2);
    } catch {
      // errors are surfaced via toast in the mutation hooks
    }
  };

  const handleFinalSubmit = async () => {
    if (!applicationId) return;
    try {
      await attachGuarantors.mutateAsync({
        applicationId,
        guarantorUserIds: guarantors.map((g) => g.user_id),
      });
      setReference(referenceNumber ?? applicationId);
    } catch {
      // errors are surfaced via toast in the mutation hooks
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      await handleStep1Next();
      return;
    }
    if (currentStep === 2 && guarantors.length < 2) {
      return; // button is disabled in this state too — belt and suspenders
    }
    if (currentStep < 3) {
      setCurrentStep((s) => s + 1);
      return;
    }
    await handleFinalSubmit();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      return;
    }
    router.push("/dashboard");
  };

  const handleStartOver = async () => {
    if (!applicationId) return;
    if (!confirm("Discard this loan request and start over? This can't be undone.")) return;
    try {
      await deleteApplication.mutateAsync(applicationId);
      setApplicationId(null);
      setReferenceNumber(null);
      setResumedFromDraft(false);
      setAmount("");
      setDuration(3);
      setDurationDays(null);
      setLoanType("business");
      setPurpose("");
      setMaxInterestRate("");
      setValidUntil("");
      setGuarantors([]);
      setAmountError(null);
      setMaxInterestRateError(null);
      setCurrentStep(1);
      toast.success("Started a fresh request");
    } catch {
      // error toast handled by useDeleteApplication
    }
  };

  const isSubmitting =
    submitApplication.isPending || updateApplication.isPending || attachGuarantors.isPending;
  const step1AmountValid = Number(amount) >= 1000 && Number(amount) <= 50000000;
  const step1RateValid =
    !maxInterestRate.trim() || (Number(maxInterestRate) >= 0.1 && Number(maxInterestRate) <= 25);
  const step1DurationValid = loanType !== "emergency" || durationDays != null;

  if (resuming) {
    return (
      <div className="max-w-5xl space-y-6">
        <BorrowerPageHeader title="Apply - Loan Details" />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-[#2BB5A0]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <BorrowerPageHeader
        title={reference ? "Apply - Submitted" : stepTitles[currentStep - 1]}
      />

      {reference ? (
        <SuccessView reference={reference} />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <StepperHeader currentStep={currentStep} />
            {applicationId && (
              <button
                onClick={handleStartOver}
                disabled={isSubmitting}
                className="text-xs font-medium text-gray-400 hover:text-red-500 disabled:opacity-50"
              >
                Discard &amp; start over
              </button>
            )}
          </div>

          {resumedFromDraft && (
            <div className="-mt-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-700">
              Continuing your unfinished loan request right where you left off.
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {currentStep === 1 && (
                <Step1
                  amount={amount}
                  setAmount={(v) => { setAmount(v); if (amountError) setAmountError(null); }}
                  amountError={amountError}
                  duration={duration}
                  setDuration={setDuration}
                  durationDays={durationDays}
                  setDurationDays={setDurationDays}
                  loanType={loanType}
                  setLoanType={setLoanType}
                  purpose={purpose}
                  setPurpose={setPurpose}
                  maxInterestRate={maxInterestRate}
                  setMaxInterestRate={(v) => { setMaxInterestRate(v); if (maxInterestRateError) setMaxInterestRateError(null); }}
                  maxInterestRateError={maxInterestRateError}
                  validUntil={validUntil}
                  setValidUntil={setValidUntil}
                />
              )}
              {currentStep === 2 && (
                <Step2
                  guarantors={guarantors}
                  onAdd={(g) => setGuarantors((prev) => [...prev, g])}
                  onRemove={(idx) =>
                    setGuarantors((prev) => prev.filter((_, i) => i !== idx))
                  }
                />
              )}
              {currentStep === 3 && (
                <Step3
                  amount={Number(amount) || 0}
                  duration={duration}
                  durationDays={durationDays}
                  loanType={loanType}
                  guarantors={guarantors}
                  validUntil={validUntil}
                  maxInterestRate={maxInterestRate}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
              className="border-gray-300 text-[#1B2B3A]"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={
                isSubmitting ||
                (currentStep === 1 && (!step1AmountValid || !step1RateValid || !step1DurationValid)) ||
                (currentStep === 2 && guarantors.length < 2)
              }
              className="bg-[#2BB5A0] text-white hover:bg-[#239E8C]"
            >
              {isSubmitting ? "Submitting…" : nextLabels[currentStep - 1]}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
