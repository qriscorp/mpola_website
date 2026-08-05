"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Upload } from "lucide-react";
import { BorrowerPageHeader } from "@/components/top-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useSubmitApplication,
  useAddGuarantor,
  useUploadDocument,
} from "@/hooks/use-application";
import { formatCurrency } from "@/lib/format";

const STEPS = ["Loan Details", "Documents", "Guarantors", "Review"];
const DURATIONS = ["1 mo", "2 mo", "3 mo", "4 mo", "6 mo", "12 mo"];
const LOAN_TYPES = [
  { label: "Business", value: "business" },
  { label: "Personal", value: "personal" },
  { label: "Agricultural", value: "agricultural" },
  { label: "Emergency", value: "emergency" },
];

// Matches mpola_api's default platform rate (routers/loans.py: rate = 15.0, annual %).
const PLATFORM_RATE_PA = 15;

interface GuarantorInput {
  name: string;
  phone: string;
  relationship_type: string;
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
  const totalInterest = amount * (PLATFORM_RATE_PA / 100) * (duration / 12);
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
              {PLATFORM_RATE_PA}% p.a.
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
}: {
  amount: number;
  setAmount: (v: number) => void;
  duration: number;
  setDuration: (v: number) => void;
  loanType: string;
  setLoanType: (v: string) => void;
  purpose: string;
  setPurpose: (v: string) => void;
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

const DOCUMENT_SLOTS = [
  { key: "national_id", label: "National ID" },
  { key: "bank_statement", label: "Bank Statement (3 months)" },
  { key: "business_registration", label: "Business Registration / Payslip" },
];

function Step2({
  files,
  onSelect,
}: {
  files: Record<string, File>;
  onSelect: (key: string, file: File) => void;
}) {
  return (
    <Card className="border border-gray-200 bg-white">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-2xl font-black text-[#1B2B3A]">Upload Documents</h2>
        <p className="text-sm text-gray-500">
          Optional for now — document upload isn&apos;t required to submit
          your application.
        </p>

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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("Colleague");

  const handleAdd = () => {
    if (!name.trim() || !phone.trim()) return;
    onAdd({ name, phone: `+256${phone}`, relationship_type: relationship });
    setName("");
    setPhone("");
  };

  return (
    <Card className="border border-gray-200 bg-white">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-2xl font-black text-[#1B2B3A]">Add Guarantors</h2>
        <p className="text-sm text-gray-500">
          Add at least 2 guarantors. They&apos;ll be attached to your
          application when you submit.
        </p>

        {guarantors.map((g, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between rounded-xl border-2 border-[#2BB5A0] bg-[#E6F4F2] p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#149D8E] text-sm font-bold text-white">
                {g.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <p className="text-lg font-bold text-[#1B2B3A]">{g.name}</p>
                <p className="text-sm text-gray-500">
                  {g.phone} · {g.relationship_type}
                </p>
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

        <div className="rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Guarantor full name"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-[#1B2B3A] outline-none focus:ring-2 focus:ring-[#2BB5A0]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Phone (MTN/Airtel)
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

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-[#1B2B3A] outline-none focus:ring-2 focus:ring-[#2BB5A0]"
              >
                <option>Colleague</option>
                <option>Friend</option>
                <option>Family</option>
                <option>Business Partner</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleAdd}
            className="mt-4 bg-[#2BB5A0] text-white hover:bg-[#239E8C]"
          >
            Add Guarantor
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Step4({
  amount,
  duration,
  loanType,
  guarantors,
}: {
  amount: number;
  duration: number;
  loanType: string;
  guarantors: GuarantorInput[];
}) {
  const totalInterest = amount * (PLATFORM_RATE_PA / 100) * (duration / 12);
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
            ["Rate", `${PLATFORM_RATE_PA}% p.a.`],
            ["Total Repayable", formatCurrency(Math.round(totalRepayable))],
            [
              "Guarantors",
              guarantors.length > 0
                ? guarantors.map((g) => g.name).join(", ")
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
  const [guarantors, setGuarantors] = useState<GuarantorInput[]>([]);
  const [files, setFiles] = useState<Record<string, File>>({});

  const submitApplication = useSubmitApplication();
  const addGuarantor = useAddGuarantor();
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
      });
      await Promise.all([
        ...guarantors.map((g) =>
          addGuarantor.mutateAsync({
            applicationId: res.application.id,
            data: g,
          }),
        ),
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
    addGuarantor.isPending ||
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
            />
          )}

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
              disabled={isSubmitting}
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
