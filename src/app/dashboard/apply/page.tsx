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
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                  ${isCompleted ? "bg-[#2BB5A0] text-white" : isActive ? "bg-[#2BB5A0] text-white" : "bg-white border-2 border-gray-300 text-gray-400"}`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              <span
                className={`text-xs mt-1 font-medium whitespace-nowrap ${isActive ? "text-[#2BB5A0]" : isCompleted ? "text-[#2BB5A0]" : "text-gray-400"}`}
              >
                {step}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-px w-16 sm:w-24 mx-2 mb-5 transition-colors ${stepNum < currentStep ? "bg-[#2BB5A0]" : "bg-gray-200"}`}
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
    <Card className="bg-white border border-gray-200">
      <CardContent className="p-6 space-y-4">
        <h3 className="text-lg font-bold text-[#2BB5A0]">Loan Calculator</h3>
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
              {duration} month{duration !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Interest</span>
            <span className="font-semibold text-[#2BB5A0]">
              UGX {totalInterest.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Monthly Payment</span>
            <span className="font-semibold text-[#1B2B3A]">
              UGX {Math.round(monthly).toLocaleString()}
            </span>
          </div>
          <div className="h-px bg-gray-200" />
          <div className="flex justify-between">
            <span className="font-bold text-[#1B2B3A]">Total Repayable</span>
            <span className="font-bold text-[#2BB5A0]">
              UGX {totalRepayable.toLocaleString()}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-6 space-y-6">
          <h2 className="text-xl font-bold text-[#1B2B3A]">Loan Details</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              How much do you need?
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#2BB5A0]">
              <span className="px-4 py-3 bg-gray-50 text-gray-500 text-sm font-medium border-r border-gray-300">
                UGX
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="flex-1 px-4 py-3 text-[#1B2B3A] font-medium outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => {
                const months = parseInt(d);
                const active = months === duration;
                return (
                  <button
                    key={d}
                    onClick={() => setDuration(months)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors
                      ${active ? "bg-[#2BB5A0] text-white border-[#2BB5A0]" : "bg-white text-[#1B2B3A] border-gray-300 hover:border-[#2BB5A0]"}`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Loan Type
            </label>
            <div className="flex flex-wrap gap-2">
              {LOAN_TYPES.map((t) => {
                const active = t === loanType;
                return (
                  <button
                    key={t}
                    onClick={() => setLoanType(t)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors
                      ${active ? "bg-[#2BB5A0] text-white border-[#2BB5A0]" : "bg-white text-[#1B2B3A] border-gray-300 hover:border-[#2BB5A0]"}`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Purpose
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Briefly describe what you need the loan for..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-[#1B2B3A] outline-none focus:ring-2 focus:ring-[#2BB5A0] resize-none"
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
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${uploaded ? "border-[#2BB5A0] bg-[#2BB5A0]/5" : "border-gray-300 hover:border-[#2BB5A0] bg-gray-50"}`}
    >
      {uploaded ? (
        <div className="flex items-center justify-center gap-2">
          <Check className="w-5 h-5 text-[#2BB5A0]" />
          <span className="text-sm font-medium text-[#1B2B3A]">{filename}</span>
          <span className="text-xs bg-[#2BB5A0] text-white px-2 py-0.5 rounded-full">
            Uploaded
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xs text-gray-400">
            Click to upload or drag and drop
          </p>
        </div>
      )}
    </div>
  );
}

function Step2() {
  return (
    <Card className="bg-white border border-gray-200">
      <CardContent className="p-6 space-y-6">
        <h2 className="text-xl font-bold text-[#1B2B3A]">Upload Documents</h2>

        <div>
          <label className="block text-sm font-semibold text-[#1B2B3A] mb-2">
            National ID
          </label>
          <UploadZone
            label="Upload National ID"
            uploaded
            filename="NIN-CF12345678.pdf"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1B2B3A] mb-2">
            Bank Statement (3 months)
          </label>
          <UploadZone label="Upload Bank Statement" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1B2B3A] mb-2">
            Business Registration / Payslip
          </label>
          <UploadZone label="Upload Business Reg or Payslip" />
        </div>
      </CardContent>
    </Card>
  );
}

function Step3() {
  return (
    <Card className="bg-white border border-gray-200">
      <CardContent className="p-6 space-y-6">
        <h2 className="text-xl font-bold text-[#1B2B3A]">Guarantors</h2>

        <div className="border-2 border-[#2BB5A0] rounded-lg p-4 flex items-center justify-between bg-[#2BB5A0]/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1B2B3A] text-white flex items-center justify-center text-sm font-bold">
              JK
            </div>
            <div>
              <p className="font-semibold text-[#1B2B3A] text-sm">
                Joseph Kato
              </p>
              <p className="text-xs text-gray-500">+256 700 123 456 · Friend</p>
            </div>
          </div>
          <span className="text-xs bg-[#2BB5A0] text-white px-3 py-1 rounded-full font-medium">
            Confirmed
          </span>
        </div>

        <div>
          <h3 className="font-semibold text-[#1B2B3A] mb-4">Add a Guarantor</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-[#1B2B3A] outline-none focus:ring-2 focus:ring-[#2BB5A0]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Phone
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#2BB5A0]">
                <span className="px-4 py-2.5 bg-[#2BB5A0] text-white text-sm font-medium">
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
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Relationship
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-[#1B2B3A] outline-none focus:ring-2 focus:ring-[#2BB5A0] bg-white">
                <option value="">Select relationship</option>
                <option>Friend</option>
                <option>Family</option>
                <option>Colleague</option>
                <option>Business Partner</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                NIN
              </label>
              <input
                type="text"
                placeholder="National Identification Number"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-[#1B2B3A] outline-none focus:ring-2 focus:ring-[#2BB5A0]"
              />
            </div>
            <Button className="bg-[#2BB5A0] hover:bg-[#239E8C] text-white w-full">
              Send Invite SMS
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Step4({ amount, duration }: { amount: number; duration: number }) {
  const rate = 0.05;
  const totalRepayable = amount + amount * rate * duration;

  return (
    <Card className="bg-white border border-gray-200">
      <CardContent className="p-6 space-y-6">
        <h2 className="text-xl font-bold text-[#1B2B3A]">
          Review &amp; Submit
        </h2>

        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-[#1B2B3A] text-white flex items-center justify-center text-sm font-bold">
            JM
          </div>
          <div>
            <p className="font-semibold text-[#1B2B3A]">James Mugisha</p>
            <p className="text-xs text-gray-500">Offer #LF-2024-001</p>
          </div>
        </div>

        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100">
            {[
              ["Loan Amount", `UGX ${amount.toLocaleString()}`, false],
              ["Duration", `${duration} months`, false],
              ["Interest Rate", "5% / month", true],
              [
                "Total Repayable",
                `UGX ${totalRepayable.toLocaleString()}`,
                true,
              ],
              ["Guarantors", "1 confirmed", false],
            ].map(([label, value, highlight], i) => (
              <tr key={i}>
                <td className="py-3 text-gray-500">{label}</td>
                <td
                  className={`py-3 font-semibold text-right ${highlight ? "text-[#2BB5A0]" : "text-[#1B2B3A]"}`}
                >
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          By submitting this application, you agree to WeLend&apos;s terms and
          confirm that all information provided is accurate and complete.
        </div>
      </CardContent>
    </Card>
  );
}

function SuccessView() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-[#2BB5A0]/10 flex items-center justify-center">
        <Check className="w-10 h-10 text-[#2BB5A0]" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-[#1B2B3A]">
          Application Submitted!
        </h2>
        <p className="text-gray-500 mt-1">
          Reference:{" "}
          <span className="font-semibold text-[#1B2B3A]">#APP-20240091</span>
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-6 py-3 inline-flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        <span className="text-sm font-medium text-amber-700">Under Review</span>
      </div>

      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between">
          {[
            "Submitted",
            "Lender Review",
            "Approval",
            "Disbursement",
            "Repayment Begins",
          ].map((label, idx) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 flex-1"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${idx === 0 ? "bg-[#2BB5A0] text-white" : "bg-gray-100 text-gray-400 border border-gray-200"}`}
              >
                {idx === 0 ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`text-xs text-center leading-tight ${idx === 0 ? "text-[#2BB5A0] font-medium" : "text-gray-400"}`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-[#1B2B3A] text-[#1B2B3A] text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Back to Dashboard
        </a>
        <a
          href="/dashboard/my-requests"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#2BB5A0] text-white text-sm font-medium hover:bg-[#239E8C] transition-colors"
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
    "Apply — Loan Details",
    "Apply — Documents",
    "Apply — Guarantors",
    "Apply — Review",
  ];
  const nextLabels = [
    "Next: Documents \u2192",
    "Next: Guarantors \u2192",
    "Next: Review \u2192",
    "Submit Application",
  ];

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((s) => s + 1);
    else setSubmitted(true);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
    else router.push("/dashboard");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <BorrowerPageHeader
        title={submitted ? "Apply — Submitted" : stepTitles[currentStep - 1]}
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
              className="bg-[#2BB5A0] hover:bg-[#239E8C] text-white"
            >
              {nextLabels[currentStep - 1]}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
