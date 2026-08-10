import type { BorrowerDocumentType } from "./types";

// Mirrors mpola_api's DOCUMENT_LABEL_MAP (helpers.py) — the frontend only
// needs the borrower_doc half (to know which upload endpoint/type a label
// maps to for the inline "upload it here" control); "National ID" always
// routes to the Profile page's KYC section instead.
export const BORROWER_DOC_LABEL_MAP: Record<string, BorrowerDocumentType> = {
  "Bank Statement (3mo)": "bank_statement",
  "Payslip / Business Proof": "business_proof",
  "Land Title": "land_title",
  "URA TIN": "ura_tin",
};
