"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Upload } from "lucide-react";
import { BorrowerPageHeader } from "@/components/top-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KYCUploadSection } from "@/components/kyc-upload-section";
import {
  useSubmitApplication,
  useUploadDocument,
} from "@/hooks/use-application";
import { useSearchGuarantorCandidate, useAttachGuarantors } from "@/hooks/use-guarantors";
import { formatCurrency } from "@/lib/format";

const STEPS = ["Loan Details", "Documents", "Guarantors", "Review"];
// Backend enforces duration >= 3 months (repository/models.py's
// LoanApplicationCreate) — 1/2 mo used to be offered here and would always
// fail validation on submit.
const DURATIONS = ["3 mo", "4 mo", "6 mo", "12 mo"];
const LOAN_TYPES = [
  { label: "Business", value: "business" },
  { label: "Personal", value: "personal" },
  { label: "Agricultural", value: "agricultural" },
  { label: "Emergency", value: "emergency" },
];

// Matches mpola_api's default platform rate (routers/loans.py: rate = 3.0, % per month).
const PLATFORM_RATE_PER_MONTH = 3;

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
}: {
  amount: number;
  duration: number;
}) {
  const totalInterest = amount * (PLATFORM_RATE_PER_MONTH / 100) * duration;
  const totalRepayable = amount + totalInterest;
  const monthly = duration > 0 ? totalRepayable / duration : 0;

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
            <span className="text-gray-500">Interest Rate</span>
            <span className="font-semibold text-[#1B2B3A]">
              {PLATFORM_RATE_PER_MONTH}%/month
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Duration</span>
            <span className="font-semibold text-[#1B2B3A]">
              {duration} months
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Interest</span>
            <span className="font-semibold text-[#149D8E]">
              {formatCurrency(Math.round(totalInterest))}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-[#1B2B3A]">Monthly Payment</span>
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
          Final rate may vary — this is the current platform default.
        </p>
      </CardContent>
    </Card>
  );
}

function Step1({
  amount,
  setAmount,
  duration,
  setDuration,
  loanType,
  setLoanType,
  purpose,
  setPurpose,
  maxInterestRate,
  setMaxInterestRate,
  validUntil,
  setValidUntil,
}: {
  amount: number;
  setAmount: (v: number) => void;
  duration: number;
  setDuration: (v: number) => void;
  loanType: string;
  setLoanType: (v: string) => void;
  purpose: string;
  setPurpose: (v: string) => void;
  maxInterestRate: string;
  setMaxInterestRate: (v: string) => void;
  validUntil: string;
  setValidUntil: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
      <Card className="border border-gray-200 bg-white">
        <CardContent className="space-y-6 p-6">
          <h2 className="text-2xl font-black text-[#1B2B3A]">Loan Details</h2>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              How much do you need?
            </label>
            <div className="flex items-center overflow-hidden rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-[#2BB5A0]">
              <span className="border-r border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-500">
                UGX
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="flex-1 px-4 py-3 text-sm font-medium text-[#1B2B3A] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Duration
            </label>
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
                    onClick={() => setLoanType(t.value)}
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
              step="0.1"
              value={maxInterestRate}
              onChange={(e) => setMaxInterestRate(e.target.value)}
              placeholder="e.g. 3 — leave blank to accept any rate"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-[#1B2B3A] outline-none focus:ring-2 focus:ring-[#2BB5A0]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Need it by (optional)
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

      <LoanCalculator amount={amount} duration={duration} />
    </div>
  );
}

function UploadZone({
  file,
  onSelect,
}: {
  file: File | null;
  onSelect: (file: File) => void;
}) {
  const inputId = useId();
  return (
    <label
      htmlFor={inputId}
      className={`block cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
        file
          ? "border-[#2BB5A0] bg-[#E6F4F2]"
          : "border-gray-300 bg-gray-50 hover:border-[#2BB5A0]"
      }`}
    >
      <input
        id={inputId}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onSelect(f);
        }}
      />
      <div className="space-y-2">
        <Upload
          className={`mx-auto h-8 w-8 ${file ? "text-[#2BB5A0]" : "text-gray-400"}`}
        />
        <p className="text-sm font-medium text-[#1B2B3A]">
          {file ? file.name : "Drop file or click to upload"}
        </p>
        <p className="text-xs text-gray-400">PDF, JPG, PNG · Max 10MB</p>
      </div>
    </label>
  );
}

// Genuinely loan-specific paperwork — NOT identity documents, so unrelated
// to KYC. Identity (national_id, passport, profile_photo, proof_of_address)
// is handled entirely by KYCUploadSection below, reusing whatever the
// borrower already has on file from their account KYC instead of asking
// them to re-upload the same thing here.
const DOCUMENT_SLOTS = [
  { key: "bank_statement", label: "Bank Statement (3 months)" },
  { key: "business_registration", label: "Business Registration" },
];

