"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/skeletons";
import { useApplicationDetail } from "@/hooks/use-lender";

type StepStatus = "done" | "current" | "pending";

function buildTimeline(status: string, offersCount: number) {
  const reviewing: StepStatus = status === "pending" ? "current" : "done";
  const gotOffers: StepStatus =
    offersCount > 0 ? "done" : status === "pending" ? "pending" : "done";
  const accepted: StepStatus = ["funded", "completed", "defaulted"].includes(
    status,
  )
    ? "done"
    : offersCount > 0
      ? "current"
      : "pending";
  const disbursed: StepStatus = ["funded", "completed", "defaulted"].includes(
    status,
  )
    ? "done"
    : "pending";

  return [
    {
      title: "Application submitted",
      desc: "Encrypted and made visible to lenders on the marketplace",
      status: "done" as StepStatus,
    },
    {
      title: "Lenders reviewing your application",
      desc: "You'll typically see first offers within 24 hours. We'll notify you.",
      status: reviewing,
    },
    {
      title: "Receive offers",
      desc:
        offersCount > 0
          ? `${offersCount} offer${offersCount > 1 ? "s" : ""} received so far`
          : "Compare rates, monthly payments, and terms side-by-side",
      status: gotOffers,
    },
    {
      title: "Accept one offer",
      desc: "Review final terms and confirm",
      status: accepted,
    },
    {
      title: "Funds disbursed",
      desc: "Money lands in your mobile money account once you accept",
      status: disbursed,
    },
  ];
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const { data: application, isLoading, error } = useApplicationDetail(
    applicationId ?? "",
  );

  if (!applicationId || error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <p className="text-gray-500">
          {error
            ? "This application couldn't be found."
            : "No application selected."}{" "}
          View your submitted requests in{" "}
          <Link href="/dashboard/my-requests" className="text-[#2BB5A0] underline">
            My Requests
          </Link>
          .
        </p>
      </div>
    );
  }

  if (isLoading || !application) {
    return <CardSkeleton count={2} />;
  }

  const offersCount = application.offers?.length ?? 0;
  const timeline = buildTimeline(application.status, offersCount);

  return (
    <div className="max-w-2xl mx-auto text-center py-8">
      <div className="w-16 h-16 rounded-full bg-[#2BB5A0] flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-8 h-8 text-white" />
      </div>

      <h1 className="text-4xl font-bold text-[#1B2B3A]">
        Application submitted!
      </h1>
      <p className="text-gray-500 mt-3">
        {offersCount > 0
          ? `You've received ${offersCount} offer${offersCount > 1 ? "s" : ""} so far.`
          : "Your application is now visible to lenders. You'll be notified as offers come in."}
      </p>

      <div className="inline-flex items-center gap-2 mt-6 border border-gray-200 rounded-lg px-4 py-2">
        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
          Reference
        </span>
        <span className="text-lg font-bold text-[#1B2B3A]">
          {application.reference_number}
        </span>
      </div>

      <Card className="bg-white mt-8 text-left">
        <CardContent className="p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-4">
            What Happens Next
          </p>

          <div className="space-y-0">
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-4">
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0
                      ${item.status === "done" ? "bg-[#2BB5A0]" : item.status === "current" ? "bg-[#2BB5A0]/20 border-2 border-[#2BB5A0]" : "bg-gray-100 border-2 border-gray-200"}`}
                  >
                    {item.status === "done" && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    )}
                    {item.status === "current" && (
                      <div className="w-2 h-2 bg-[#2BB5A0] rounded-full" />
                    )}
                  </div>
                  {i < timeline.length - 1 && (
                    <div
                      className={`w-0.5 flex-1 my-1 ${
                        item.status === "done" ? "bg-[#2BB5A0]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>

                <div className="pb-6">
                  <p className="font-semibold text-sm text-[#1B2B3A]">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-4 mt-8">
        <Link href="/dashboard/offers">
          <Button className="bg-[#2BB5A0] text-white hover:bg-[#239E8C] px-6">
            View My Offers
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" className="px-6">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function ApplicationSuccessPage() {
  return (
    <Suspense fallback={<CardSkeleton count={2} />}>
      <SuccessContent />
    </Suspense>
  );
}
