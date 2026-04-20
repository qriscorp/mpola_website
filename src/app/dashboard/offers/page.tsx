"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Star, Sparkles, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOffers } from "@/hooks/use-offers";
import { formatCurrency, formatRate } from "@/lib/format";

export default function OffersPage() {
  const { data: offers, isLoading } = useOffers();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#1B2B3A]">
          You&apos;ve received {offers?.length ?? 0} offers
        </h1>
        <p className="text-gray-500 mt-1">
          Application LF-2026-00847 · UGX 8,000,000 · 18 months · Business
        </p>
      </div>

      {/* Expiry banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700">
          <strong>Offers expire in 6 days, 14 hours.</strong> Review carefully —
          once you accept one, the remaining offers are automatically declined.
        </p>
      </div>

      {/* Offer Cards */}
      <div className="space-y-4">
        {offers?.map((offer) => (
          <Card
            key={offer.id}
            className={`bg-white ${offer.isBestRate ? "ring-1 ring-[#C4A55A]/40" : ""}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-5">
                {/* Lender logo */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white ${
                    offer.isBestRate ? "bg-[#2BB5A0]" : "bg-gray-500"
                  }`}
                >
                  {offer.lenderInitials}
                </div>

                {/* Lender info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg text-[#1B2B3A]">
                      {offer.lenderName}
                    </span>
                    {offer.isBestRate && (
                      <Badge className="bg-[#F5F0E0] text-[#C4A55A] text-[10px] border-0">
                        <Sparkles className="w-3 h-3 mr-1" /> Best Rate
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <Star className="w-3 h-3 inline text-amber-400 fill-amber-400" />{" "}
                    {offer.rating} · {offer.reviewCount} reviews · Offer sent{" "}
                    {offer.offerSentAt} · Approval in {offer.approvalTime}
                  </p>
                </div>

                {/* Data columns */}
                <div className="text-center px-4">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    Interest Rate
                  </p>
                  <p className="text-2xl font-bold text-[#1B2B3A] mt-1">
                    {formatRate(offer.interestRate)}
                  </p>
                </div>

                <div className="text-center px-4">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    Monthly Payment
                  </p>
                  <p className="text-2xl font-bold text-[#1B2B3A] mt-1">
                    <span className="text-xs font-normal text-gray-400">
                      UGX{" "}
                    </span>
                    {offer.monthlyPayment.toLocaleString()}
                  </p>
                </div>

                <div className="text-center px-4">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    Total Repayable
                  </p>
                  <p className="text-2xl font-bold text-[#1B2B3A] mt-1">
                    <span className="text-xs font-normal text-gray-400">
                      UGX{" "}
                    </span>
                    {offer.totalRepayable.toLocaleString()}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 shrink-0">
                  <Button className="bg-[#2BB5A0] text-white hover:bg-[#239E8C] text-sm">
                    Accept This Offer
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-sm font-medium text-[#1B2B3A]"
                  >
                    View Full Terms
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-gray-400">
        Not quite right?{" "}
        <Link href="#" className="text-[#2BB5A0] hover:underline font-medium">
          Request revised offers from these lenders
        </Link>
      </p>
    </div>
  );
}
