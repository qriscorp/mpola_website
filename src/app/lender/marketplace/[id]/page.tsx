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
import { useUser } from "@/hooks/use-dashboard";
import { formatCurrency, formatDuration, getApplicationStatusLabel } from "@/lib/format";
import { DOCUMENT_LABEL_OPTIONS } from "@/lib/document-labels";
import { CardSkeleton } from "@/components/skeletons";

// A lender's own standing offer may have already auto-matched this
// application — while it's still pending and inside the 2-day cooldown
// (see AUTO_MATCH_MANUAL_OFFER_COOLDOWN in routers/loans.py), they can't
// also hand-craft a manual offer here. Purely informational/UX gating — the
// backend is the real enforcement.
function autoMatchCooldownHoursLeft(endsAt: string | null | undefined): number | null {
  if (!endsAt) return null;
  const msLeft = new Date(endsAt).getTime() - Date.now();
  return msLeft > 0 ? Math.ceil(msLeft / 3_600_000) : null;
}

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
  const { data: user } = useUser();
  const { mutate: makeOffer, isPending } = useMakeOffer();

  const [showOfferForm, setShowOfferForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("3");
  const [duration, setDuration] = useState("");
  const [requiredDocs, setRequiredDocs] = useState<string[]>([]);
  const [customDocInput, setCustomDocInput] = useState("");
  const customDocs = requiredDocs.filter((d) => !DOCUMENT_LABEL_OPTIONS.includes(d));

  function toggleDoc(label: string) {
    setRequiredDocs((prev) =>
      prev.includes(label) ? prev.filter((d) => d !== label) : [...prev, label],
    );
  }

  function addCustomDoc() {
    const label = customDocInput.trim();
    if (!label || requiredDocs.includes(label)) return;
    setRequiredDocs((prev) => [...prev, label]);
    setCustomDocInput("");
  }

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

  const myPendingAutoOffer = application.offers?.find(
    (o) => o.lender_id === user?.id && o.status === "pending" && o.template_id,
  );
  const cooldownHoursLeft = autoMatchCooldownHoursLeft(myPendingAutoOffer?.auto_match_cooldown_ends_at);

  const isEmergency = application.duration_days != null;
  const numAmount = Number(amount) || 0;
  const numRate = Number(interestRate) || 0;
  const numDuration = Number(duration) || 0;
  const rateInvalid = interestRate !== "" && (numRate < 0.1 || numRate > 25);
  const totalInterest = isEmergency
    ? numAmount * (numRate / 100) * (numDuration / 30)
    : numAmount * (numRate / 100) * numDuration;
  const totalRepayable = numAmount + totalInterest;
  const monthlyPayment = isEmergency
    ? totalRepayable
    : numDuration > 0
      ? totalRepayable / numDuration
      : 0;

  const handleSubmitOffer = () => {
    makeOffer(
      {
        application_id: application.id,
        amount: numAmount,
        interest_rate: numRate,
        duration: isEmergency ? null : numDuration,
        duration_days: isEmergency ? numDuration : null,
        required_documents: requiredDocs,
      },
      { onSuccess: () => { setShowOfferForm(false); setRequiredDocs([]); } },
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
                <Badge
                  className={`mt-1 text-xs gap-1 ${
                    verified
                      ? "bg-[#F5F0E0] text-[#C4A55A] dark:bg-[#C4A55A]/10 dark:text-[#C4A55A]"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {verified ? "Verified" : "Not Verified"}
                </Badge>
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
                {formatDuration(application.duration, application.duration_days)} &middot; {application.loan_type}{" "}
                Loan
              </p>
            </div>

            <div className="flex flex-col gap-2 items-end">
              {application.status === "pending" && cooldownHoursLeft != null ? (
                <div
                  title={`Your standing offer already matched this request — you can make a manual offer in ${cooldownHoursLeft}h if the borrower hasn't responded.`}
                  className="max-w-[220px] rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-700 text-right"
                >
                  Awaiting borrower response — auto-matched, manual offer available in {cooldownHoursLeft}h
                </div>
              ) : application.status === "pending" ? (
                <Button
                  onClick={() => setShowOfferForm(true)}
                  className="bg-[#C4A55A] hover:bg-[#b3944a] text-white"
                >
                  Make an Offer
                </Button>
              ) : (
                <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {getApplicationStatusLabel(application.status, application.loan_status)}
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
                  Interest Rate (%/month)
                </Label>
                <Input
                  type="number"
                  min={0.1}
                  max={25}
                  step={0.1}
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                />
                {rateInvalid && (
                  <p className="text-xs text-red-500">Rate must be between 0.1% and 25%</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {isEmergency ? "Duration (days)" : "Duration (months)"}
                </Label>
                <Input
                  type="number"
                  min={isEmergency ? 1 : undefined}
                  max={isEmergency ? 29 : undefined}
                  placeholder={String(application.duration_days ?? application.duration)}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Documents required to accept (optional)
              </Label>
              <div className="flex flex-wrap gap-2">
                {DOCUMENT_LABEL_OPTIONS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleDoc(label)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      requiredDocs.includes(label)
                        ? "bg-[#C4A55A] border-[#C4A55A] text-white"
                        : "bg-white border-gray-300 text-gray-600 hover:border-[#C4A55A]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
                {customDocs.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setRequiredDocs((prev) => prev.filter((d) => d !== label))}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border bg-[#C4A55A] border-[#C4A55A] text-white"
                  >
                    {label}
                    <span aria-hidden>×</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2 max-w-xs">
                <Input
                  className="h-8 text-xs"
                  placeholder="Other document..."
                  maxLength={255}
                  value={customDocInput}
                  onChange={(e) => setCustomDocInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomDoc();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addCustomDoc}
                  disabled={!customDocInput.trim()}
                  className="shrink-0 px-3 py-1 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:border-gray-400 disabled:opacity-50"
                >
                  + Add
                </button>
              </div>
            </div>

            {numAmount > 0 && numDuration > 0 && (
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-3 space-y-1 text-xs">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{isEmergency ? "Repayment due" : "Monthly payment"}</span>
                  <span className="font-medium text-[#1B2B3A] dark:text-white">
                    {formatCurrency(Math.round(monthlyPayment))}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-[#1B2B3A] dark:text-white pt-1 border-t border-gray-200 dark:border-gray-700">
                  <span>Total repayable</span>
                  <span>{formatCurrency(Math.round(totalRepayable))}</span>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400">
              If the borrower accepts, you&apos;ll need to approve
              disbursement from your Portfolio to release the funds.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setShowOfferForm(false); setRequiredDocs([]); }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitOffer}
                disabled={isPending || !numAmount || !numDuration || !numRate || rateInvalid}
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
                        {g.full_name ?? g.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {g.relationship_type ?? "—"} &middot; @{g.username}
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
