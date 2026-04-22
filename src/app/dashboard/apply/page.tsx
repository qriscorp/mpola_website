"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Upload } from "lucide-react";
import { BorrowerPageHeader } from "@/components/top-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = ["Loan Details", "Documents", "Guarantors", "Review"];
const DURATIONS = ["1 mo", "2 mo", "3 mo", "4 mo", "6 mo", "12 mo"];
const LOAN_TYPES = ["Business", "Personal", "Agricultural", "Emergency"];

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
  const rate = 0.05;
  const totalInterest = amount * rate * duration;
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
              UGX {amount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Interest Rate</span>
            <span className="font-semibold text-[#1B2B3A]">5% / month</span>
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
              UGX {totalInterest.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-[#1B2B3A]">Monthly Payment</span>
            <span className="font-bold text-[#1B2B3A]">
              UGX {Math.round(monthly).toLocaleString()}
            </span>
          </div>
          <div className="h-px bg-[#9DDAD1]" />
          <div className="flex justify-between">
            <span className="text-2xl font-black text-[#1B2B3A]">
              Total Repayable
            </span>
            <span className="text-3xl font-black text-[#149D8E]">
              UGX {totalRepayable.toLocaleString()}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Applying to: James Mugisha&apos;s offer
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
                const active = t === loanType;
                return (
                  <button
                    key={t}
                    onClick={() => setLoanType(t)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "border-[#2BB5A0] bg-[#E6F4F2] text-[#149D8E]"
                        : "border-gray-300 bg-white text-[#1B2B3A] hover:border-[#2BB5A0]"
                    }`}
                  >
                    {t}
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
  label,
  uploaded,
  filename,
}: {
  label: string;
  uploaded?: boolean;
  filename?: string;
}) {
  return (
    <div
      className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
        uploaded
          ? "border-[#2BB5A0] bg-[#E6F4F2]"
          : "border-gray-300 bg-gray-50 hover:border-[#2BB5A0]"
      }`}
    >
      {uploaded ? (
        <div className="flex items-center justify-between gap-3 text-left">
          <div>
            <p className="text-lg font-bold text-[#1B2B3A]">{filename}</p>
            <p className="text-sm text-gray-500">Uploaded · 245 KB</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
            Uploaded
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <p className="text-sm font-medium text-[#1B2B3A]">{label}</p>
          <p className="text-xs text-gray-400">PDF, JPG, PNG · Max 10MB</p>
        </div>
      )}
    </div>
  );
}

function Step2() {
  return (
    <Card className="border border-gray-200 bg-white">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-2xl font-black text-[#1B2B3A]">Upload Documents</h2>

        <div>
          <label className="mb-2 block text-lg font-bold text-[#1B2B3A]">
            National ID <span className="text-red-500">*Required</span>
          </label>
          <UploadZone
            label="Drop file or click to upload"
            uploaded
            filename="NIN-CF12345678.pdf"
          />
        </div>

        <div>
          <label className="mb-2 block text-lg font-bold text-[#1B2B3A]">
            Bank Statement (3 months){" "}
            <span className="text-red-500">*Required</span>
          </label>
          <UploadZone label="Drop file or click to upload" />
        </div>

        <div>
          <label className="mb-2 block text-lg font-bold text-[#1B2B3A]">
            Business Registration / Payslip{" "}
            <span className="text-red-500">*Required</span>
          </label>
          <UploadZone label="Drop file or click to upload" />
        </div>
      </CardContent>
    </Card>
  );
}

function Step3() {
  return (
    <Card className="border border-gray-200 bg-white">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-2xl font-black text-[#1B2B3A]">Add Guarantors</h2>
        <p className="text-sm text-gray-500">
          Add at least 2 guarantors. They&apos;ll receive an SMS to confirm.
        </p>

        <div className="flex items-center justify-between rounded-xl border-2 border-[#2BB5A0] bg-[#E6F4F2] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#149D8E] text-sm font-bold text-white">
              SM
            </div>
            <div>
              <p className="text-lg font-bold text-[#1B2B3A]">Sarah Mirembe</p>
              <p className="text-sm text-gray-500">
                +256 701 234 567 · Colleague
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
            Confirmed
          </span>
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Guarantor 2 full name"
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
                  placeholder="700 000 000"
                  className="flex-1 px-4 py-2.5 text-sm text-[#1B2B3A] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Relationship
              </label>
              <select className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-[#1B2B3A] outline-none focus:ring-2 focus:ring-[#2BB5A0]">
                <option>Colleague</option>
                <option>Friend</option>
                <option>Family</option>
                <option>Business Partner</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                NIN
              </label>
              <input
                type="text"
                placeholder="NIN or Passport No."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-[#1B2B3A] outline-none focus:ring-2 focus:ring-[#2BB5A0]"
              />
            </div>
          </div>

          <Button className="mt-4 bg-[#2BB5A0] text-white hover:bg-[#239E8C]">
            Send Invite SMS
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Step4({ amount, duration }: { amount: number; duration: number }) {
  const totalRepayable = amount + amount * 0.05 * duration;

  return (
    <Card className="border border-gray-200 bg-white">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-2xl font-black text-[#1B2B3A]">
          Review &amp; Submit
        </h2>

        <div className="overflow-hidden rounded-xl border border-[#9DDAD1]">
          <div className="border-b border-[#9DDAD1] bg-[#E6F4F2] px-4 py-3">
            <p className="font-bold text-[#149D8E]">Lender</p>
          </div>
          <div className="border-b border-gray-200 px-4 py-3 text-sm flex items-center justify-between">
            <span className="text-gray-500">Lender</span>
            <span className="font-bold text-[#1B2B3A]">
              James Mugisha (#LF-2024-001)
            </span>
          </div>

          <div className="border-b border-[#9DDAD1] bg-[#E6F4F2] px-4 py-3">
            <p className="font-bold text-[#149D8E]">Loan Terms</p>
          </div>

          {[
            ["Amount", `UGX ${amount.toLocaleString()}`],
            ["Duration", `${duration} months`],
            ["Rate", "5% / month"],
            ["Total Repayable", `UGX ${totalRepayable.toLocaleString()}`],
            ["Guarantors", "Sarah Mirembe · (Pending 1)"],
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
          By submitting, you agree to WeLend&apos;s terms and confirm the
          information above is accurate.
        </div>
      </CardContent>
    </Card>
  );
}

function SuccessView() {
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
          <span className="font-semibold text-[#1B2B3A]">#APP-20240091</span>
        </p>
      </div>

      <div className="inline-flex items-center gap-2 rounded-lg border border-[#9DDAD1] bg-[#E6F4F2] px-6 py-3">
        <span className="h-2 w-2 rounded-full bg-[#2BB5A0]" />
        <span className="text-sm font-semibold text-[#149D8E]">
          Under Review
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
  const [submitted, setSubmitted] = useState(false);

  const [amount, setAmount] = useState(8000000);
  const [duration, setDuration] = useState(3);
  const [loanType, setLoanType] = useState("Business");
  const [purpose, setPurpose] = useState("");

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

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((s) => s + 1);
      return;
    }
    setSubmitted(true);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="max-w-5xl space-y-6">
      <BorrowerPageHeader
        title={submitted ? "Apply - Submitted" : stepTitles[currentStep - 1]}
      />

      {submitted ? (
        <SuccessView />
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
          {currentStep === 2 && <Step2 />}
          {currentStep === 3 && <Step3 />}
          {currentStep === 4 && <Step4 amount={amount} duration={duration} />}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="border-gray-300 text-[#1B2B3A]"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="bg-[#2BB5A0] text-white hover:bg-[#239E8C]"
            >
              {nextLabels[currentStep - 1]}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
