"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { useUploadBorrowerDocument } from "@/hooks/use-dashboard";
import { BORROWER_DOC_LABEL_MAP } from "@/lib/document-labels";
import type { RequiredDocumentStatus } from "@/lib/types";

/** Shows what a specific offer requires and lets the borrower satisfy it
 * inline — "National ID" routes to the account-wide KYC section on
 * Profile, everything else uploads directly here as a reusable
 * BorrowerDocument that'll also satisfy any future offer asking for the
 * same thing. */
export function RequiredDocumentsChecklist({
  items,
  onChanged,
  readOnly = false,
}: {
  items: RequiredDocumentStatus[];
  onChanged?: () => void;
  /** Lender's disbursement-review view — verification only, no upload
   * controls (this isn't the lender's document to provide). */
  readOnly?: boolean;
}) {
  const upload = useUploadBorrowerDocument();
  const [uploadingLabel, setUploadingLabel] = useState<string | null>(null);

  if (items.length === 0) return null;

  const handleFile = (label: string, file: File) => {
    const docType = BORROWER_DOC_LABEL_MAP[label];
    if (!docType) return;
    setUploadingLabel(label);
    upload.mutate(
      { documentType: docType, file },
      {
        onSuccess: () => {
          setUploadingLabel(null);
          onChanged?.();
        },
        onError: () => setUploadingLabel(null),
      },
    );
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.label}
          className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm ${
            item.satisfied ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
          }`}
        >
          <div className="flex items-center gap-2">
            {item.satisfied ? (
              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <span className="h-4 w-4 shrink-0 rounded-full border-2 border-amber-400" />
            )}
            <span className={item.satisfied ? "text-emerald-700" : "text-amber-700"}>{item.label}</span>
          </div>
          {item.satisfied && item.file_url && (
            <a
              href={item.file_url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-xs font-semibold text-emerald-700 underline"
            >
              View
            </a>
          )}
          {!item.satisfied && readOnly && (
            <span className="shrink-0 text-xs font-medium text-amber-600">Not provided</span>
          )}
          {!readOnly && !item.satisfied && item.source === "kyc" && (
            <Link href="/dashboard/profile" className="shrink-0 text-xs font-semibold text-[#2BB5A0] underline">
              Upload from Profile
            </Link>
          )}
          {!readOnly && !item.satisfied && item.source === "borrower_doc" && (
            <label className="shrink-0 cursor-pointer text-xs font-semibold text-[#2BB5A0] underline">
              {uploadingLabel === item.label ? "Uploading…" : "Upload"}
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                disabled={uploadingLabel === item.label}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(item.label, f);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
      ))}
    </div>
  );
}
