"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { useUploadBorrowerDocument, useSubmitCustomDocumentResponse } from "@/hooks/use-dashboard";
import { BORROWER_DOC_LABEL_MAP } from "@/lib/document-labels";
import type { RequiredDocumentStatus } from "@/lib/types";

/** Shows what a specific offer requires and lets the borrower satisfy it
 * inline — "National ID" routes to the account-wide KYC section on
 * Profile, known types upload directly here as a reusable BorrowerDocument,
 * and a lender's custom "Other: ..." requirement accepts either a file or a
 * typed explanation (at least one). Already-satisfied items can still be
 * replaced — documents expire, or the wrong file gets picked. */
export function RequiredDocumentsChecklist({
  items,
  applicationId,
  onChanged,
  readOnly = false,
}: {
  items: RequiredDocumentStatus[];
  /** Required to fulfil a "custom" item — not needed for readOnly/lender views. */
  applicationId?: string;
  onChanged?: () => void;
  /** Lender's disbursement-review view — verification only, no upload
   * controls (this isn't the lender's document to provide). */
  readOnly?: boolean;
}) {
  const upload = useUploadBorrowerDocument();
  const submitCustom = useSubmitCustomDocumentResponse();
  const [uploadingLabel, setUploadingLabel] = useState<string | null>(null);
  const [customDrafts, setCustomDrafts] = useState<Record<string, string>>({});

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

  const handleCustomFile = (label: string, file: File) => {
    if (!applicationId) return;
    setUploadingLabel(label);
    submitCustom.mutate(
      { applicationId, label, file },
      {
        onSuccess: () => {
          setUploadingLabel(null);
          onChanged?.();
        },
        onError: () => setUploadingLabel(null),
      },
    );
  };

  const handleCustomText = (label: string) => {
    if (!applicationId) return;
    const text = customDrafts[label]?.trim();
    if (!text) return;
    submitCustom.mutate(
      { applicationId, label, textResponse: text },
      { onSuccess: () => onChanged?.() },
    );
  };

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isUploading = uploadingLabel === item.label;
        const isCustom = item.source === "custom";
        return (
          <div
            key={item.label}
            className={`rounded-lg border px-3 py-2.5 text-sm transition-colors ${
              isUploading
                ? "border-[#9DDAD1] bg-[#E6F4F2]"
                : item.satisfied
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-amber-200 bg-amber-50"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {isUploading ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#149D8E]" />
                ) : item.satisfied ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <span className="h-4 w-4 shrink-0 rounded-full border-2 border-amber-400" />
                )}
                <span
                  className={`truncate ${isUploading ? "text-[#149D8E]" : item.satisfied ? "text-emerald-700" : "text-amber-700"}`}
                >
                  {item.label}
                  {isUploading && " — uploading…"}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {item.satisfied && item.file_url && (
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-emerald-700 underline"
                  >
                    View
                  </a>
                )}
                {!item.satisfied && readOnly && (
                  <span className="text-xs font-medium text-amber-600">Not provided</span>
                )}
                {!readOnly && item.source === "kyc" && (
                  <Link
                    href="/dashboard/profile"
                    className="text-xs font-semibold text-[#2BB5A0] underline"
                  >
                    {item.satisfied ? "Replace from Profile" : "Upload from Profile"}
                  </Link>
                )}
                {!readOnly && item.source === "borrower_doc" && (
                  <label
                    className={`text-xs font-semibold underline ${
                      isUploading ? "text-[#149D8E] cursor-wait" : "text-[#2BB5A0] cursor-pointer"
                    }`}
                  >
                    {isUploading ? "Uploading…" : item.satisfied ? "Replace" : "Upload"}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      disabled={isUploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFile(item.label, f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
                {!readOnly && isCustom && (
                  <label
                    className={`text-xs font-semibold underline ${
                      isUploading ? "text-[#149D8E] cursor-wait" : "text-[#2BB5A0] cursor-pointer"
                    }`}
                  >
                    {isUploading ? "Uploading…" : item.file_url ? "Replace file" : "Upload file"}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      disabled={isUploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleCustomFile(item.label, f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            {!readOnly && isCustom && (
              <div className="mt-2 space-y-1">
                <textarea
                  rows={2}
                  defaultValue={item.text_response ?? ""}
                  onChange={(e) =>
                    setCustomDrafts((prev) => ({ ...prev, [item.label]: e.target.value }))
                  }
                  onBlur={() => handleCustomText(item.label)}
                  placeholder="Or describe it here instead of uploading a file..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-[#1B2B3A] outline-none focus:ring-2 focus:ring-[#2BB5A0] resize-none"
                />
                <p className="text-[11px] text-gray-400">
                  A file or a written explanation satisfies this — at least one is needed.
                </p>
              </div>
            )}
            {readOnly && isCustom && item.text_response && (
              <p className="mt-1.5 text-xs text-gray-600 italic">&ldquo;{item.text_response}&rdquo;</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
