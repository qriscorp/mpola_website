"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LenderPageHeader } from "@/components/lender-top-nav";
import {
  useCreateOfferTemplate,
  useUpdateOfferTemplate,
  useOfferTemplates,
} from "@/hooks/use-lender";
import { DOCUMENT_LABEL_OPTIONS } from "@/lib/document-labels";

const LOAN_TYPES = [
  "Business",
  "Personal",
  "Agricultural",
  "Emergency",
  "Education",
  "Asset Finance",
  "Salary Advance",
];
const DOCUMENTS = DOCUMENT_LABEL_OPTIONS;
// Mirrors the borrower apply wizard's DURATIONS exactly (dashboard/apply/page.tsx) —
// borrowers can only ever pick 1-12 months, so a lender's max_duration should
// be pickable at the same granularity, not a curated subset up to 24.
const DURATIONS = Array.from({ length: 12 }, (_, i) => `${i + 1} month${i === 0 ? "" : "s"}`);

export default function PostOfferPage() {
  return (
    <Suspense fallback={null}>
      <PostOfferContent />
    </Suspense>
  );
}

function PostOfferContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { data: templates } = useOfferTemplates();
  const editingTemplate = editId ? templates?.find((t) => t.id === editId) : undefined;

  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "Business",
    "Personal",
    "Emergency",
  ]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([
    "National ID",
    "Bank Statement (3mo)",
    "Payslip / Business Proof",
  ]);
  const [duration, setDuration] = useState("6 months");
  const [maxAmount, setMaxAmount] = useState("50000000");
  const [minAmount, setMinAmount] = useState("1000");
  const [rate, setRate] = useState("2");
  const [description, setDescription] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [maxConcurrent, setMaxConcurrent] = useState("10");
  const [prefilled, setPrefilled] = useState(false);

  const createTemplate = useCreateOfferTemplate();
  const updateTemplate = useUpdateOfferTemplate();
  // Based on URL intent, not on whether the template data has loaded yet —
  // otherwise the page briefly renders as "create" before flipping to "edit"
  // once the templates list finishes fetching.
  const isEditing = !!editId;
  const editDataLoading = isEditing && !editingTemplate;

  useEffect(() => {
    if (!editingTemplate || prefilled) return;
    setMaxAmount(String(editingTemplate.max_amount));
    setMinAmount(String(editingTemplate.min_amount));
    setRate(String(editingTemplate.interest_rate));
    setDuration(
      editingTemplate.max_duration === 1
        ? "1 month"
        : `${editingTemplate.max_duration} months`,
    );
    setSelectedTypes(
      LOAN_TYPES.filter((t) =>
        editingTemplate.accepted_loan_types.includes(t.toLowerCase()),
      ),
    );
    setSelectedDocs(
      DOCUMENTS.filter((d) => editingTemplate.required_documents.includes(d)),
    );
    setDescription(editingTemplate.description ?? "");
    setValidUntil(
      editingTemplate.valid_until ? editingTemplate.valid_until.slice(0, 10) : "",
    );
    setMaxConcurrent(
      editingTemplate.max_concurrent_loans != null
        ? String(editingTemplate.max_concurrent_loans)
        : "",
    );
    setPrefilled(true);
  }, [editingTemplate, prefilled]);

  function toggle(arr: string[], setArr: (v: string[]) => void, val: string) {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  function chipBtn(label: string, active: boolean, onClick: () => void) {
    return (
      <button
        key={label}
        type="button"
        onClick={onClick}
        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
          active
            ? "bg-[#C4A55A] border-[#C4A55A] text-white"
            : "bg-white border-gray-300 text-gray-600 hover:border-[#C4A55A]"
        }`}
      >
        {label}
      </button>
    );
  }

  const amountRangeInvalid =
    minAmount !== "" && maxAmount !== "" && Number(minAmount) >= Number(maxAmount);
  const rateInvalid = rate !== "" && (Number(rate) < 0.1 || Number(rate) > 25);

  function handlePost(draft: boolean) {
    if (amountRangeInvalid) {
      toast.error("Min loan amount must be less than max loan amount");
      return;
    }
    if (rate === "" || rateInvalid) {
      toast.error("Interest rate must be between 0.1% and 25%");
      return;
    }

    const monthsMatch = duration.match(/\d+/);
    const fields = {
      max_amount: Number(maxAmount),
      min_amount: Number(minAmount),
      interest_rate: Number(rate),
      max_duration: monthsMatch ? Number(monthsMatch[0]) : 6,
      accepted_loan_types: selectedTypes.map((t) => t.toLowerCase()),
      required_documents: selectedDocs,
      description: description || undefined,
      valid_until: validUntil || undefined,
      max_concurrent_loans: maxConcurrent ? Number(maxConcurrent) : undefined,
    };

    if (isEditing && editingTemplate) {
      updateTemplate.mutate(
        { id: editingTemplate.id, data: fields },
        {
          onSuccess: () => {
            toast.success("Offer updated.");
            router.push("/lender/offers");
          },
        },
      );
      return;
    }

    createTemplate.mutate(
      { ...fields, is_draft: draft },
      {
        onSuccess: () => {
          toast.success(
            draft
              ? "Offer saved as draft."
              : "Offer submitted for review. It'll go live once approved.",
          );
          router.push("/lender/offers");
        },
      },
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <LenderPageHeader title={isEditing ? "Edit Offer" : "Post an Offer"} />

      <Card className="bg-white dark:bg-gray-900">
        <CardContent className="p-6 sm:p-8 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-[#1B2B3A] dark:text-white">
              {isEditing ? "Edit Your Standing Offer" : "Post a New Lending Offer"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEditing
                ? "Update your terms — changes apply once you save."
                : "Set your terms once. Borrowers apply to you — you review and approve who gets funded."}
            </p>
          </div>

          {/* Amount row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Max Loan Amount
              </Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-input bg-gray-50 text-sm text-gray-500 font-medium">
                  UGX
                </span>
                <Input
                  className="rounded-l-none"
                  placeholder="50000000"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Min Loan Amount
              </Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-input bg-gray-50 text-sm text-gray-500 font-medium">
                  UGX
                </span>
                <Input
                  className="rounded-l-none"
                  placeholder="1000"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                />
              </div>
            </div>
          </div>
          {amountRangeInvalid && (
            <p className="-mt-4 text-xs font-medium text-red-500">
              Min loan amount must be less than max loan amount.
            </p>
          )}

          {/* Rate + Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Interest Rate (%/month)
              </Label>
              <Input
                type="number"
                min={0.1}
                max={25}
                step={0.1}
                placeholder="2"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
              {rateInvalid && (
                <p className="text-xs text-red-500">Rate must be between 0.1% and 25%</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Maximum Duration
              </Label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Accepted loan types */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Accepted Loan Types
            </Label>
            <div className="flex flex-wrap gap-2">
              {LOAN_TYPES.map((t) =>
                chipBtn(t, selectedTypes.includes(t), () =>
                  toggle(selectedTypes, setSelectedTypes, t),
                ),
              )}
            </div>
          </div>

          {/* Required documents */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Required Documents
            </Label>
            <div className="flex flex-wrap gap-2">
              {DOCUMENTS.map((d) =>
                chipBtn(d, selectedDocs.includes(d), () =>
                  toggle(selectedDocs, setSelectedDocs, d),
                ),
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Offer Description (Optional)
            </Label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your preferences, sectors, or special conditions..."
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          {/* Valid Until + Max Concurrent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Valid Until
              </Label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Max Concurrent Loans
              </Label>
              <Input
                placeholder="10"
                value={maxConcurrent}
                onChange={(e) => setMaxConcurrent(e.target.value)}
              />
            </div>
          </div>

          {!isEditing && (
            <p className="text-xs text-gray-400">
              Submitted offers are reviewed before going live on the
              marketplace.
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            {isEditing ? (
              <button
                onClick={() => handlePost(false)}
                disabled={updateTemplate.isPending || editDataLoading || amountRangeInvalid || rateInvalid}
                className="px-5 py-2 rounded-lg bg-[#C4A55A] text-white text-sm font-semibold hover:bg-[#b3944a] transition-colors disabled:opacity-50"
              >
                {editDataLoading
                  ? "Loading…"
                  : updateTemplate.isPending
                    ? "Saving…"
                    : "Save Changes"}
              </button>
            ) : (
              <>
                <button
                  onClick={() => handlePost(true)}
                  disabled={createTemplate.isPending || amountRangeInvalid || rateInvalid}
                  className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50"
                >
                  {createTemplate.isPending ? "Saving…" : "Save Draft"}
                </button>
                <button
                  onClick={() => handlePost(false)}
                  disabled={createTemplate.isPending || amountRangeInvalid || rateInvalid}
                  className="px-5 py-2 rounded-lg bg-[#C4A55A] text-white text-sm font-semibold hover:bg-[#b3944a] transition-colors disabled:opacity-50"
                >
                  {createTemplate.isPending ? "Posting…" : "Post Offer"}
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
