"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApplicationDetail, useMakeOffer } from "@/hooks/use-lender";
import { formatCurrency } from "@/lib/format";
import { CardSkeleton } from "@/components/skeletons";

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: application, isLoading } = useApplicationDetail(id);
  const { mutate: makeOffer, isPending } = useMakeOffer();

  const [showOfferForm, setShowOfferForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("15");
  const [duration, setDuration] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton count={2} />
      </div>
    );
  }
  if (!application) {
    return (
      <div className="space-y-6">
        <Link
          href="/lender/marketplace"
          className="text-sm text-muted-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>
        <p className="text-sm text-gray-500">Application not found.</p>
      </div>
    );
  }

  const verified = application.borrower?.kyc_status === "verified";

  const numAmount = Number(amount) || 0;
  const numRate = Number(interestRate) || 0;
  const numDuration = Number(duration) || 0;
  const totalInterest = numAmount * (numRate / 100) * (numDuration / 12);
  const totalRepayable = numAmount + totalInterest;
  const monthlyPayment = numDuration > 0 ? totalRepayable / numDuration : 0;

  const handleSubmitOffer = () => {
    makeOffer(
      {
        application_id: application.id,
        amount: numAmount,
        interest_rate: numRate,
        duration: numDuration,
      },
      { onSuccess: () => setShowOfferForm(false) },
    );
  };

  return (
    <div className="space-y-6">
      <Link
        href="/lender/marketplace"
        className="text-sm text-muted-foreground hover:text-[#1B2B3A] dark:hover:text-white inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Marketplace
      </Link>

      {/* Header Card */}
      <Card className="bg-white dark:bg-gray-900">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-[#C4A55A] text-white text-xl font-bold">
                  {initials(application.borrower?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
                  {application.borrower?.full_name ?? "Borrower"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Credit score: {application.borrower?.credit_score ?? "—"}
                </p>
                {verified && (
                  <Badge className="bg-[#F5F0E0] text-[#C4A55A] dark:bg-[#C4A55A]/10 dark:text-[#C4A55A] mt-1 text-xs gap-1">
                    KYC Verified
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-center lg:text-right">
              <p className="text-[10px] font-semibold text-[#C4A55A] uppercase tracking-wider">
                Requesting
              </p>
              <p className="text-3xl font-bold text-[#1B2B3A] dark:text-white">
                {formatCurrency(application.amount)}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {application.duration} months &middot; {application.loan_type}{" "}
                Loan
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {application.status === "pending" ? (
                <Button
                  onClick={() => setShowOfferForm(true)}
                  className="bg-[#C4A55A] hover:bg-[#b3944a] text-white"
                >
                  Make an Offer
                </Button>
              ) : (
                <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 capitalize">
                  {application.status}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Make offer form */}
      {showOfferForm && (
        <Card className="bg-white dark:bg-gray-900 border-[#C4A55A]">
          <CardHeader>
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Make an Offer
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Amount (UGX)
                </Label>
                <Input
                  type="number"
                  placeholder={String(application.amount)}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Interest Rate (% p.a.)
                </Label>
                <Input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Duration (months)
                </Label>
                <Input
                  type="number"
                  placeholder={String(application.duration)}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>

            {numAmount > 0 && numDuration > 0 && (
              <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Monthly payment:{" "}
                  <strong className="text-[#1B2B3A] dark:text-white">
                    {formatCurrency(Math.round(monthlyPayment))}
                  </strong>
                </span>
                <span>
                  Total repayable:{" "}
                  <strong className="text-[#1B2B3A] dark:text-white">
                    {formatCurrency(Math.round(totalRepayable))}
                  </strong>
                </span>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowOfferForm(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitOffer}
                disabled={isPending || !numAmount || !numDuration}
                className="bg-[#C4A55A] hover:bg-[#b3944a] text-white"
              >
                {isPending ? "Sending…" : "Send Offer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="guarantors">
            Guarantors ({application.guarantors?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card className="bg-white dark:bg-gray-900">
            <CardHeader>
              <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                Loan Purpose
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {application.purpose
                  ? `"${application.purpose}"`
                  : "No purpose provided."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guarantors" className="mt-6">
          <Card className="bg-white dark:bg-gray-900">
            <CardContent className="p-6 space-y-4">
              {application.guarantors && application.guarantors.length > 0 ? (
                application.guarantors.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between py-2 border-b last:border-0 dark:border-gray-800"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                        {g.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {g.relationship_type ?? "—"} &middot; {g.phone}
                      </p>
                    </div>
                    <Badge className="bg-[#F5F0E0] text-[#C4A55A] dark:bg-[#C4A55A]/10 dark:text-[#C4A55A] text-xs capitalize">
                      {g.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No guarantors added.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
