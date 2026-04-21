"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Building2,
  Info,
  CheckCircle2,
  Star,
  Upload,
  File,
  Check,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useLenders, useSubmitApplication } from "@/hooks/use-application";
import {
  LOAN_PURPOSES,
  LOAN_DURATIONS,
  DOCUMENT_TYPES,
  RELATIONSHIPS,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

const STEPS = ["Loan Details", "Documents", "Guarantors", "Lenders", "Review"];

export default function ApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const { data: lenders } = useLenders();
  const { mutate: submit, isPending: isSubmitting } = useSubmitApplication();

  // Step 1 state
  const [amount, setAmount] = useState(8000000);
  const [duration, setDuration] = useState(18);
  const [loanType, setLoanType] = useState<"personal" | "business">("business");
  const [purpose, setPurpose] = useState("Business expansion");
  const [description, setDescription] = useState(
    "Expanding my salon in Ntinda — adding 2 stations and new equipment",
  );

  // Step 2 state
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({
    national_id: true,
    payslips: true,
    bank_statement: true,
    passport_photo: true,
    trading_licence: true,
  });

  // Step 3 state
  const [guarantor1] = useState({
    fullName: "Grace Namuli",
    relationship: "Sibling",
    phone: "+25672 118 402",
    email: "grace.namuli@gmail.com",
    confirmed: true,
    confirmedAt: "17 Apr 2026 · 11:42 EAT",
  });
  const [guarantor2] = useState({
    fullName: "Peter Mbabazi",
    relationship: "Business Partner",
    phone: "+25602 994 118",
    email: "peter.m@mbabazi-partners.ug",
    confirmed: true,
    confirmedAt: "17 Apr 2026 · 11:42 EAT",
  });

  // Step 4 state
  const [selectedLenders, setSelectedLenders] = useState<string[]>([
    "lender_001",
    "lender_002",
    "lender_004",
  ]);

  // Step 5 state
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Calculations
  const estRate = loanType === "personal" ? 13.75 : 15.25;
  const estMonthly = Math.round(
    (amount * (1 + (estRate / 100) * (duration / 12))) / duration,
  );

  const toggleLender = useCallback((id: string) => {
    setSelectedLenders((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  }, []);

  const handleSubmit = () => {
    submit(
      { amount, duration, loanType, purpose, description },
      {
        onSuccess: () => router.push("/dashboard/apply/success"),
      },
    );
  };

  const uploadedCount = Object.values(uploadedDocs).filter(Boolean).length;
  const totalDocs =
    DOCUMENT_TYPES.required.length + DOCUMENT_TYPES.recommended.length;

  return (
    <div className="max-w-[1100px] space-y-6">
      {/* Back */}
      <Link
        href="/dashboard"
        className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Stepper */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  ${i < step ? "bg-[#2BB5A0] text-white" : i === step ? "bg-[#1B2B3A] text-white" : "bg-gray-200 text-gray-500"}`}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-xs mt-1 ${i <= step ? "text-[#1B2B3A] font-medium" : "text-gray-400"}`}
              >
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mt-[-16px] ${i < step ? "bg-[#2BB5A0]" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ────── STEP 1: Loan Details ────── */}
      {step === 0 && (
        <div>
          <h1 className="text-3xl font-bold text-[#1B2B3A]">
            Tell us about the loan you need
          </h1>
          <p className="text-gray-500 mt-1">
            Start with the basics — you can refine everything before submitting.
          </p>

          <div className="grid grid-cols-3 gap-6 mt-6">
            <div className="col-span-2 space-y-6">
              {/* Amount */}
              <div>
                <Label className="mb-1.5">How much do you need?</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                    UGX
                  </span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="pl-14 text-lg font-semibold"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Minimum UGX 500,000 · Maximum UGX 50,000,000
                </p>
              </div>

              {/* Duration */}
              <div>
                <Label className="mb-2">Repayment duration</Label>
                <div className="flex gap-2">
                  {LOAN_DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                        ${duration === d ? "bg-[#1B2B3A] text-white border-[#1B2B3A]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                    >
                      {d} months
                    </button>
                  ))}
                  <button className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50">
                    Custom
                  </button>
                </div>
              </div>

              {/* Loan Type */}
              <div>
                <Label className="mb-2">Loan type</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setLoanType("personal")}
                    className={`p-4 rounded-xl border-2 text-left transition-colors
                      ${loanType === "personal" ? "border-[#2BB5A0] bg-[#E8F8F5]" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <User className="w-5 h-5 text-gray-500 mb-2" />
                    <p className="font-semibold text-[#1B2B3A]">
                      Personal Loan
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      For individuals · 11.5–16% p.a. · Payslip or income proof
                      required
                    </p>
                  </button>
                  <button
                    onClick={() => setLoanType("business")}
                    className={`p-4 rounded-xl border-2 text-left transition-colors
                      ${loanType === "business" ? "border-[#2BB5A0] bg-[#E8F8F5]" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <Building2 className="w-5 h-5 text-gray-500 mb-2" />
                    <p className="font-semibold text-[#1B2B3A]">
                      Business Loan
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      For registered businesses · 12.5–18% p.a. · Trading
                      licence & financials
                    </p>
                  </button>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <Label>Purpose</Label>
                <Select
                  value={purpose}
                  onValueChange={(v) => v && setPurpose(v)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOAN_PURPOSES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <Label>
                  Brief description{" "}
                  <span className="text-gray-400 font-normal">
                    (optional, helps lenders)
                  </span>
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </div>

            {/* Live Estimate Sidebar */}
            <Card className="bg-white self-start sticky top-6">
              <CardContent className="p-5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Live Estimate
                </p>
                <p className="text-sm text-gray-500">
                  Estimated monthly payment
                </p>
                <p className="text-3xl font-bold text-[#2BB5A0] mt-1">
                  <span className="text-sm font-normal text-gray-400 mr-1">
                    UGX
                  </span>
                  {estMonthly.toLocaleString()}
                </p>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-medium">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium italic">
                      {duration} months
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Est. rate range</span>
                    <span className="font-medium italic">12.2–16.0% p.a.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total repayable</span>
                    <span className="font-medium italic">
                      {formatCurrency(Math.round(estMonthly * duration * 0.97))}
                      –
                      {formatCurrency(Math.round(estMonthly * duration * 1.03))}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">
                    <Info className="w-3 h-3 inline mr-1" />
                    <strong>This is an estimate.</strong> Actual rates are set
                    by lenders based on your profile, documents, and guarantors.
                    You&apos;ll see real offers in Step 4.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ────── STEP 2: Documents ────── */}
      {step === 1 && (
        <div>
          <h1 className="text-3xl font-bold text-[#1B2B3A]">
            Upload supporting documents
          </h1>
          <p className="text-gray-500 mt-1">
            The more you share, the better the rates you&apos;ll see.
          </p>

          <div className="grid grid-cols-3 gap-6 mt-6">
            <div className="col-span-2 space-y-6">
              {/* Required */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Required Documents
                </p>
                <div className="space-y-3">
                  {DOCUMENT_TYPES.required.map((doc) => (
                    <Card key={doc.key} className="bg-white">
                      <CardContent className="p-4 flex items-center gap-4">
                        <File className="w-5 h-5 text-gray-400 shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-[#1B2B3A]">
                            {doc.label}
                          </p>
                          <p className="text-xs text-gray-400">
                            {doc.description}
                          </p>
                        </div>
                        {uploadedDocs[doc.key] ? (
                          <>
                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />{" "}
                              Uploaded
                            </span>
                            <button className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                              Replace
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-xs text-gray-400">
                              Not uploaded
                            </span>
                            <button
                              onClick={() =>
                                setUploadedDocs((d) => ({
                                  ...d,
                                  [doc.key]: true,
                                }))
                              }
                              className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 flex items-center gap-1"
                            >
                              <Upload className="w-3 h-3" /> Upload
                            </button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Recommended */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Recommended Documents
                </p>
                <div className="space-y-3">
                  {DOCUMENT_TYPES.recommended.map((doc) => (
                    <Card key={doc.key} className="bg-white">
                      <CardContent className="p-4 flex items-center gap-4">
                        <File className="w-5 h-5 text-gray-400 shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-[#2BB5A0]">
                            {doc.label}
                          </p>
                          <p className="text-xs text-gray-400">
                            {doc.description}
                          </p>
                        </div>
                        {uploadedDocs[doc.key] ? (
                          <>
                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />{" "}
                              Uploaded
                            </span>
                            <button className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                              Replace
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-xs text-gray-400">
                              Not uploaded
                            </span>
                            <button
                              onClick={() =>
                                setUploadedDocs((d) => ({
                                  ...d,
                                  [doc.key]: true,
                                }))
                              }
                              className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 flex items-center gap-1"
                            >
                              <Upload className="w-3 h-3" /> Upload
                            </button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Drop zone */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-sm text-[#1B2B3A]">
                  Drop files here or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, JPG, PNG · Max 10 MB per file
                </p>
              </div>
            </div>

            {/* Upload Progress Sidebar */}
            <Card className="bg-white self-start sticky top-6">
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    Upload Progress
                  </p>
                  <p className="text-3xl font-bold text-[#1B2B3A]">
                    {uploadedCount}
                    <span className="text-lg text-gray-400">
                      /{totalDocs}
                    </span>{" "}
                    <span className="text-sm font-normal text-gray-400">
                      documents
                    </span>
                  </p>
                  <Progress
                    value={(uploadedCount / totalDocs) * 100}
                    className="mt-2 h-2 [&>div]:bg-[#2BB5A0]"
                  />
                </div>

                <div className="p-3 bg-[#E8F8F5] rounded-lg">
                  <p className="text-xs text-gray-600">
                    <Sparkles className="w-3 h-3 inline mr-1 text-[#2BB5A0]" />
                    <strong>Tip:</strong> Uploading your trading licence and
                    6-month bank statement typically drops your offered rate by{" "}
                    <strong>1.5–2.5%</strong>.
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Status Summary
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Required</span>
                      <span className="font-semibold">
                        {
                          DOCUMENT_TYPES.required.filter(
                            (d) => uploadedDocs[d.key],
                          ).length
                        }
                        /{DOCUMENT_TYPES.required.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Recommended</span>
                      <span className="font-semibold">
                        {
                          DOCUMENT_TYPES.recommended.filter(
                            (d) => uploadedDocs[d.key],
                          ).length
                        }
                        /{DOCUMENT_TYPES.recommended.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Profile strength</span>
                      <Badge className="bg-emerald-50 text-emerald-600 text-xs">
                        Strong
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ────── STEP 3: Guarantors ────── */}
      {step === 2 && (
        <div>
          <h1 className="text-3xl font-bold text-[#1B2B3A]">
            Add two guarantors
          </h1>
          <p className="text-gray-500 mt-1">
            People who&apos;ll vouch for you — they won&apos;t be billed unless
            you default.
          </p>

          <div className="mt-4 p-4 bg-[#E8F8F5] rounded-lg border border-[#2BB5A0]/20">
            <p className="text-sm text-gray-700">
              <Info className="w-4 h-4 inline mr-1 text-[#2BB5A0]" />
              <strong>What is a guarantor?</strong> A trusted person (friend,
              family, colleague) who agrees to cover your loan if you
              can&apos;t. They&apos;ll get a secure link to review terms and
              accept or decline. You need <strong>two confirmed</strong>{" "}
              guarantors to proceed.
            </p>
          </div>

          <div className="mt-6 space-y-6">
            {[guarantor1, guarantor2].map((g, i) => (
              <Card key={i} className="bg-white border-l-4 border-l-[#2BB5A0]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Guarantor {i + 1}
                    </p>
                    {g.confirmed && (
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />{" "}
                        Confirmed & Verified
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input className="mt-1.5" value={g.fullName} readOnly />
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <Select value={g.relationship} disabled>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RELATIONSHIPS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <div className="mt-1.5 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                          🇺🇬
                        </span>
                        <Input className="pl-10" value={g.phone} readOnly />
                      </div>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input className="mt-1.5" value={g.email} readOnly />
                    </div>
                  </div>

                  {g.confirmed && (
                    <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                      <p className="text-sm text-emerald-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          <strong>{g.fullName}</strong> accepted the guarantee
                          on {g.confirmedAt}
                        </span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ────── STEP 4: Lenders ────── */}
      {step === 3 && (
        <div>
          <h1 className="text-3xl font-bold text-[#1B2B3A]">
            Choose lenders to send your application to
          </h1>
          <p className="text-gray-500 mt-1">
            Select as many as you like — they&apos;ll each respond with an offer
            within their stated time.
          </p>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              <Info className="w-4 h-4 inline mr-1" />
              <strong>How this works:</strong> Each selected lender gets your
              application (name, amount, type, documents, guarantors).
              They&apos;ll review and send you an offer. You compare offers and
              accept just one.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {lenders?.map((lender) => {
              const isSelected = selectedLenders.includes(lender.id);
              return (
                <Card
                  key={lender.id}
                  className={`bg-white transition-colors ${isSelected ? "ring-2 ring-[#2BB5A0]" : ""}`}
                >
                  <CardContent className="p-5 flex items-center gap-5">
                    {/* Logo */}
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-gray-600">
                        {lender.initials}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1B2B3A]">
                          {lender.name}
                        </span>
                        {lender.isFeatured && (
                          <Badge className="bg-[#F5F0E0] text-[#C4A55A] text-[10px] border-0">
                            <Sparkles className="w-3 h-3 mr-1" /> Featured ·
                            Best Rate
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <Star className="w-3 h-3 inline text-amber-400 fill-amber-400" />{" "}
                        {lender.rating} ({lender.reviewCount} reviews) ·
                        Approval in <strong>{lender.approvalTime}</strong>
                      </p>
                      <div className="flex gap-2 mt-2">
                        {lender.features.map((f) => (
                          <Badge
                            key={f}
                            variant="outline"
                            className="text-[10px] text-gray-500 font-normal"
                          >
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Rate */}
                    <div className="text-right mr-4">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                        From
                      </p>
                      <p className="text-2xl font-bold text-[#1B2B3A]">
                        {lender.minRate}%
                      </p>
                      <p className="text-xs text-gray-400">
                        ~{formatCurrency(lender.estimatedMonthly)} / mo
                      </p>
                    </div>

                    {/* Select button */}
                    <button
                      onClick={() => toggleLender(lender.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors shrink-0
                        ${
                          isSelected
                            ? "bg-[#E8F8F5] text-[#2BB5A0] border-[#2BB5A0]"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      {isSelected ? (
                        <span className="flex items-center gap-1.5">
                          <Check className="w-4 h-4" /> Selected
                        </span>
                      ) : (
                        "+ Select"
                      )}
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ────── STEP 5: Review ────── */}
      {step === 4 && (
        <div>
          <h1 className="text-3xl font-bold text-[#1B2B3A]">
            Review & submit your application
          </h1>
          <p className="text-gray-500 mt-1">
            Check everything carefully — once submitted, changes require
            cancelling and starting over.
          </p>

          <div className="mt-6 space-y-6">
            {/* Loan Details */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Loan Details
                  </p>
                  <button
                    onClick={() => setStep(0)}
                    className="text-sm text-[#2BB5A0] font-medium hover:underline"
                  >
                    ✏️ Edit
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Amount</p>
                    <p className="text-lg font-bold text-[#1B2B3A]">
                      {formatCurrency(amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Duration</p>
                    <p className="text-lg font-bold text-[#1B2B3A]">
                      {duration} months
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Type</p>
                    <p className="text-lg font-bold text-[#1B2B3A]">
                      {loanType === "business" ? "Business" : "Personal"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Purpose</p>
                    <p className="text-lg font-bold text-[#1B2B3A]">
                      {purpose}
                    </p>
                  </div>
                </div>
                {description && (
                  <p className="text-sm text-gray-500 italic mt-3">
                    &ldquo;{description}&rdquo;
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card className="bg-gray-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Documents
                  </p>
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-[#2BB5A0] font-medium hover:underline"
                  >
                    ✏️ Edit
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[...DOCUMENT_TYPES.required, ...DOCUMENT_TYPES.recommended]
                    .filter((d) => uploadedDocs[d.key])
                    .map((d) => (
                      <Badge
                        key={d.key}
                        className="bg-[#E8F8F5] text-[#2BB5A0] border-0"
                      >
                        <Check className="w-3 h-3 mr-1" /> {d.label}
                      </Badge>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Guarantors */}
            <Card className="bg-gray-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Guarantors
                  </p>
                  <button
                    onClick={() => setStep(2)}
                    className="text-sm text-[#2BB5A0] font-medium hover:underline"
                  >
                    ✏️ Edit
                  </button>
                </div>
                <div className="flex gap-4">
                  {[guarantor1, guarantor2].map((g, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2BB5A0] flex items-center justify-center text-white text-sm font-semibold">
                        {g.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1B2B3A]">
                          {g.fullName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {g.relationship} · {g.phone.replace("+256", "")}
                        </p>
                      </div>
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 ml-4">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />{" "}
                        Confirmed
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Lenders */}
            <Card className="bg-gray-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Selected Lenders
                  </p>
                  <button
                    onClick={() => setStep(3)}
                    className="text-sm text-[#2BB5A0] font-medium hover:underline"
                  >
                    ✏️ Edit
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  <strong>{selectedLenders.length} lenders</strong> will receive
                  your application. Expect offers within 24–72 hours.
                </p>
              </CardContent>
            </Card>

            {/* Digital Agreement */}
            <Card className="bg-white border-l-4 border-l-[#2BB5A0]">
              <CardContent className="p-6">
                <p className="font-semibold text-[#1B2B3A] mb-3">
                  Digital Agreement
                </p>
                <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
                  <li>
                    All information provided is true and accurate to the best of
                    my knowledge
                  </li>
                  <li>
                    I understand Welend will share my application with the
                    selected lenders only
                  </li>
                  <li>I authorize credit bureau checks and KYC verification</li>
                  <li>
                    I agree to the{" "}
                    <Link
                      href="/platform-terms"
                      className="text-[#2BB5A0] hover:underline"
                    >
                      Platform Terms
                    </Link>
                    ,{" "}
                    <Link
                      href="/privacy-policy"
                      className="text-[#2BB5A0] hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    , and{" "}
                    <Link
                      href="/borrower-code-of-conduct"
                      className="text-[#2BB5A0] hover:underline"
                    >
                      Borrower Code of Conduct
                    </Link>
                  </li>
                </ul>
                <div className="flex items-center gap-2 mt-4">
                  <Checkbox
                    checked={agreedToTerms}
                    onCheckedChange={(c) => setAgreedToTerms(!!c)}
                    className="data-[state=checked]:bg-[#2BB5A0] data-[state=checked]:border-[#2BB5A0]"
                  />
                  <Label className="text-sm font-medium">
                    I have read and agree to the above commitments
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        {step > 0 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="text-sm font-medium text-gray-600 inline-flex items-center gap-1 border border-gray-200 rounded-lg px-4 py-2.5 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          {step === 3 && (
            <span className="text-sm text-gray-500">
              <strong>{selectedLenders.length}</strong> lenders selected
            </span>
          )}
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="bg-[#2BB5A0] text-white px-6 py-2.5 rounded-lg font-medium text-sm inline-flex items-center gap-2 hover:bg-[#239E8C] transition-colors"
            >
              Continue to {STEPS[step + 1]} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !agreedToTerms}
              className="bg-[#2BB5A0] text-white px-6 py-2.5 rounded-lg font-medium text-sm inline-flex items-center gap-2 hover:bg-[#239E8C] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}{" "}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {step === 4 && (
        <p className="text-center text-xs text-gray-400">
          By submitting, you authorize Welend to forward your application to the
          selected lenders. No charges will be applied until you accept an
          offer.
        </p>
      )}
    </div>
  );
}
