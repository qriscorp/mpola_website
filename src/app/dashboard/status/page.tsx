"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusColor, getStatusLabel, formatCurrency } from "@/lib/format";
import { useApplications } from "@/hooks/use-dashboard";

export default function StatusPage() {
  const { data: applications } = useApplications();

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/dashboard"
        className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-4xl font-bold text-[#1B2B3A]">
          Application Status
        </h1>
        <p className="text-gray-500 mt-1">
          Track the progress of all your loan applications
        </p>
      </div>

      <div className="space-y-4">
        {applications?.map((app) => (
          <Card key={app.id} className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-mono text-gray-400">
                      {app.reference}
                    </span>
                    <Badge
                      className={`${getStatusColor(app.status)} border-0 text-xs`}
                    >
                      {getStatusLabel(app.status)}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold text-[#1B2B3A] mt-2">
                    {formatCurrency(app.amount)}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {app.loanType === "business" ? "Business" : "Personal"} ·{" "}
                    {app.duration} months · {app.purpose}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400">
                    Applied {app.createdAt}
                  </p>
                  {app.status === "reviewing_offers" && (
                    <Link href="/dashboard/offers">
                      <Button
                        size="sm"
                        className="mt-2 bg-[#2BB5A0] text-white hover:bg-[#239E8C] text-xs"
                      >
                        View {app.offersCount} Offers
                      </Button>
                    </Link>
                  )}
                  {app.status === "active" && (
                    <Link href="/dashboard/repayments">
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 text-xs"
                      >
                        View Schedule
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-6">
                <Step label="Submitted" done={true} />
                <div className="flex-1 h-0.5 bg-emerald-200" />
                <Step
                  label="Under Review"
                  done={app.status !== "draft" && app.status !== "submitted"}
                  current={app.status === "submitted"}
                />
                <div
                  className={`flex-1 h-0.5 ${app.offersCount > 0 ? "bg-emerald-200" : "bg-gray-200"}`}
                />
                <Step
                  label={`${app.offersCount} Offers`}
                  done={app.status === "active" || app.status === "completed"}
                  current={app.status === "reviewing_offers"}
                />
                <div
                  className={`flex-1 h-0.5 ${app.status === "active" || app.status === "completed" ? "bg-emerald-200" : "bg-gray-200"}`}
                />
                <Step
                  label={app.status === "completed" ? "Completed" : "Active"}
                  done={app.status === "completed"}
                  current={app.status === "active"}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Step({
  label,
  done,
  current,
}: {
  label: string;
  done: boolean;
  current?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center ${
          done
            ? "bg-[#2BB5A0] text-white"
            : current
              ? "bg-[#2BB5A0]/20 border-2 border-[#2BB5A0]"
              : "bg-gray-100 border-2 border-gray-200"
        }`}
      >
        {done && <CheckCircle2 className="w-3.5 h-3.5" />}
        {current && <div className="w-2 h-2 bg-[#2BB5A0] rounded-full" />}
      </div>
      <span
        className={`text-[10px] font-medium ${done || current ? "text-[#1B2B3A]" : "text-gray-400"}`}
      >
        {label}
      </span>
    </div>
  );
}
