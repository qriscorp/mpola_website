"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Shield, Check, ArrowLeft, PenTool } from "lucide-react";
import { formatCurrency, formatRate } from "@/lib/format";
import { useUser } from "@/hooks/use-dashboard";
import { useApplicationDetail } from "@/hooks/use-lender";
import { useRespondToOffer } from "@/hooks/use-offers";
import { useWallet } from "@/hooks/use-wallet";
import { CardSkeleton } from "@/components/skeletons";
import { RequiredDocumentsChecklist } from "@/components/required-documents-checklist";

const TERMS = [
  "I have read and understood the full loan agreement terms.",
  "I agree to make all scheduled repayments on time.",
  "I understand that late payments may incur penalty fees.",
  "I authorise the lender to disburse funds to my Mpola wallet.",
  "I confirm that all information provided is accurate and truthful.",
];

// Matches mpola_api's REQUIRED_ACCEPTED_GUARANTORS (routers/loans.py).
const REQUIRED_ACCEPTED_GUARANTORS = 2;

function AcceptOfferContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const offerId = searchParams.get("offerId");
  const applicationId = searchParams.get("applicationId") ?? "";

  const { data: user } = useUser();
  const { data: application, isLoading } = useApplicationDetail(applicationId);
  const { data: wallet } = useWallet();
  const { mutate: respond, isPending, isSuccess } = useRespondToOffer();

  const [accepted, setAccepted] = useState<boolean[]>(
    Array(TERMS.length).fill(false),
  );

  const allAccepted = accepted.every(Boolean);
  const offer = application?.offers?.find((o) => o.id === offerId);
  const acceptedGuarantors = (application?.guarantors ?? []).filter(
    (g) => g.status === "accepted",
  ).length;
  const guarantorsReady = acceptedGuarantors >= REQUIRED_ACCEPTED_GUARANTORS;
  const walletReady = wallet?.is_wallet_setup ?? false;
  const requiredDocs = offer?.required_documents_status ?? [];
  const documentsReady = requiredDocs.every((d) => d.satisfied);

  if (!offerId || !applicationId) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-gray-500">Missing offer reference.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton count={2} />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-gray-500">Offer not found.</p>
      </div>
    );
  }

  const handleSign = () => {
    respond({ offerId: offer.id, applicationId, status: "accepted" });
  };

  const handleProceed = () => {
    router.push("/dashboard");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
            Loan Agreement
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and sign your loan agreement
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Agreement Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Offer Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F8F5] dark:bg-[#2BB5A0]/10">
                  <FileText className="h-5 w-5 text-[#2BB5A0]" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                    Loan Offer Summary
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {offer.lender_name ?? "Lender"}
                  </p>
                </div>
                <Badge className="ml-auto bg-[#E8F8F5] text-[#2BB5A0] dark:bg-[#2BB5A0]/10">
                  {offer.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Loan Amount</p>
                  <p className="text-lg font-bold text-[#1B2B3A] dark:text-white">
                    {formatCurrency(offer.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Interest Rate</p>
                  <p className="text-lg font-bold text-[#2BB5A0]">
                    {formatRate(offer.interest_rate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-lg font-bold text-[#1B2B3A] dark:text-white">
                    {offer.duration} months
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Monthly Payment
                  </p>
                  <p className="text-lg font-bold text-[#C4A55A]">
                    {formatCurrency(offer.monthly_payment ?? 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Required */}
          {requiredDocs.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                  Documents This Lender Requires
                </h2>
                <p className="text-sm text-muted-foreground">
                  Provide these before signing — already-uploaded ones (KYC or from a past offer) count automatically.
                </p>
              </CardHeader>
              <CardContent>
                <RequiredDocumentsChecklist items={requiredDocs} />
              </CardContent>
            </Card>
          )}

          {/* Agreement Terms */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                Agreement Terms
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-60 overflow-y-auto rounded-lg border bg-gray-50 p-4 text-sm text-muted-foreground dark:bg-gray-900">
                <h3 className="mb-2 font-semibold text-foreground">
                  LOAN AGREEMENT
                </h3>
                <p className="mb-3">
                  This Loan Agreement (&quot;Agreement&quot;) is entered into
                  between {offer.lender_name ?? "the Lender"} (&quot;Lender&quot;)
                  and {user?.fullName ?? "the Borrower"} (&quot;Borrower&quot;)
                  through the Mpola platform.
                </p>
                <h4 className="mb-1 font-semibold text-foreground">
                  1. Loan Terms
                </h4>
                <p className="mb-3">
                  The Lender agrees to provide a loan of{" "}
                  {formatCurrency(offer.amount)} at an annual interest rate of{" "}
                  {offer.interest_rate}%, repayable over {offer.duration}{" "}
                  monthly instalments of {formatCurrency(offer.monthly_payment ?? 0)}{" "}
                  each.
                </p>
                <h4 className="mb-1 font-semibold text-foreground">
                  2. Repayment Schedule
                </h4>
                <p className="mb-3">
                  Payments are due monthly from the disbursement date. Late
                  payments may incur penalties per Mpola&apos;s platform terms.
                </p>
                <h4 className="mb-1 font-semibold text-foreground">
                  3. Disbursement
                </h4>
                <p className="mb-3">
                  Funds are transferred wallet-to-wallet. Once you accept, the
                  Lender is notified to approve and release the full{" "}
                  {formatCurrency(offer.amount)} — this is typically fast, but
                  not instant. The Lender covers Mpola&apos;s 0.5% platform
                  fee on top of the loan amount — the Borrower receives the
                  exact amount agreed.
                </p>
                <h4 className="mb-1 font-semibold text-foreground">
                  4. Early Repayment
                </h4>
                <p>
                  The Borrower may repay the loan early without penalty.
                  Interest will only be charged on the period the loan was
                  active.
                </p>
              </div>

              <Separator />

              {/* Checkboxes */}
              <div className="space-y-3">
                {TERMS.map((term, i) => (
                  <label
                    key={i}
                    className="flex items-start gap-3 cursor-pointer"
                  >
                    <Checkbox
                      checked={accepted[i]}
                      onCheckedChange={(checked) => {
                        const next = [...accepted];
                        next[i] = !!checked;
                        setAccepted(next);
                      }}
                      disabled={isSuccess}
                    />
                    <span className="text-sm text-muted-foreground leading-tight">
                      {term}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Signature Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-[#2BB5A0]" />
                <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                  Digital Signature
                </h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSuccess ? (
                <div className="rounded-lg border-2 border-[#2BB5A0] bg-[#E8F8F5] p-6 text-center dark:bg-[#2BB5A0]/10">
                  <Check className="mx-auto mb-2 h-10 w-10 text-[#2BB5A0]" />
                  <p className="font-semibold text-[#2BB5A0]">
                    Agreement Signed
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Signed on {new Date().toLocaleDateString()} at{" "}
                    {new Date().toLocaleTimeString()}
                  </p>
                  <div className="mt-4 font-serif text-2xl italic text-[#1B2B3A] dark:text-white">
                    {user?.fullName ?? ""}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
                  <PenTool className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Accept all terms above to sign
                  </p>
                </div>
              )}

              {!isSuccess && !guarantorsReady && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  Needs {REQUIRED_ACCEPTED_GUARANTORS} confirmed guarantors
                  before this can be signed — {acceptedGuarantors} of{" "}
                  {application?.guarantors?.length ?? 0} confirmed so far.
                </p>
              )}

              {!isSuccess && !walletReady && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  Set up your Mpola wallet before signing — that&apos;s where
                  the disbursed funds will land.
                </p>
              )}

              {!isSuccess && !documentsReady && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  Provide the documents this lender requires (above) before signing.
                </p>
              )}

              {!isSuccess && (
                <Button
                  className="w-full bg-[#2BB5A0] hover:bg-[#239E8C] text-white"
                  disabled={!allAccepted || !guarantorsReady || !walletReady || !documentsReady || isPending}
                  onClick={handleSign}
                >
                  {isPending ? (
                    "Signing…"
                  ) : (
                    <>
                      <PenTool className="mr-2 h-4 w-4" />
                      Sign Agreement
                    </>
                  )}
                </Button>
              )}

              {isSuccess && (
                <Button
                  className="w-full bg-[#1B2B3A] hover:bg-[#1B2B3A]/90 text-white"
                  onClick={handleProceed}
                >
                  Go to Dashboard
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card>
            <CardContent className="flex items-start gap-3 py-4">
              <Shield className="h-5 w-5 shrink-0 text-[#2BB5A0]" />
              <div>
                <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                  Secure Agreement
                </p>
                <p className="text-xs text-muted-foreground">
                  This agreement is encrypted and securely stored. Both parties
                  will receive a copy via email for their records.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AcceptOfferPage() {
  return (
    <Suspense fallback={<CardSkeleton count={2} />}>
      <AcceptOfferContent />
    </Suspense>
  );
}
