"use client";

import { useState } from "react";
import { HelpCircle, MessageSquare, Plus, Send, Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  useFaqs,
  useMySupportTickets,
  useSupportTicket,
  useCreateSupportTicket,
  useReplySupportTicket,
} from "@/hooks/use-support";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";

const ACCENT = {
  teal: { text: "text-[#2BB5A0]", bg: "bg-[#E8F8F5] dark:bg-[#2BB5A0]/10", solid: "bg-[#2BB5A0] hover:bg-[#239E8C]" },
  gold: { text: "text-[#C4A55A]", bg: "bg-[#F5F0E0] dark:bg-[#C4A55A]/10", solid: "bg-[#C4A55A] hover:bg-[#b3944a]" },
};

const statusColor: Record<string, string> = {
  open: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  in_progress: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  resolved: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export function HelpPageContent({ accent }: { accent: "teal" | "gold" }) {
  const colors = ACCENT[accent];
  const [faqSearch, setFaqSearch] = useState("");
  const { data: faqs, isLoading: faqsLoading } = useFaqs(faqSearch.trim() || undefined);
  const { data: tickets, isLoading } = useMySupportTickets();
  const createTicket = useCreateSupportTicket();

  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  const { data: activeTicket } = useSupportTicket(activeTicketId ?? "");
  const replyTicket = useReplySupportTicket();
  const [reply, setReply] = useState("");

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) return;
    createTicket.mutate(
      { subject, category, message },
      {
        onSuccess: () => {
          setSubject("");
          setMessage("");
          setShowForm(false);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className={`h-4 w-4 ${colors.text}`} />
            <h3 className="font-semibold text-[#1B2B3A] dark:text-white">
              Frequently Asked Questions
            </h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search FAQs..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {faqsLoading ? (
            <CardSkeleton count={2} height="h-14" />
          ) : !faqs?.length ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {faqSearch ? "No FAQs match your search." : "No FAQs available right now."}
            </p>
          ) : (
            <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
              {faqs.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0">
                  <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                    {item.question}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className={`h-4 w-4 ${colors.text}`} />
            <h3 className="font-semibold text-[#1B2B3A] dark:text-white">
              Support Tickets
            </h3>
          </div>
          <Button size="sm" className={`gap-2 text-white ${colors.solid}`} onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showForm && (
            <div className="space-y-3 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <Input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                  <SelectItem value="loan">Loan</SelectItem>
                  <SelectItem value="kyc">KYC / Verification</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Describe your issue..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
              <Button
                className={`gap-2 text-white ${colors.solid}`}
                disabled={createTicket.isPending || !subject.trim() || !message.trim()}
                onClick={handleSubmit}
              >
                <Send className="h-4 w-4" />
                {createTicket.isPending ? "Submitting…" : "Submit Ticket"}
              </Button>
            </div>
          )}

          {isLoading ? (
            <CardSkeleton count={2} height="h-16" />
          ) : !tickets?.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No support tickets yet.
            </p>
          ) : (
            <StaggerList className="divide-y divide-gray-100 dark:divide-gray-800">
              {tickets.map((t) => (
                <StaggerItem key={t.id}>
                <button
                  onClick={() => setActiveTicketId(t.id === activeTicketId ? null : t.id)}
                  className="w-full flex items-center justify-between py-3 text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                      {t.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.message_count} message{t.message_count === 1 ? "" : "s"} ·{" "}
                      {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-xs ${statusColor[t.status] ?? ""}`}>
                    {t.status.replace("_", " ")}
                  </Badge>
                </button>
                </StaggerItem>
              ))}
            </StaggerList>
          )}

          {activeTicket && (
            <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
              <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                {activeTicket.subject}
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activeTicket.messages?.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-lg p-3 text-sm ${
                      m.is_admin
                        ? "bg-gray-50 dark:bg-gray-800 mr-8"
                        : `${colors.bg} ml-8`
                    }`}
                  >
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      {m.is_admin ? "Mpola Support" : "You"}
                    </p>
                    <p className="text-[#1B2B3A] dark:text-white">{m.message}</p>
                  </div>
                ))}
              </div>
              {activeTicket.status !== "closed" && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a reply..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <Button
                    className={`text-white ${colors.solid}`}
                    disabled={!reply.trim() || replyTicket.isPending}
                    onClick={() => {
                      replyTicket.mutate(
                        { id: activeTicket.id, message: reply },
                        { onSuccess: () => setReply("") },
                      );
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
