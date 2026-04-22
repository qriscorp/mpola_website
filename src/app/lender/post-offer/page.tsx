"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LenderPageHeader } from "@/components/lender-top-nav";

const LOAN_TYPES = [
  "Business",
  "Personal",
  "Agricultural",
  "Emergency",
  "Education",
  "Asset Finance",
  "Salary Advance",
];
const DOCUMENTS = [
  "National ID",
  "Bank Statement (3mo)",
  "Payslip / Business Proof",
  "Land Title",
  "URA TIN",
];
const DURATIONS = [
  "1 month",
  "2 months",
  "3 months",
  "6 months",
  "12 months",
  "18 months",
  "24 months",
];

export default function PostOfferPage() {
  const router = useRouter();
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
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);

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

  async function handlePost(draft: boolean) {
    draft ? setSaving(true) : setPosting(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success(
      draft ? "Offer saved as draft." : "Offer posted successfully!",
    );
    router.push("/lender/offers");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <LenderPageHeader title="Post an Offer" />

      <Card className="bg-white dark:bg-gray-900">
        <CardContent className="p-6 sm:p-8 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-[#1B2B3A] dark:text-white">
              Post a New Lending Offer
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Set your terms once. Borrowers apply to you — you review and
              approve who gets funded.
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
                  defaultValue="50000000"
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
                  placeholder="1000000"
                  defaultValue="1000000"
                />
              </div>
            </div>
          </div>

          {/* Rate + Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Interest Rate (%/Month)
              </Label>
              <Input placeholder="5" defaultValue="5" />
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
              <Input type="date" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Max Concurrent Loans
              </Label>
              <Input placeholder="10" defaultValue="10" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => handlePost(true)}
              disabled={saving}
              className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Draft"}
            </button>
            <button
              onClick={() => handlePost(false)}
              disabled={posting}
              className="px-5 py-2 rounded-lg bg-[#C4A55A] text-white text-sm font-semibold hover:bg-[#b3944a] transition-colors disabled:opacity-50"
            >
              {posting ? "Posting…" : "Post Offer"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
