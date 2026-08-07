"use client";

import { useRef } from "react";
import { CheckCircle2, Clock, Upload } from "lucide-react";
import { useMyKycDocuments, useUploadKycDocument } from "@/hooks/use-dashboard";
import type { KYCDocumentType } from "@/lib/types";

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

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
        {existing && (
          <p className="text-xs mt-1 truncate text-gray-400">{existing.file_name}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {existing &&
          (existing.verified ? (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
              <Clock className="h-3.5 w-3.5" />
              Pending review
            </span>
          ))}
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
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-current hover:text-current transition-colors disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          {existing ? "Replace" : "Upload"}
        </button>
      </div>
    </div>
  );
}

/** Account-level KYC document upload — shared by the borrower and lender
 * profile pages. Uploading doesn't change kyc_status by itself; an admin
 * still has to review and approve/reject it. */
export function KYCUploadSection({ accent }: { accent: "teal" | "gold" }) {
  return (
    <div>
      {SLOTS.map((slot) => (
        <DocumentSlot key={slot.type} {...slot} accent={accent} />
      ))}
    </div>
  );
}
