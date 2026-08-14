"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CardSkeleton } from "@/components/skeletons";
import {
  useAdminSupportTicketDetail,
  useReplyAdminSupportTicket,
  useUpdateSupportTicketStatus,
} from "@/hooks/use-admin";

const statusColor: Record<string, string> = {
  open: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  in_progress: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  resolved: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const categoryLabel: Record<string, string> = {
  general: "General",
  wallet: "Wallet",
  loan: "Loan",
  kyc: "KYC",
  bug: "Bug",
  other: "Other",
};

export default function AdminSupportTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: ticket, isLoading } = useAdminSupportTicketDetail(id);
  const reply = useReplyAdminSupportTicket(id);
  const updateStatus = useUpdateSupportTicketStatus(id);

  const [messageText, setMessageText] = useState("");

  if (isLoading || !ticket) {
    return (
      <div className="space-y-6">
        <Link href="/admin/support" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#2BB5A0]">
          <ArrowLeft className="h-4 w-4" /> Back to Support Tickets
        </Link>
        <CardSkeleton count={2} height="h-32" />
      </div>
    );
  }

  const isClosed = ticket.status === "closed";

  const handleSendReply = () => {
    if (!messageText.trim()) return;
    reply.mutate(messageText.trim(), { onSuccess: () => setMessageText("") });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/admin/support" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#2BB5A0]">
        <ArrowLeft className="h-4 w-4" /> Back to Support Tickets
      </Link>

      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {categoryLabel[ticket.category] ?? ticket.category}
            </Badge>
            <Badge variant="outline" className={`text-xs ${statusColor[ticket.status] ?? ""}`}>
              {ticket.status.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">{ticket.subject}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <span>Filed by {ticket.username ?? "—"}</span>
            <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <h3 className="font-semibold text-[#1B2B3A] dark:text-white text-sm">Conversation</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {!ticket.messages?.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">No messages yet.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {ticket.messages.map((m) => (
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

          {!isClosed && (
            <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <Textarea
                placeholder="Reply to this ticket..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button
                className="gap-2 text-white bg-[#2BB5A0] hover:bg-[#239385] shrink-0"
                disabled={reply.isPending || !messageText.trim()}
                onClick={handleSendReply}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <h3 className="font-semibold text-[#1B2B3A] dark:text-white text-sm">Status</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              className="gap-2 text-white bg-emerald-500 hover:bg-emerald-600"
              disabled={updateStatus.isPending || ticket.status === "resolved"}
              onClick={() => updateStatus.mutate("resolved")}
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark Resolved
            </Button>
            <Button
              variant="outline"
              className="gap-2 text-gray-600 hover:text-gray-700"
              disabled={updateStatus.isPending || ticket.status === "closed"}
              onClick={() => updateStatus.mutate("closed")}
            >
              <XCircle className="h-4 w-4" />
              Close
            </Button>
            {ticket.status !== "open" && (
              <Button
                variant="outline"
                className="gap-2 text-amber-600 hover:text-amber-700"
                disabled={updateStatus.isPending}
                onClick={() => updateStatus.mutate("open")}
              >
                <RotateCcw className="h-4 w-4" />
                Reopen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
