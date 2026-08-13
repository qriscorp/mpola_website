"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, ShieldAlert, HandCoins, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CardSkeleton } from "@/components/skeletons";
import { useUser } from "@/hooks/use-dashboard";
import {
  useDispute,
  usePostDisputeMessage,
  useProposeDisputeResolution,
  useRespondToDisputeProposal,
  useEscalateDispute,
} from "@/hooks/use-support";
import { formatCurrency } from "@/lib/format";

const ACCENT = {
  teal: { text: "text-[#2BB5A0]", solid: "bg-[#2BB5A0] hover:bg-[#239E8C]", bubble: "bg-[#2BB5A0] text-white" },
  gold: { text: "text-[#C4A55A]", solid: "bg-[#C4A55A] hover:bg-[#b3944a]", bubble: "bg-[#C4A55A] text-white" },
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

export function DisputeDetailContent({
  disputeId,
  accent,
  backHref,
}: {
  disputeId: string;
  accent: "teal" | "gold";
  backHref: string;
}) {
  const colors = ACCENT[accent];
  const { data: user } = useUser();
  const { data: dispute, isLoading } = useDispute(disputeId);
  const postMessage = usePostDisputeMessage(disputeId);
  const propose = useProposeDisputeResolution(disputeId);
  const respond = useRespondToDisputeProposal(disputeId);
  const escalate = useEscalateDispute(disputeId);

  const [messageText, setMessageText] = useState("");
  const [showProposeForm, setShowProposeForm] = useState(false);
  const [proposalNote, setProposalNote] = useState("");
  const [settlementAmount, setSettlementAmount] = useState("");
  const [payer, setPayer] = useState<"self" | "other">("self");

  if (isLoading || !dispute) {
    return (
      <div className="space-y-6">
        <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#2BB5A0]">
          <ArrowLeft className="h-4 w-4" /> Back to Disputes
        </Link>
        <CardSkeleton count={2} height="h-32" />
      </div>
    );
  }

  const isFiler = user?.id === dispute.user_id;
  const isClosed = dispute.status === "resolved" || dispute.status === "rejected";
  const hasCounterparty = !!dispute.respondent_id;
  const proposalIsMine = dispute.proposal?.proposed_by_id === user?.id;

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    postMessage.mutate(messageText.trim(), { onSuccess: () => setMessageText("") });
  };

  const handlePropose = () => {
    if (proposalNote.trim().length < 1) return;
    const amount = settlementAmount ? Number(settlementAmount) : undefined;
    propose.mutate(
      { note: proposalNote.trim(), settlementAmount: amount, payer },
      {
        onSuccess: () => {
          setProposalNote("");
          setSettlementAmount("");
          setShowProposeForm(false);
        },
      },
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#2BB5A0]">
        <ArrowLeft className="h-4 w-4" /> Back to Disputes
      </Link>

      <Card>
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
            <span>Filed by {isFiler ? "you" : dispute.filer_name ?? "—"}</span>
            {hasCounterparty && (
              <span>With {dispute.respondent_id === user?.id ? "you" : dispute.respondent_name ?? "—"}</span>
            )}
            <span>{new Date(dispute.created_at).toLocaleDateString()}</span>
          </div>

          {dispute.status === "investigating" && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              This dispute has been escalated to Mpola support — an admin will review it and can
              still see everything discussed here.
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

      {!isClosed && hasCounterparty && dispute.proposal?.status === "pending" && (
        <Card className="border-purple-200 dark:border-purple-900">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <HandCoins className={`h-4 w-4 ${colors.text}`} />
              <h3 className="font-semibold text-[#1B2B3A] dark:text-white">
                {proposalIsMine ? "Your proposal" : `${dispute.proposal.proposed_by_name ?? "The other party"} proposed a resolution`}
              </h3>
            </div>
            <p className="text-sm text-[#1B2B3A] dark:text-white">{dispute.proposal.note}</p>
            {!!dispute.proposal.settlement_amount && (
              <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                Settlement: {formatCurrency(dispute.proposal.settlement_amount)} — paid by{" "}
                {dispute.proposal.settlement_payer_id === user?.id ? "you" : dispute.proposal.settlement_payer_name ?? "—"}
              </p>
            )}
            {proposalIsMine ? (
              <p className="text-xs text-muted-foreground">
                Waiting for the other party to accept or decline.
              </p>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className={`gap-2 text-white ${colors.solid}`}
                  disabled={respond.isPending}
                  onClick={() => respond.mutate(true)}
                >
                  <Check className="h-4 w-4" /> Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 text-red-600 hover:text-red-700"
                  disabled={respond.isPending}
                  onClick={() => respond.mutate(false)}
                >
                  <X className="h-4 w-4" /> Decline
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!isClosed && hasCounterparty && dispute.proposal?.status !== "pending" && (
        <Card>
          <CardContent className="p-5 space-y-3">
            {!showProposeForm ? (
              <Button variant="outline" className="gap-2" onClick={() => setShowProposeForm(true)}>
                <HandCoins className="h-4 w-4" /> Propose a Resolution
              </Button>
            ) : (
              <div className="space-y-3">
                <h3 className="font-semibold text-[#1B2B3A] dark:text-white text-sm">
                  Propose a resolution
                </h3>
                <Textarea
                  placeholder="What do you propose? e.g. 'I'll resend the missing repayment receipt' or 'I'll cover the difference'"
                  value={proposalNote}
                  onChange={(e) => setProposalNote(e.target.value)}
                  rows={3}
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Money settlement (optional)
                  </label>
                  <Input
                    type="number"
                    placeholder="UGX amount — leave blank if none"
                    value={settlementAmount}
                    onChange={(e) => setSettlementAmount(e.target.value)}
                  />
                </div>
                {!!settlementAmount && Number(settlementAmount) > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPayer("self")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        payer === "self"
                          ? `${colors.solid} border-transparent text-white`
                          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      I&apos;ll pay
                    </button>
                    <button
                      onClick={() => setPayer("other")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        payer === "other"
                          ? `${colors.solid} border-transparent text-white`
                          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      They pay
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className={`gap-2 text-white ${colors.solid}`}
                    disabled={propose.isPending || proposalNote.trim().length < 1}
                    onClick={handlePropose}
                  >
                    <Send className="h-4 w-4" /> Send Proposal
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowProposeForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#1B2B3A] dark:text-white text-sm">Messages</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {!dispute.messages?.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No messages yet — say what happened.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {dispute.messages.map((m) => {
                const mine = m.sender_id === user?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      mine
                        ? colors.bubble
                        : m.is_admin
                          ? "bg-purple-50 dark:bg-purple-900/20 text-[#1B2B3A] dark:text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-[#1B2B3A] dark:text-white"
                    }`}>
                      <p className="text-[11px] font-semibold opacity-70 mb-0.5">
                        {mine ? "You" : m.is_admin ? "Mpola Support" : m.sender_name ?? "—"}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                      <p className="text-[10px] opacity-60 mt-1">
                        {new Date(m.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isClosed && (
            <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <Textarea
                placeholder="Write a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button
                className={`gap-2 text-white shrink-0 ${colors.solid}`}
                disabled={postMessage.isPending || !messageText.trim()}
                onClick={handleSendMessage}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {!isClosed && dispute.status === "open" && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="gap-2 text-amber-600 hover:text-amber-700 border-amber-200 hover:border-amber-300"
            disabled={escalate.isPending}
            onClick={() => escalate.mutate()}
          >
            <ShieldAlert className="h-4 w-4" />
            Not resolving this together? Escalate to Mpola Support
          </Button>
        </div>
      )}
    </div>
  );
}
