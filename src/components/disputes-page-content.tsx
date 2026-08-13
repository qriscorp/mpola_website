"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Plus, Send, ChevronRight, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardSkeleton } from "@/components/skeletons";
import { useMyDisputes, useFileDispute, useMyLoansForDispute } from "@/hooks/use-support";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";
import { formatCurrency } from "@/lib/format";

const ACCENT = {
  teal: { text: "text-[#2BB5A0]", solid: "bg-[#2BB5A0] hover:bg-[#239E8C]" },
  gold: { text: "text-[#C4A55A]", solid: "bg-[#C4A55A] hover:bg-[#b3944a]" },
};

const statusColor: Record<string, string> = {
  open: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  investigating: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  resolved: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  rejected: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
};

const categoryLabel: Record<string, string> = {
  payment: "Payment",
  loan_terms: "Loan Terms",
  fraud: "Fraud",
  disbursement: "Disbursement",
  other: "Other",
};

export function DisputesPageContent({
  accent,
  basePath,
}: {
  accent: "teal" | "gold";
  basePath: string;
}) {
  const colors = ACCENT[accent];
  const { data: disputes, isLoading } = useMyDisputes();
  const { data: loans } = useMyLoansForDispute();
  const fileDispute = useFileDispute();

  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("payment");
  const [loanId, setLoanId] = useState<string>("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (description.trim().length < 10) return;
    fileDispute.mutate(
      { category, description, loan_id: loanId || undefined },
      {
        onSuccess: () => {
          setDescription("");
          setLoanId("");
          setShowForm(false);
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`h-4 w-4 ${colors.text}`} />
          <h3 className="font-semibold text-[#1B2B3A] dark:text-white">
            Disputes
          </h3>
        </div>
        <Button size="sm" className={`gap-2 text-white ${colors.solid}`} onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" />
          File a Dispute
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Something wrong with a specific loan? File it here — the other party is notified
          immediately and most disputes get resolved directly between you two, with Mpola support
          only a step away if you need us.
        </p>

        {showForm && (
          <div className="space-y-3 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Category
              </label>
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="loan_terms">Loan Terms</SelectItem>
                  <SelectItem value="fraud">Fraud</SelectItem>
                  <SelectItem value="disbursement">Disbursement</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Which loan is this about? (optional)
              </label>
              <Select value={loanId || "none"} onValueChange={(v) => setLoanId(!v || v === "none" ? "" : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Not tied to a specific loan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not tied to a specific loan</SelectItem>
                  {loans?.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {formatCurrency(l.amount)} — {accent === "teal" ? l.lender_name : l.borrower_name} ({l.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Picking a loan notifies the other party on it directly, so you two can try to sort
                it out together first. Without one, this goes straight to Mpola support.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Description
              </label>
              <Textarea
                placeholder="Describe what happened in as much detail as you can (at least 10 characters)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              className={`gap-2 text-white ${colors.solid}`}
              disabled={fileDispute.isPending || description.trim().length < 10}
              onClick={handleSubmit}
            >
              <Send className="h-4 w-4" />
              {fileDispute.isPending ? "Submitting…" : "Submit Dispute"}
            </Button>
          </div>
        )}

        {isLoading ? (
          <CardSkeleton count={2} height="h-24" />
        ) : !disputes?.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No disputes filed.
          </p>
        ) : (
          <StaggerList className="divide-y divide-gray-100 dark:divide-gray-800">
            {disputes.map((d) => (
              <StaggerItem key={d.id}>
                <Link
                  href={`${basePath}/${d.id}`}
                  className="flex items-center gap-3 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {categoryLabel[d.category] ?? d.category}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${statusColor[d.status] ?? ""}`}>
                        {d.status}
                      </Badge>
                      {d.proposal?.status === "pending" && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                          Proposal pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#1B2B3A] dark:text-white line-clamp-1">{d.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {d.respondent_name && <span>With {d.respondent_name}</span>}
                      {d.message_count > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {d.message_count}
                        </span>
                      )}
                      <span>Filed {new Date(d.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />
                </Link>
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </CardContent>
    </Card>
  );
}
