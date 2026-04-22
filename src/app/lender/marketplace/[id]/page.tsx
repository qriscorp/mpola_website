"use client";

import { use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, ShieldCheck, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useBorrowerProfile, useMakeOffer } from "@/hooks/use-lender";
import { formatCurrency } from "@/lib/format";

export default function BorrowerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: profile } = useBorrowerProfile(id);
  const { mutate: makeOffer, isPending } = useMakeOffer();

  if (!profile) return null;

  const creditScorePercent = (profile.creditScore / 850) * 100;

  return (
    <div className="space-y-6">
      {/* Back */}
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
                  {profile.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
                  {profile.name}
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {profile.location} - Member
                  since {profile.memberSince}
                </p>
                {profile.kycVerified && (
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
                <span className="text-sm font-normal text-muted-foreground">
                  UGX{" "}
                </span>
                {profile.requestingAmount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {profile.duration} months - {profile.loanType} Loan
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => makeOffer({ borrowerId: id, data: {} })}
                disabled={isPending}
                className="bg-[#C4A55A] hover:bg-[#b3944a] text-white"
              >
                {isPending ? "Sending..." : "Make an Offer"}
              </Button>
              <Button variant="outline" className="gap-2">
                <Bookmark className="h-4 w-4" /> Save for Later
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents (6)</TabsTrigger>
          <TabsTrigger value="guarantors">Guarantors (2)</TabsTrigger>
          <TabsTrigger value="history">Loan History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Loan Purpose */}
              <Card className="bg-white dark:bg-gray-900">
                <CardHeader>
                  <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                    Loan Purpose
                  </h2>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    &ldquo;{profile.purpose}&rdquo;
                  </p>
                </CardContent>
              </Card>

              {/* Income & Affordability */}
              <Card className="bg-white dark:bg-gray-900">
                <CardHeader>
                  <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                    Income & Affordability
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Monthly Income
                      </p>
                      <p className="text-xl font-bold text-[#1B2B3A] dark:text-white">
                        {formatCurrency(profile.monthlyIncome)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Existing Obligations
                      </p>
                      <p className="text-xl font-bold text-[#1B2B3A] dark:text-white">
                        {formatCurrency(profile.existingObligations)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Disposable Income
                      </p>
                      <p className="text-xl font-bold text-[#C4A55A]">
                        {formatCurrency(profile.disposableIncome)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">DTI Ratio</p>
                      <p className="text-xl font-bold text-[#1B2B3A] dark:text-white">
                        {profile.dtiRatio}%{" "}
                        <Badge className="bg-[#F5F0E0] text-[#C4A55A] dark:bg-[#C4A55A]/10 dark:text-[#C4A55A] text-[10px] ml-1">
                          {profile.dtiRating}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Credit Score */}
              <Card className="bg-white dark:bg-gray-900">
                <CardHeader>
                  <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                    Credit Score
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-8 items-start">
                    <div className="relative w-32 h-32">
                      <svg
                        className="w-full h-full -rotate-90"
                        viewBox="0 0 120 120"
                      >
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          fill="none"
                          stroke="currentColor"
                          className="text-gray-200 dark:text-gray-700"
                          strokeWidth="12"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          fill="none"
                          stroke="#C4A55A"
                          strokeWidth="12"
                          strokeDasharray={`${creditScorePercent * 3.27} 327`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-[#1B2B3A] dark:text-white">
                          {profile.creditScore}
                        </span>
                        <span className="text-[10px] font-semibold text-[#C4A55A] uppercase">
                          {profile.creditRating}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Payment history
                        </span>
                        <span className="font-medium text-[#C4A55A]">
                          {profile.paymentHistory}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Credit utilization
                        </span>
                        <span className="font-medium">
                          {profile.creditUtilization}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Credit age
                        </span>
                        <span className="font-medium">{profile.creditAge}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Recent enquiries
                        </span>
                        <span className="font-medium">
                          {profile.recentEnquiries}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Quick Stats + Risk */}
            <div className="space-y-6">
              <Card className="bg-white dark:bg-gray-900">
                <CardHeader>
                  <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                    Quick Stats
                  </h2>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      label: "Applications",
                      value: profile.applications.toString(),
                    },
                    { label: "Loans completed", value: profile.loansCompleted },
                    {
                      label: "Current offers",
                      value: profile.currentOffers.toString(),
                    },
                    { label: "Applied", value: profile.appliedAt },
                    { label: "Response time", value: profile.responseTime },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center justify-between py-1 border-b last:border-0 dark:border-gray-800"
                    >
                      <span className="text-sm text-muted-foreground">
                        {s.label}
                      </span>
                      <span className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                        {s.value}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-[#F5F0E0]/50 dark:bg-[#C4A55A]/10 border-[#E8D9B0] dark:border-[#C4A55A]/30">
                <CardContent className="p-5">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Welend Risk Assessment
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-5 w-5 text-[#C4A55A]" />
                    <span className="font-bold text-[#C4A55A]">
                      {profile.riskLevel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {profile.riskDescription}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card className="bg-white dark:bg-gray-900">
            <CardContent className="p-6">
              <div className="space-y-3">
                {[
                  "National ID (NIN)",
                  "Business Registration",
                  "Bank Statements (6 mo)",
                  "Tax Returns",
                  "Proof of Address",
                  "Photos of Business",
                ].map((doc) => (
                  <div
                    key={doc}
                    className="flex items-center justify-between py-2 border-b last:border-0 dark:border-gray-800"
                  >
                    <span className="text-sm">{doc}</span>
                    <Badge className="bg-[#F5F0E0] text-[#C4A55A] dark:bg-[#C4A55A]/10 dark:text-[#C4A55A] text-xs">
                      Uploaded
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guarantors" className="mt-6">
          <Card className="bg-white dark:bg-gray-900">
            <CardContent className="p-6 space-y-4">
              {[
                { name: "Grace Namuli", rel: "Sibling", status: "Confirmed" },
                {
                  name: "Peter Mbabazi",
                  rel: "Business Partner",
                  status: "Confirmed",
                },
              ].map((g) => (
                <div
                  key={g.name}
                  className="flex items-center justify-between py-2 border-b last:border-0 dark:border-gray-800"
                >
                  <div>
                    <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                      {g.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{g.rel}</p>
                  </div>
                  <Badge className="bg-[#F5F0E0] text-[#C4A55A] dark:bg-[#C4A55A]/10 dark:text-[#C4A55A] text-xs">
                    {g.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="bg-white dark:bg-gray-900">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b dark:border-gray-800">
                  <div>
                    <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                      Personal Loan - UGX 2,500,000
                    </p>
                    <p className="text-xs text-muted-foreground">
                      6 months - Completed on time
                    </p>
                  </div>
                  <Badge className="bg-[#F5F0E0] text-[#C4A55A] dark:bg-[#C4A55A]/10 dark:text-[#C4A55A] text-xs">
                    Completed
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
