"use client";

import { useRef } from "react";
import { CheckCircle2, Clock, Upload, Loader2, XCircle, Lock } from "lucide-react";
import { useMyKycDocuments, useUploadKycDocument } from "@/hooks/use-dashboard";
import type { KYCDocumentType } from "@/lib/types";
import { toast } from "sonner";

const ACCENT = {
  teal: { text: "text-[#2BB5A0]", bg: "bg-[#E8F8F5] dark:bg-[#2BB5A0]/10", ring: "focus:ring-[#2BB5A0]" },
  gold: { text: "text-[#C4A55A]", bg: "bg-[#F5F0E0] dark:bg-[#C4A55A]/10", ring: "focus:ring-[#C4A55A]" },
};

const SLOTS: { type: KYCDocumentType; label: string; hint: string }[] = [
  { type: "national_id", label: "National ID", hint: "National ID or Passport required" },
  { type: "passport", label: "Passport", hint: "National ID or Passport required" },
  { type: "profile_photo", label: "Profile Photo / Selfie", hint: "Required" },
  { type: "proof_of_address", label: "Proof of Address", hint: "Optional — e.g. utility bill" },
];

function DocumentSlot({
  type,
  label,
  hint,
  accent,
}: {
  type: KYCDocumentType;
  label: string;
  hint: string;
  accent: "teal" | "gold";
}) {
  const { data: documents } = useMyKycDocuments();
  const upload = useUploadKycDocument();
  const inputRef = useRef<HTMLInputElement>(null);
  const colors = ACCENT[accent];

  const existing = documents?.find((d) => d.document_type === type);
  const rejected = !!existing && !existing.verified && !!existing.rejection_reason;
  // Locked per-document — from the moment THIS document is individually
  // verified, independent of the other slots or the account's overall
  // kyc_status (see locked_until in mpola_api's _kyc_doc_response).
  const locked = !!existing?.locked_until;
  const lockedUntil = existing?.locked_until ?? null;

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
        {existing && (
          <p className="text-xs mt-1 truncate text-gray-400">{existing.file_name}</p>
        )}
        {rejected && (
          <p className="text-xs mt-1 text-red-600 dark:text-red-400">
            Rejected: {existing!.rejection_reason}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {upload.isPending ? (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Uploading…
          </span>
        ) : (
          existing &&
          (existing.verified ? (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified
            </span>
          ) : rejected ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <XCircle className="h-3.5 w-3.5" />
              Rejected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
              <Clock className="h-3.5 w-3.5" />
              Pending review
            </span>
          ))
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload.mutate({ documentType: type, file });
            e.target.value = "";
          }}
        />
        <button
          onClick={() => {
            if (locked) {
              toast.error(
                lockedUntil
                  ? `This document is verified — locked until ${new Date(lockedUntil).toLocaleDateString()}. Contact support if you need to update it sooner.`
                  : "This document is verified and locked. Contact support if you need to update it.",
              );
              return;
            }
            inputRef.current?.click();
          }}
          disabled={upload.isPending}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-50 ${
            locked
              ? "border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
              : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-current hover:text-current"
          }`}
        >
          {upload.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : locked ? (
            <Lock className="h-3.5 w-3.5" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {upload.isPending ? "Uploading…" : locked ? "Locked" : existing ? "Replace" : "Upload"}
        </button>
      </div>
    </div>
  );
}

/** Account-level KYC document upload — shared by the borrower and lender
 * profile pages. Uploading doesn't change kyc_status by itself; an admin
 * still has to review and approve/reject it. Each document is locked
 * against re-upload individually, from the moment THAT document is
 * verified, for KYC_REVERIFICATION_LOCK_DAYS — independent of the other
 * slots or whether the account's overall kyc_status has reached "verified"
 * yet. The backend enforces this regardless of what the button shows here. */
export function KYCUploadSection({ accent }: { accent: "teal" | "gold" }) {
  return (
    <div>
      {SLOTS.map((slot) => (
        <DocumentSlot key={slot.type} {...slot} accent={accent} />
      ))}
    </div>
  );
}
