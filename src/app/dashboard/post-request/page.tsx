"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BorrowerPageHeader } from "@/components/top-nav";
import { useSubmitApplication } from "@/hooks/use-application";
import { formatCurrency } from "@/lib/format";

const loanTypes = [
  "Business",
  "Personal",
  "Agricultural",
  "Emergency",
  "Education",
];
const durations = [
  "1 month",
  "2 months",
  "3 months",
  "4 months",
  "6 months",
  "12 months",
];

export default function PostRequestPage() {
  const [selectedType, setSelectedType] = useState("Business");
  const [amount, setAmount] = useState("8000000");
  const [duration, setDuration] = useState(durations[2]);
  const [description, setDescription] = useState("");
  const [maxRate, setMaxRate] = useState("2");
  const [validUntil, setValidUntil] = useState("");

  const submitApplication = useSubmitApplication();
  const [posted, setPosted] = useState<{
    referenceNumber: string;
    amount: number;
  } | null>(null);

  function handlePost() {
    const months = parseInt(duration, 10) || 3;
    const purposeParts = [description.trim()].filter(Boolean);
    if (maxRate) purposeParts.push(`Max acceptable rate: ${maxRate}%/month`);
    if (validUntil) purposeParts.push(`Request valid until: ${validUntil}`);

    submitApplication.mutate(
      {
        amount: Number(amount),
        duration: months,
        loan_type: selectedType.toLowerCase(),
        purpose: purposeParts.join(". ") || undefined,
      },
      {
        onSuccess: (res) => {
          setPosted({
            referenceNumber: res.application.reference_number,
            amount: res.application.amount,
          });
        },
      },
    );
  }

  if (posted) {
    return (
      <div className="space-y-6">
        <BorrowerPageHeader title="Post a Request" />
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-2xl p-10 text-center shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-[#2BB5A0]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1B2B3A] dark:text-white mb-2">
            Request Posted!
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Visible to all licensed lenders. You&apos;ll be notified when offers
            come in.
          </p>
          <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-5 text-left space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Request ID</span>
              <span className="font-semibold text-[#1B2B3A] dark:text-white">
                #{posted.referenceNumber}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount</span>
              <span className="font-semibold text-[#1B2B3A] dark:text-white">
                {formatCurrency(posted.amount)}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/my-requests"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors text-center"
            >
              View My Requests
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors text-center"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Post a Borrowing Request" />

      <div className="max-w-2xl bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-[#1B2B3A] dark:text-white mb-1">
          Post a Borrowing Request
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Describe what you need. Licensed lenders will see your request and
          send you offers to choose from.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Amount */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Amount Needed
            </label>
            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#2BB5A0] focus-within:border-[#2BB5A0]">
              <span className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-500 text-sm font-medium border-r border-gray-300 dark:border-gray-700">
                UGX
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 px-3 py-2.5 text-sm bg-white dark:bg-gray-900 text-[#1B2B3A] dark:text-white outline-none"
              />
            </div>
          </div>
          {/* Duration */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Duration Needed
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-900 text-[#1B2B3A] dark:text-white outline-none focus:ring-2 focus:ring-[#2BB5A0] focus:border-[#2BB5A0]"
            >
              {durations.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loan Type */}
        <div className="mt-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Loan Purpose / Type
          </label>
          <div className="flex flex-wrap gap-2">
            {loanTypes.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  selectedType === t
                    ? "bg-[#2BB5A0] text-white border-[#2BB5A0]"
                    : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-[#2BB5A0] hover:text-[#2BB5A0]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mt-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your business, what the loan is for, and your repayment plan..."
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-900 text-[#1B2B3A] dark:text-white outline-none focus:ring-2 focus:ring-[#2BB5A0] focus:border-[#2BB5A0] resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
          {/* Max Rate */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Max Interest Rate (%/month)
            </label>
            <input
              type="number"
              value={maxRate}
              onChange={(e) => setMaxRate(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-900 text-[#1B2B3A] dark:text-white outline-none focus:ring-2 focus:ring-[#2BB5A0] focus:border-[#2BB5A0]"
            />
          </div>
          {/* Valid Until */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Request Valid Until
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-900 text-[#1B2B3A] dark:text-white outline-none focus:ring-2 focus:ring-[#2BB5A0] focus:border-[#2BB5A0]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-7">
          <button
            onClick={() => toast.info("Saving drafts isn't available yet")}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:border-gray-400 transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={handlePost}
            disabled={submitApplication.isPending}
            className="px-6 py-2.5 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors disabled:opacity-50"
          >
            {submitApplication.isPending ? "Posting…" : "Post Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
