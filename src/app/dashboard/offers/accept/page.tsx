"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Shield,
  Check,
  ArrowLeft,
  Download,
  PenTool,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

const TERMS = [
  "I have read and understood the full loan agreement terms.",
  "I agree to make all scheduled repayments on time.",
  "I understand that late payments may incur penalty fees.",
  "I authorise the lender to disburse funds to my Mpola wallet.",
  "I confirm that all information provided is accurate and truthful.",
];

export default function AcceptOfferPage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState<boolean[]>(
    Array(TERMS.length).fill(false),
  );
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(false);

  const allAccepted = accepted.every(Boolean);

  const handleSign = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    setSigned(true);
    toast.success("Loan agreement signed successfully!");
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
                    Kampala Capital Partners
                  </p>
                </div>
                <Badge className="ml-auto bg-[#E8F8F5] text-[#2BB5A0] dark:bg-[#2BB5A0]/10">
                  Best Rate
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Loan Amount</p>
                  <p className="text-lg font-bold text-[#1B2B3A] dark:text-white">
                    {formatCurrency(5000000)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Interest Rate</p>
                  <p className="text-lg font-bold text-[#2BB5A0]">16% APR</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-lg font-bold text-[#1B2B3A] dark:text-white">
                    18 months
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Monthly Payment
                  </p>
                  <p className="text-lg font-bold text-[#C4A55A]">
                    {formatCurrency(350000)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  between Kampala Capital Partners (&quot;Lender&quot;) and
                  Sarah Nakato (&quot;Borrower&quot;) through the Mpola
                  platform.
                </p>
                <h4 className="mb-1 font-semibold text-foreground">
                  1. Loan Terms
                </h4>
                <p className="mb-3">
                  The Lender agrees to provide a loan of UGX 5,000,000 at an
                  annual interest rate of 16%, repayable over 18 monthly
                  instalments of UGX 350,000 each.
                </p>
                <h4 className="mb-1 font-semibold text-foreground">
                  2. Repayment Schedule
                </h4>
                <p className="mb-3">
                  Payments are due on the 1st of each month. Late payments
                  beyond 7 days incur a 2% penalty on the overdue amount.
                </p>
                <h4 className="mb-1 font-semibold text-foreground">
                  3. Disbursement
                </h4>
                <p className="mb-3">
                  Funds will be disbursed to the Borrower&apos;s Mpola wallet
                  within 24 hours of agreement execution.
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

              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download Full Agreement (PDF)
              </Button>

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
                      disabled={signed}
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
              {signed ? (
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
                    Sarah Nakato
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

              {!signed && (
                <Button
                  className="w-full bg-[#2BB5A0] hover:bg-[#239E8C] text-white"
                  disabled={!allAccepted || loading}
                  onClick={handleSign}
                >
                  {loading ? (
                    "Signing..."
                  ) : (
                    <>
                      <PenTool className="mr-2 h-4 w-4" />
                      Sign Agreement
                    </>
                  )}
                </Button>
              )}

              {signed && (
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
