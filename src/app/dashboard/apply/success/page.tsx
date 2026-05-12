"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const timeline = [
  {
    title: "Application submitted",
    desc: "17 Apr 2026 · 14:32 EAT · Encrypted and sent to 4 lenders",
    status: "done",
  },
  {
    title: "Lenders reviewing your application",
    desc: "You'll typically see first offers within 24 hours. We'll ping you.",
    status: "current",
  },
  {
    title: "Receive offers",
    desc: "Compare rates, monthly payments, and terms side-by-side",
    status: "pending",
  },
  {
    title: "Accept one offer",
    desc: "Review final terms, sign digitally, and confirm",
    status: "pending",
  },
  {
    title: "Funds disbursed",
    desc: "Money lands in your Mpola wallet within 24 hours of acceptance",
    status: "pending",
  },
];

export default function ApplicationSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto text-center py-8">
      <div className="w-16 h-16 rounded-full bg-[#2BB5A0] flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-8 h-8 text-white" />
      </div>

      <h1 className="text-4xl font-bold text-[#1B2B3A]">
        Application submitted!
      </h1>
      <p className="text-gray-500 mt-3">
        Your application is now with 4 lenders. You&apos;ll be notified by SMS
        and email as offers come in.
      </p>

      <div className="inline-flex items-center gap-2 mt-6 border border-gray-200 rounded-lg px-4 py-2">
        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
          Reference
        </span>
        <span className="text-lg font-bold text-[#1B2B3A]">LF-2026-00847</span>
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