function Step2({
  files,
  onSelect,
}: {
  files: Record<string, File>;
  onSelect: (key: string, file: File) => void;
}) {
  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 bg-white">
        <CardContent className="space-y-2 p-6">
          <h2 className="text-2xl font-black text-[#1B2B3A]">Identity Documents</h2>
          <p className="text-sm text-gray-500">
            Pulled from your account KYC — already verified documents are used
            automatically, nothing to re-upload. Anything missing or still
            pending review needs uploading here once.
          </p>
          <div className="pt-2">
            <KYCUploadSection accent="teal" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white">
        <CardContent className="space-y-6 p-6">
          <div>
            <h2 className="text-2xl font-black text-[#1B2B3A]">Loan Documents</h2>
            <p className="text-sm text-gray-500">
              Optional for now — not required to submit your application.
            </p>
          </div>

          {DOCUMENT_SLOTS.map((slot) => (
            <div key={slot.key}>
              <label className="mb-2 block text-lg font-bold text-[#1B2B3A]">
                {slot.label}
              </label>
              <UploadZone
                file={files[slot.key] ?? null}
                onSelect={(file) => onSelect(slot.key, file)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Step3({
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
        <h2 className="text-2xl font-black text-[#1B2B3A]">Add Guarantors</h2>
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

function Step4({
  amount,
  duration,
  loanType,
  guarantors,
  validUntil,
}: {
  amount: number;
  duration: number;
  loanType: string;
  guarantors: GuarantorInput[];
  validUntil: string;
}) {
  const totalInterest = amount * (PLATFORM_RATE_PER_MONTH / 100) * duration;
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
            ["Duration", `${duration} months`],
            ["Rate", `${PLATFORM_RATE_PER_MONTH}%/month`],
            ["Total Repayable", formatCurrency(Math.round(totalRepayable))],
            [
              "Needed By",
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

  const [amount, setAmount] = useState(8000000);
  const [duration, setDuration] = useState(3);
  const [loanType, setLoanType] = useState("business");
  const [purpose, setPurpose] = useState("");
  const [maxInterestRate, setMaxInterestRate] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [guarantors, setGuarantors] = useState<GuarantorInput[]>([]);
  const [files, setFiles] = useState<Record<string, File>>({});

  const submitApplication = useSubmitApplication();
  const attachGuarantors = useAttachGuarantors();
  const uploadDocument = useUploadDocument();

  const stepTitles = [
    "Apply - Loan Details",
    "Apply - Documents",
    "Apply - Guarantors",
    "Apply - Review",
  ];

  const nextLabels = [
    "Next: Documents ->",
    "Next: Guarantors ->",
    "Next: Review ->",
    "Submit Application",
  ];

  const handleSubmit = async () => {
    try {
      const res = await submitApplication.mutateAsync({
        amount,
        duration,
        loan_type: loanType,
        purpose: purpose || undefined,
        max_interest_rate: maxInterestRate ? Number(maxInterestRate) : undefined,
        valid_until: validUntil || undefined,
      });
      await Promise.all([
        attachGuarantors.mutateAsync({
          applicationId: res.application.id,
          guarantorUserIds: guarantors.map((g) => g.user_id),
        }),
        ...Object.entries(files).map(([documentType, file]) =>
          uploadDocument.mutateAsync({
            applicationId: res.application.id,
            file,
            documentType,
          }),
        ),
      ]);
      setReference(res.application.reference_number);
    } catch {
      // errors are surfaced via toast in the mutation hooks
    }
  };

  const handleNext = () => {
    if (currentStep === 3 && guarantors.length < 2) {
      return; // button is disabled in this state too — belt and suspenders
    }
    if (currentStep < 4) {
      setCurrentStep((s) => s + 1);
      return;
    }
    handleSubmit();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      return;
    }
    router.push("/dashboard");
  };

  const isSubmitting =
    submitApplication.isPending ||
    attachGuarantors.isPending ||
    uploadDocument.isPending;

  return (
    <div className="max-w-5xl space-y-6">
      <BorrowerPageHeader
        title={reference ? "Apply - Submitted" : stepTitles[currentStep - 1]}
      />

      {reference ? (
        <SuccessView reference={reference} />
      ) : (
        <>
          <StepperHeader currentStep={currentStep} />

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
                  setAmount={setAmount}
                  duration={duration}
                  setDuration={setDuration}
                  loanType={loanType}
                  setLoanType={setLoanType}
                  purpose={purpose}
                  setPurpose={setPurpose}
                  maxInterestRate={maxInterestRate}
                  setMaxInterestRate={setMaxInterestRate}
                  validUntil={validUntil}
                  setValidUntil={setValidUntil}
                />
              )}
              {currentStep === 2 && (
                <Step2
                  files={files}
                  onSelect={(key, file) =>
                    setFiles((prev) => ({ ...prev, [key]: file }))
                  }
                />
              )}
              {currentStep === 3 && (
                <Step3
                  guarantors={guarantors}
                  onAdd={(g) => setGuarantors((prev) => [...prev, g])}
                  onRemove={(idx) =>
                    setGuarantors((prev) => prev.filter((_, i) => i !== idx))
                  }
                />
              )}
              {currentStep === 4 && (
                <Step4
                  amount={amount}
                  duration={duration}
                  loanType={loanType}
                  guarantors={guarantors}
                  validUntil={validUntil}
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
              disabled={isSubmitting || (currentStep === 3 && guarantors.length < 2)}
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
