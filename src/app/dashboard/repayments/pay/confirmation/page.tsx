"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Download,
  ArrowRight,
  Share2,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";

export default function PaymentConfirmationPage() {
  const router = useRouter();

  const receipt = {
    reference: "PAY-2026-04-001847",
    date: new Date().toLocaleDateString("en-UG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    time: new Date().toLocaleTimeString("en-UG", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    amount: 350000,
    method: "MTN Mobile Money",
    phoneUsed: "+256 700 ***456",
    loanRef: "LF-2026-00412",
    lender: "Kampala Capital Partners",
    instalmentNo: "4 of 18",
    remaining: 4550000,
    nextDue: "01 Jun 2026",
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Success Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F8F5] dark:bg-[#2BB5A0]/10">
            <CheckCircle2 className="h-10 w-10 text-[#2BB5A0]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
            Payment Successful!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Your instalment has been processed
          </p>
          <p className="mt-2 text-3xl font-bold text-[#2BB5A0]">
            {formatCurrency(receipt.amount)}
          </p>
        </div>

        {/* Receipt Card */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                Payment Receipt
              </h2>
              <span className="text-xs text-muted-foreground">
                {receipt.reference}
              </span>
            </div>

            <div className="space-y-3">
              <ReceiptRow label="Date" value={receipt.date} />
              <ReceiptRow label="Time" value={receipt.time} />
              <Separator />
              <ReceiptRow
                label="Amount"
                value={formatCurrency(receipt.amount)}
                bold
              />
              <ReceiptRow label="Payment Method" value={receipt.method} />
              <ReceiptRow label="Phone Number" value={receipt.phoneUsed} />
              <Separator />
              <ReceiptRow label="Loan Reference" value={receipt.loanRef} />
              <ReceiptRow label="Lender" value={receipt.lender} />
              <ReceiptRow label="Instalment" value={receipt.instalmentNo} />
              <Separator />
              <ReceiptRow
                label="Remaining Balance"
                value={formatCurrency(receipt.remaining)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Next Payment */}
        <Card className="border-[#C4A55A]/30 bg-[#F5F0E0] dark:bg-[#C4A55A]/10">
          <CardContent className="flex items-center gap-3 py-4">
            <Clock className="h-5 w-5 text-[#C4A55A]" />
            <div>
              <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                Next Payment Due
              </p>
              <p className="text-xs text-muted-foreground">
                {receipt.nextDue} &middot; {formatCurrency(receipt.amount)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" className="flex-1 gap-2">
            <Download className="h-4 w-4" />
            Download Receipt
          </Button>
          <Button variant="outline" className="flex-1 gap-2">
            <Share2 className="h-4 w-4" />
            Share Receipt
          </Button>
        </div>

        <Button
          className="w-full bg-[#1B2B3A] hover:bg-[#1B2B3A]/90 text-white gap-2"
          onClick={() => router.push("/dashboard")}
        >
          Back to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ReceiptRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-sm ${bold ? "font-bold text-[#1B2B3A] dark:text-white" : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}
