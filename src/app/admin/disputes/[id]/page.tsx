"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, HandCoins, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CardSkeleton } from "@/components/skeletons";
import { useAdminDisputeDetail, useResolveDispute } from "@/hooks/use-admin";
import { usePostDisputeMessage } from "@/hooks/use-support";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

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

export default function AdminDisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: dispute, isLoading } = useAdminDisputeDetail(id);
  const postMessage = usePostDisputeMessage(id);
  const resolve = useResolveDispute(id);

  const [messageText, setMessageText] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [settleAmount, setSettleAmount] = useState("");
  const [settlePayer, setSettlePayer] = useState<"filer" | "respondent">("filer");

  if (isLoading || !dispute) {
    return (
      <div className="space-y-6">
        <Link href="/admin/disputes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#2BB5A0]">
          <ArrowLeft className="h-4 w-4" /> Back to Disputes
        </Link>
        <CardSkeleton count={2} height="h-32" />
      </div>
    );
  }

  const isClosed = dispute.status === "resolved" || dispute.status === "rejected";

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    postMessage.mutate(messageText.trim(), { onSuccess: () => setMessageText("") });
  };

  const doResolve = (status: "investigating" | "resolved" | "rejected", withSettlement: boolean) => {
    if (status === "resolved" && !resolutionNote.trim()) {
      toast.error("Add a resolution note first.");
      return;
    }
    const amount = withSettlement && settleAmount ? Number(settleAmount) : undefined;
    if (withSettlement && amount) {
      if (!confirm(`Move ${formatCurrency(amount)} from the ${settlePayer} to the other party as part of resolving this?`)) return;
    }
    resolve.mutate({
      status,
      resolutionNote: resolutionNote.trim() || undefined,
      settlementAmount: amount,
      settlementPayer: amount ? settlePayer : undefined,
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/admin/disputes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#2BB5A0]">
        <ArrowLeft className="h-4 w-4" /> Back to Disputes
      </Link>

      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {categoryLabel[dispute.category] ?? dispute.category}
            </Badge>
            <Badge variant="outline" className={`text-xs ${statusColor[dispute.status] ?? ""}`}>
              {dispute.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[#1B2B3A] dark:text-white">{dispute.description}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <span>Filed by {dispute.filer_name ?? "—"}</span>
            {dispute.respondent_name && <span>Against {dispute.respondent_name}</span>}
            <span>{new Date(dispute.created_at).toLocaleDateString()}</span>
          </div>
          {dispute.proposal && (
            <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900 px-3 py-2 text-xs text-purple-700 dark:text-purple-400">
              <span className="font-semibold">
                {dispute.proposal.status === "pending" ? "Pending proposal" : `Proposal ${dispute.proposal.status}`}
              </span>{" "}
              from {dispute.proposal.proposed_by_name ?? "—"}: &ldquo;{dispute.proposal.note}&rdquo;
              {!!dispute.proposal.settlement_amount && (
                <> — {formatCurrency(dispute.proposal.settlement_amount)} from {dispute.proposal.settlement_payer_name ?? "—"}</>
              )}
            </div>
          )}
          {isClosed && (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm">
              <p className="font-medium text-[#1B2B3A] dark:text-white">
                {dispute.status === "resolved" ? "Resolved" : "Rejected"}
                {dispute.resolved_by ? ` by ${dispute.resolved_by}` : ""}
              </p>
              {dispute.resolution_note && (
                <p className="text-muted-foreground mt-1">{dispute.resolution_note}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <h3 className="font-semibold text-[#1B2B3A] dark:text-white text-sm">Conversation</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {!dispute.messages?.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">No messages yet.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {dispute.messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl px-4 py-2.5 ${
                    m.is_admin
                      ? "bg-[#2BB5A0]/10 border border-[#2BB5A0]/30"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                    {m.is_admin ? "Mpola Support (you)" : m.sender_name ?? "—"}
                  </p>
                  <p className="text-sm text-[#1B2B3A] dark:text-white whitespace-pre-wrap">{m.message}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Textarea
              placeholder="Message both parties..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={2}
              className="flex-1"
            />
            <Button
              className="gap-2 text-white bg-[#2BB5A0] hover:bg-[#239385] shrink-0"
              disabled={postMessage.isPending || !messageText.trim()}
              onClick={handleSendMessage}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {!isClosed && (
        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <h3 className="font-semibold text-[#1B2B3A] dark:text-white text-sm">Resolve</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Resolution note — shown to both parties"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              rows={3}
            />

            {dispute.respondent_id && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Money settlement (optional) — moves real funds between their wallets
                </label>
                <Input
                  type="number"
                  placeholder="UGX amount — leave blank if none"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                />
                {!!settleAmount && Number(settleAmount) > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSettlePayer("filer")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        settlePayer === "filer"
                          ? "bg-[#2BB5A0] border-[#2BB5A0] text-white"
                          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {dispute.filer_name ?? "Filer"} pays
                    </button>
                    <button
                      onClick={() => setSettlePayer("respondent")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        settlePayer === "respondent"
                          ? "bg-[#2BB5A0] border-[#2BB5A0] text-white"
                          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {dispute.respondent_name ?? "Respondent"} pays
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                className="gap-2 text-white bg-emerald-500 hover:bg-emerald-600"
                disabled={resolve.isPending}
                onClick={() => doResolve("resolved", true)}
              >
                <CheckCircle2 className="h-4 w-4" />
                {settleAmount ? "Resolve with Settlement" : "Resolve"}
              </Button>
              <Button
                variant="outline"
                className="gap-2 text-red-600 hover:text-red-700"
                disabled={resolve.isPending}
                onClick={() => doResolve("rejected", false)}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
              {dispute.status !== "investigating" && (
                <Button
                  variant="outline"
                  className="gap-2 text-amber-600 hover:text-amber-700"
                  disabled={resolve.isPending}
                  onClick={() => doResolve("investigating", false)}
                >
                  <HandCoins className="h-4 w-4" />
                  Mark Investigating
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
